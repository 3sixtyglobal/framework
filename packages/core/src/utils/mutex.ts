// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { MessagePort } from "node:worker_threads";
import { nameof } from "@twin.org/nameof";
import { Guards } from "./guards.js";
import { Is } from "./is.js";
import { SharedStore } from "./sharedStore.js";
import { GeneralError } from "../errors/generalError.js";
import type { IMutexWaiter } from "../models/IMutexWaiter.js";
import type { IMutexWorkerMessage } from "../models/IMutexWorkerMessage.js";
import { MutexMessageTypes } from "../models/mutexMessageTypes.js";

/**
 * A cross-thread mutex built on Atomics and SharedArrayBuffer.
 *
 * The static methods are a facade over a single instance held in the SharedStore, so every
 * load of this package on a thread shares one set of registries. Each thread has its own
 * instance; the mutual exclusion between threads comes from the SharedArrayBuffer behind
 * each key, not from the instance itself.
 *
 * When isMainThread is true (main thread or fork-mode child process) the instance acts as
 * the authoritative registry: it creates a SharedArrayBuffer-backed Int32Array for each
 * key on first use. An entry is discarded once the key is idle, so a workload which touches
 * many distinct keys does not grow the registry without bound. A key which has been handed
 * to a worker thread is retained for the life of the process, because the worker caches the
 * Int32Array it was given and re-creating the buffer would hand two threads different memory
 * for the same key, silently breaking mutual exclusion.
 *
 * When isMainThread is false (a true worker thread) the instance synchronously negotiates
 * the shared buffer with the main thread on first use of each key, then caches it locally.
 * The main thread must call Mutex.handleWorkerMessage(msg) from its worker message handler
 * before that worker first calls Mutex.lock().
 *
 * Callers on the same thread are served in the order they arrived. Each key has a FIFO
 * queue of waiters, unlock() hands the lock directly to the waiter at the front, and a new
 * caller only takes the lock outright when that queue is empty. Without this a caller that
 * arrives while a waiter is being woken can take the lock first, which lets a busy key
 * starve a waiter until its timeout elapses. Threads still contend with each other for the
 * shared lock, so the ordering guarantee is per thread rather than global.
 *
 * The lock is not re-entrant: a thread that already holds a key and calls lock() again on
 * the same key will block until the timeout elapses.
 */
export class Mutex {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<Mutex>();

	/**
	 * SharedStore key for the per-thread instance which owns all of the lock state.
	 * @internal
	 */
	private static readonly _INSTANCE_KEY = "mutex";

	/**
	 * The default timeout in milliseconds used when a caller does not supply one.
	 * @internal
	 */
	private static readonly _DEFAULT_TIMEOUT_MS = 5000;

	/**
	 * How many new registry entries may be created before unlock() sweeps the idle ones. The
	 * sweep is driven by creations rather than by every unlock so a key which is locked
	 * repeatedly does not have its buffer discarded and re-allocated on each use.
	 * @internal
	 */
	private static readonly _RECLAIM_THRESHOLD = 1024;

	/**
	 * How long the watch task waits on the shared lock before re-reading the queue, in
	 * milliseconds. It only bounds how quickly the task notices that the queue has drained,
	 * releases from other threads wake it immediately.
	 * @internal
	 */
	private static readonly _WATCH_TIMEOUT_MS = 250;

	/**
	 * Sparse map from lock key to the Int32Array guarding it. A Map rather than an object so
	 * that keys which collide with object prototype members, such as __proto__, are stored
	 * and retrieved as ordinary keys.
	 * @internal
	 */
	private readonly _locks: Map<string, Int32Array>;

	/**
	 * Map from lock key to the FIFO queue of callers waiting on it.
	 * @internal
	 */
	private readonly _waiters: Map<string, IMutexWaiter[]>;

	/**
	 * Map from lock key to the watch task currently running for it.
	 * @internal
	 */
	private readonly _watchers: Map<string, Promise<void>>;

	/**
	 * Keys whose buffer has been handed to a worker thread and so can never be reclaimed.
	 * @internal
	 */
	private readonly _workerShared: Set<string>;

	/**
	 * The number of registry entries created since the last sweep.
	 * @internal
	 */
	private _createdSinceSweep: number;

	/**
	 * The default timeout in milliseconds for lock acquisition.
	 * @internal
	 */
	private _defaultTimeoutMs: number;

	/**
	 * Cached reference to the node:worker_threads module, null if unavailable (browser).
	 * @internal
	 */
	// false positive: this is a type not an actual import
	// eslint-disable-next-line @typescript-eslint/consistent-type-imports
	private _workerThreadsModule: typeof import("node:worker_threads") | null | undefined;

	/**
	 * Create a new instance of Mutex. Private so that all callers go through the shared
	 * instance, which is what makes the registries consistent across package loads.
	 * @internal
	 */
	private constructor() {
		this._locks = new Map();
		this._waiters = new Map();
		this._watchers = new Map();
		this._workerShared = new Set();
		this._createdSinceSweep = 0;
		this._defaultTimeoutMs = Mutex._DEFAULT_TIMEOUT_MS;
		this._workerThreadsModule = undefined;
	}

	/**
	 * Gets the default timeout in milliseconds for lock acquisition.
	 * @returns The default timeout in milliseconds.
	 */
	public static getDefaultTimeoutMs(): number {
		return Mutex.instance().getDefaultTimeoutMs();
	}

	/**
	 * Sets the default timeout in milliseconds for lock acquisition.
	 * @param timeoutMs The default timeout in milliseconds.
	 * @throws GeneralError if timeoutMs is not a non-negative integer.
	 */
	public static setDefaultTimeoutMs(timeoutMs: number): void {
		Mutex.instance().setDefaultTimeoutMs(timeoutMs);
	}

	/**
	 * Acquires a lock for the given key without blocking the event loop. If the lock is already
	 * held, it suspends the current async task until the lock is released or the timeout is reached.
	 * Use this in async single-threaded contexts (e.g. the main thread or a Fastify route handler)
	 * where calling the synchronous lock() would freeze the event loop and deadlock.
	 * Callers on the same thread are served in the order they arrived, so a contended key
	 * cannot starve an earlier caller.
	 * The lock is not re-entrant: if the same context holds the key and calls lockAsync() again on
	 * the same key, it will suspend until the timeout elapses.
	 * @param key The key to lock on.
	 * @param options Lock options.
	 * @param options.timeoutMs The maximum time to wait for the lock in milliseconds, defaults to getDefaultTimeoutMs().
	 * @param options.throwOnTimeout Whether to throw an error if the lock could not be acquired within the timeout, default is false.
	 * @returns True if the lock was acquired, false if it timed out and throwOnTimeout is false.
	 * @throws GeneralError if the key is invalid or if the lock could not be acquired within the timeout and throwOnTimeout is true.
	 */
	public static async lock(
		key: string,
		options?: { timeoutMs?: number; throwOnTimeout?: boolean }
	): Promise<boolean> {
		return Mutex.instance().lock(key, options);
	}

	/**
	 * Releases the lock for the given key.
	 * @param key The key to unlock.
	 * @throws GeneralError if the key is invalid or the lock is not currently held.
	 */
	public static unlock(key: string): void {
		Mutex.instance().unlock(key);
	}

	/**
	 * Inspect a message received from a worker and, if it is a Mutex buffer-fetch request,
	 * respond to it synchronously. Call from the main thread's worker message handler.
	 * @param msg The raw message received from the worker.
	 * @returns True if the message was a Mutex protocol message and was handled, false otherwise.
	 */
	public static handleWorkerMessage(msg: unknown): boolean {
		return Mutex.instance().handleWorkerMessage(msg);
	}

	/**
	 * Get the instance which owns the lock state for this thread, creating it if it does not
	 * exist. It lives in the SharedStore so that separate loads of this package on the same
	 * thread operate on the same registries.
	 * @returns The shared instance.
	 * @internal
	 */
	private static instance(): Mutex {
		return SharedStore.get<Mutex>(Mutex._INSTANCE_KEY, () => new Mutex());
	}

	/**
	 * Gets the default timeout in milliseconds for lock acquisition.
	 * @returns The default timeout in milliseconds.
	 * @internal
	 */
	public getDefaultTimeoutMs(): number {
		return this._defaultTimeoutMs;
	}

	/**
	 * Sets the default timeout in milliseconds for lock acquisition.
	 * @param timeoutMs The default timeout in milliseconds.
	 * @throws GeneralError if timeoutMs is not a non-negative integer.
	 * @internal
	 */
	public setDefaultTimeoutMs(timeoutMs: number): void {
		Guards.integer(Mutex.CLASS_NAME, nameof(timeoutMs), timeoutMs);
		if (timeoutMs < 0) {
			throw new GeneralError(Mutex.CLASS_NAME, "invalidTimeout", { timeoutMs });
		}
		this._defaultTimeoutMs = timeoutMs;
	}

	/**
	 * Acquires a lock for the given key without blocking the event loop.
	 * @param key The key to lock on.
	 * @param options Lock options.
	 * @param options.timeoutMs The maximum time to wait for the lock in milliseconds.
	 * @param options.throwOnTimeout Whether to throw an error if the lock could not be acquired.
	 * @returns True if the lock was acquired, false if it timed out and throwOnTimeout is false.
	 * @throws GeneralError if the key is invalid or if the lock could not be acquired within the timeout and throwOnTimeout is true.
	 * @internal
	 */
	public async lock(
		key: string,
		options?: { timeoutMs?: number; throwOnTimeout?: boolean }
	): Promise<boolean> {
		Guards.stringValue(Mutex.CLASS_NAME, nameof(key), key);
		if (!Is.empty(options?.timeoutMs)) {
			Guards.integer(Mutex.CLASS_NAME, nameof(options.timeoutMs), options.timeoutMs);
			if (options.timeoutMs < 0) {
				throw new GeneralError(Mutex.CLASS_NAME, "invalidTimeout", {
					timeoutMs: options.timeoutMs
				});
			}
		}

		const timeoutMs = options?.timeoutMs ?? this._defaultTimeoutMs;
		const throwOnTimeout = options?.throwOnTimeout ?? false;
		const deadline = Date.now() + timeoutMs;

		// getOrFetchLock may block once per key on worker threads to negotiate the
		// shared buffer with the main thread; that one-time fetch is acceptable here.
		const lock = await this.getOrFetchLock(key, deadline);

		// Atomically swap 0 → 1; if the previous value was 0 we acquired the lock. Only take
		// it outright when nothing on this thread is already queued, otherwise this caller
		// would barge in front of waiters that arrived earlier. The queue is read rather than
		// created here, an uncontended caller must not leave an empty queue behind.
		const queued = this.getWaiter(key)?.length ?? 0;
		if (queued === 0 && Atomics.compareExchange(lock, 0, 0, 1) === 0) {
			return true;
		}

		if (deadline - Date.now() <= 0) {
			if (throwOnTimeout) {
				throw new GeneralError(Mutex.CLASS_NAME, "lockTimeout", { key, timeoutMs });
			}
			return false;
		}

		// Join the back of the queue and suspend without blocking the event loop, so the
		// holder's async continuations can run and eventually call unlock(). The lock is
		// handed over either by unlock() on this thread or by the watch task below when
		// another thread releases it.
		const waiter: IMutexWaiter = { settled: false };
		const granted = new Promise<boolean>(resolve => {
			waiter.resolve = resolve;
		});
		this.getQueue(key).push(waiter);

		// The deadline is enforced by a timer rather than only by the atomic wait, so a
		// congested event loop cannot stretch the wait well beyond the requested timeout.
		waiter.timer = setTimeout(() => this.settleWaiter(key, waiter, false), deadline - Date.now());

		this.startWatching(key, lock);

		if (await granted) {
			return true;
		}

		if (throwOnTimeout) {
			throw new GeneralError(Mutex.CLASS_NAME, "lockTimeout", { key, timeoutMs });
		}
		return false;
	}

	/**
	 * Releases the lock for the given key.
	 * @param key The key to unlock.
	 * @throws GeneralError if the key is invalid or the lock is not currently held.
	 * @internal
	 */
	public unlock(key: string): void {
		Guards.stringValue(Mutex.CLASS_NAME, nameof(key), key);

		const lock = this._locks.get(key);
		if (Is.empty(lock)) {
			throw new GeneralError(Mutex.CLASS_NAME, "lockNotFound", { key });
		}

		const previous = Atomics.compareExchange(lock, 0, 1, 0);
		if (previous !== 1) {
			throw new GeneralError(Mutex.CLASS_NAME, "lockAlreadyReleased", { key });
		}

		// Hand the lock straight to the caller at the front of this thread's queue. Nothing
		// else on this thread can run between the release above and the re-acquire below, so
		// no later caller can see the released state and take it first.
		const next = this.getWaiter(key)?.[0];
		if (!Is.empty(next) && Atomics.compareExchange(lock, 0, 0, 1) === 0) {
			this.settleWaiter(key, next, true);
			return;
		}

		Atomics.notify(lock, 0, 1);

		if (this._createdSinceSweep >= Mutex._RECLAIM_THRESHOLD) {
			this.sweepLocks();
		}
	}

	/**
	 * Inspect a message received from a worker and, if it is a Mutex buffer-fetch request,
	 * respond to it synchronously.
	 * @param msg The raw message received from the worker.
	 * @returns True if the message was a Mutex protocol message and was handled, false otherwise.
	 * @internal
	 */
	public handleWorkerMessage(msg: unknown): boolean {
		if (!Is.object<IMutexWorkerMessage>(msg) || msg.type !== MutexMessageTypes.GetBuffer) {
			return false;
		}

		Guards.stringValue(Mutex.CLASS_NAME, nameof(msg.key), msg.key);
		Guards.object<SharedArrayBuffer>(Mutex.CLASS_NAME, nameof(msg.signal), msg.signal);
		Guards.object<MessagePort>(Mutex.CLASS_NAME, nameof(msg.port), msg.port);

		let lock = this._locks.get(msg.key);
		if (Is.empty(lock)) {
			lock = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
			this._locks.set(msg.key, lock);
		}
		// The worker caches the buffer it is about to receive, so this key can never be
		// reclaimed: a replacement buffer would not be the memory the worker is locking on.
		this._workerShared.add(msg.key);
		// Send the buffer before updating the signal so it is guaranteed to be in
		// port1's receive queue when Atomics.wait returns on the worker side.
		msg.port.postMessage({ buffer: lock.buffer });
		// Set signal[0] = 1 before notifying. If the OS scheduled the main thread
		// to process this request before the worker reached Atomics.wait, the notify
		// would fire with no waiters (lost wakeup). Setting the value first means
		// Atomics.wait(signal, 0, 0) sees a non-zero value and returns "not-equal"
		// immediately instead of blocking indefinitely.
		const signalArr = new Int32Array(msg.signal);
		Atomics.store(signalArr, 0, 1);
		Atomics.notify(signalArr, 0, 1);
		msg.port.close();

		return true;
	}

	/**
	 * Returns the Int32Array for the given key, fetching it from the main thread if this
	 * is a worker thread and the key is not yet in the local cache.
	 * @param key The lock key.
	 * @param deadline The deadline to use while waiting for the main thread to provide the lock.
	 * @returns The Int32Array backed by a SharedArrayBuffer for this key.
	 * @internal
	 */
	private async getOrFetchLock(key: string, deadline: number): Promise<Int32Array> {
		const existing = this._locks.get(key);
		if (!Is.empty(existing)) {
			return existing;
		}

		const wt = await this.loadWorkerThreads();

		// Re-check after the await: another coroutine that was also waiting on
		// loadWorkerThreads() may have allocated the buffer while we yielded.
		const created = this._locks.get(key);
		if (!Is.empty(created)) {
			return created;
		}

		if (Is.empty(wt) || wt.isMainThread) {
			// Main thread, fork-mode process, or browser: own the registry entry.
			const lock = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
			this._locks.set(key, lock);
			// Only entries this thread owns are reclaimable, so only those are counted towards
			// the next sweep. A worker's entry is a cache of the main thread's buffer.
			this._createdSinceSweep++;
			return lock;
		}

		// Worker thread: synchronously request the SharedArrayBuffer from the main thread.
		// Mutex.handleWorkerMessage(msg) must be called on the main thread's worker message handler.
		if (Is.empty(wt.parentPort)) {
			throw new GeneralError(Mutex.CLASS_NAME, "bufferFetchFailed", { key });
		}

		const { port1, port2 } = new wt.MessageChannel();
		const signal = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));

		const msg: IMutexWorkerMessage = {
			type: MutexMessageTypes.GetBuffer,
			key,
			signal: signal.buffer,
			port: port2
		};

		wt.parentPort.postMessage(msg, [port2]);

		try {
			// Block until the main thread signals readiness. The main thread sets
			// signal[0] = 1 before calling notify, so if the notify fired before this
			// wait call (lost-wakeup scenario with concurrent workers), Atomics.wait
			// sees a non-zero value and returns "not-equal" immediately.
			// Either way the port message is already in port1's receive queue.
			// Use the lock deadline so the buffer fetch is bounded by the same timeout.
			const waitResult = Atomics.wait(signal, 0, 0, Math.max(0, deadline - Date.now()));
			if (waitResult === "timed-out") {
				throw new GeneralError(Mutex.CLASS_NAME, "bufferFetchFailed", { key });
			}

			const response = wt.receiveMessageOnPort(port1) as {
				message: { buffer: SharedArrayBuffer };
			} | null;

			if (Is.empty(response)) {
				throw new GeneralError(Mutex.CLASS_NAME, "bufferFetchFailed", { key });
			}

			const fetched = new Int32Array(response.message.buffer);
			this._locks.set(key, fetched);
			return fetched;
		} finally {
			port1.close();
		}
	}

	/**
	 * Settle a queued waiter, remove it from the queue and resume its caller.
	 * @param key The lock key.
	 * @param waiter The waiter to settle.
	 * @param granted True when the waiter has been handed the lock and now owns it.
	 * @internal
	 */
	private settleWaiter(key: string, waiter: IMutexWaiter, granted: boolean): void {
		if (waiter.settled) {
			return;
		}
		waiter.settled = true;

		if (!Is.empty(waiter.timer)) {
			clearTimeout(waiter.timer);
			waiter.timer = undefined;
		}

		const queue = this.getWaiter(key);
		const index = queue?.indexOf(waiter) ?? -1;
		if (Is.notEmpty(queue) && index >= 0) {
			queue.splice(index, 1);
			// Drop the queue as soon as it drains, otherwise the registry retains an empty
			// array for every key that has ever been contended.
			if (queue.length === 0) {
				this._waiters.delete(key);
			}
		}

		waiter.resolve?.(granted);
	}

	/**
	 * Start the watch task for a key if one is not already running.
	 * @param key The lock key.
	 * @param lock The shared lock for the key.
	 * @internal
	 */
	private startWatching(key: string, lock: Int32Array): void {
		if (!this._watchers.has(key)) {
			this._watchers.set(key, this.runWatcher(key, lock));
		}
	}

	/**
	 * Run the watch task for a key and clear its registry entry once it ends. The entry is
	 * only cleared after an await, so it cannot be removed before startWatching has recorded
	 * it, even when the task itself completes without suspending.
	 * @param key The lock key.
	 * @param lock The shared lock for the key.
	 * @returns A promise that resolves when the task ends.
	 * @internal
	 */
	private async runWatcher(key: string, lock: Int32Array): Promise<void> {
		try {
			await this.watchQueue(key, lock);
		} finally {
			this._watchers.delete(key);
		}
	}

	/**
	 * Watch the shared lock for a key and hand it to the waiter at the front of the queue.
	 * This covers releases from other threads, a release on this thread hands the lock over
	 * directly in unlock(). The task ends once the queue for the key has drained.
	 * @param key The lock key.
	 * @param lock The shared lock for the key.
	 * @returns A promise that resolves when the task ends.
	 * @internal
	 */
	private async watchQueue(key: string, lock: Int32Array): Promise<void> {
		for (;;) {
			// Re-read the front of the queue on every pass, waiters that reached their
			// deadline have already removed themselves.
			const head = this.getWaiter(key)?.[0];
			if (Is.empty(head)) {
				return;
			}

			if (Atomics.compareExchange(lock, 0, 0, 1) === 0) {
				this.settleWaiter(key, head, true);
			} else {
				const waitResult = Atomics.waitAsync(lock, 0, 1, Mutex._WATCH_TIMEOUT_MS);
				if (waitResult.async) {
					await waitResult.value;
				}
			}
		}
	}

	/**
	 * Discard the registry entry for every key which is idle, so a workload that touches many
	 * distinct keys does not retain a SharedArrayBuffer for each one. Driven by the number of
	 * entries created rather than by every unlock, so a key which is locked repeatedly keeps
	 * its buffer instead of re-allocating one per use.
	 * @internal
	 */
	private sweepLocks(): void {
		this._createdSinceSweep = 0;

		// Only the authoritative registry may discard a buffer. On a true worker thread the
		// entry is a local cache of the main thread's buffer, and dropping it would only force
		// a blocking re-fetch of the same memory.
		const wt = this._workerThreadsModule;
		if (Is.undefined(wt) || (Is.notEmpty(wt) && !wt.isMainThread)) {
			return;
		}

		for (const [key, lock] of [...this._locks]) {
			// A key is retained when any of the following holds:
			// - a worker caches the Int32Array it was handed, so once a key has crossed a thread
			//   boundary its buffer must live for the process;
			// - the lock is held, so the entry is in use;
			// - a caller is queued on it, or a watch task is still running. The watch task clears
			//   its own entry only after the queue has drained, so both are checked.
			const inUse =
				this._workerShared.has(key) ||
				Atomics.load(lock, 0) !== 0 ||
				(this.getWaiter(key)?.length ?? 0) > 0 ||
				this._watchers.has(key);

			if (!inUse) {
				this._locks.delete(key);
			}
		}
	}

	/**
	 * Get the FIFO waiter queue for a key without creating one.
	 * @param key The lock key.
	 * @returns The waiter queue for the key, or undefined if the key has no queued callers.
	 * @internal
	 */
	private getWaiter(key: string): IMutexWaiter[] | undefined {
		return this._waiters.get(key);
	}

	/**
	 * Get the FIFO waiter queue for a key, creating it if it does not exist.
	 * @param key The lock key.
	 * @returns The waiter queue for the key.
	 * @internal
	 */
	private getQueue(key: string): IMutexWaiter[] {
		let queue = this._waiters.get(key);
		if (Is.empty(queue)) {
			queue = [];
			this._waiters.set(key, queue);
		}
		return queue;
	}

	/**
	 * Lazily loads node:worker_threads, returning null in environments where it is unavailable.
	 * @returns The worker_threads module or null.
	 * @internal
	 */
	// false positive: this is a type not an actual import
	// eslint-disable-next-line @typescript-eslint/consistent-type-imports
	private async loadWorkerThreads(): Promise<typeof import("node:worker_threads") | null> {
		if (this._workerThreadsModule === undefined) {
			try {
				this._workerThreadsModule = await import("node:worker_threads");
			} catch {
				this._workerThreadsModule = null;
			}
		}
		return this._workerThreadsModule;
	}
}
