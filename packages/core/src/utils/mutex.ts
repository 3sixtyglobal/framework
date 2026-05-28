// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { MessagePort } from "node:worker_threads";
import { nameof } from "@twin.org/nameof";
import { Guards } from "./guards.js";
import { Is } from "./is.js";
import { SharedStore } from "./sharedStore.js";
import { GeneralError } from "../errors/generalError.js";
import type { IMutexWorkerMessage } from "../models/IMutexWorkerMessage.js";
import { MutexMessageTypes } from "../models/mutexMessageTypes.js";

/**
 * A cross-thread mutex built on Atomics and SharedArrayBuffer.
 *
 * When isMainThread is true (main thread or fork-mode child process) the class acts as
 * the authoritative registry: it creates a SharedArrayBuffer-backed Int32Array for each
 * key on first use and never discards it, because worker threads may hold references to
 * the same underlying memory.
 *
 * When isMainThread is false (a true worker thread) the class synchronously negotiates
 * the shared buffer with the main thread on first use of each key, then caches it locally.
 * The main thread must call Mutex.handleWorkerMessage(msg) from its worker message handler
 * before that worker first calls Mutex.lock().
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
	 * SharedStore key for the per-thread sparse map from lock key strings to Int32Arrays.
	 * @internal
	 */
	private static readonly _LOCKS_KEY = "mutexLocks";

	/**
	 * Cached reference to the node:worker_threads module, null if unavailable (browser).
	 * @internal
	 */
	// false positive: this is a type not an actual import
	// eslint-disable-next-line @typescript-eslint/consistent-type-imports
	private static _workerThreadsModule: typeof import("node:worker_threads") | null | undefined;

	/**
	 * Acquires a lock for the given key without blocking the event loop. If the lock is already
	 * held, it suspends the current async task until the lock is released or the timeout is reached.
	 * Use this in async single-threaded contexts (e.g. the main thread or a Fastify route handler)
	 * where calling the synchronous lock() would freeze the event loop and deadlock.
	 * The lock is not re-entrant: if the same context holds the key and calls lockAsync() again on
	 * the same key, it will suspend until the timeout elapses.
	 * @param key The key to lock on.
	 * @param options Lock options.
	 * @param options.timeoutMs The maximum time to wait for the lock in milliseconds, default is 5000.
	 * @param options.throwOnTimeout Whether to throw an error if the lock could not be acquired within the timeout, default is false.
	 * @returns True if the lock was acquired, false if it timed out and throwOnTimeout is false.
	 * @throws GeneralError if the key is invalid or if the lock could not be acquired within the timeout and throwOnTimeout is true.
	 */
	public static async lock(
		key: string,
		options?: { timeoutMs?: number; throwOnTimeout?: boolean }
	): Promise<boolean> {
		Guards.stringValue(Mutex.CLASS_NAME, nameof(key), key);

		const timeoutMs = options?.timeoutMs ?? 5000;
		const throwOnTimeout = options?.throwOnTimeout ?? false;
		const deadline = Date.now() + timeoutMs;

		// getOrFetchLock may block once per key on worker threads to negotiate the
		// shared buffer with the main thread; that one-time fetch is acceptable here.
		const lock = await Mutex.getOrFetchLock(key, deadline);

		for (;;) {
			// Atomically swap 0 → 1; if the previous value was 0 we acquired the lock.
			const previous = Atomics.compareExchange(lock, 0, 0, 1);
			if (previous === 0) {
				return true;
			}

			// Otherwise, the lock is held by someone else. Check if we've already timed out.
			const remaining = deadline - Date.now();
			if (remaining <= 0) {
				if (throwOnTimeout) {
					throw new GeneralError(Mutex.CLASS_NAME, "lockTimeout", { key, timeoutMs });
				}
				return false;
			}

			// Suspend without blocking the event loop so the lock holder's async
			// continuations can run and eventually call unlock().
			const waitResult = Atomics.waitAsync(lock, 0, 1, remaining);
			const outcome = waitResult.async ? await waitResult.value : waitResult.value;
			if (outcome === "timed-out") {
				if (throwOnTimeout) {
					throw new GeneralError(Mutex.CLASS_NAME, "lockTimeout", { key, timeoutMs });
				}
				return false;
			}
		}
	}

	/**
	 * Releases the lock for the given key.
	 * @param key The key to unlock.
	 * @throws GeneralError if the key is invalid or the lock is not currently held.
	 */
	public static unlock(key: string): void {
		Guards.stringValue(Mutex.CLASS_NAME, nameof(key), key);

		const locks = Mutex.getLocks();
		const lock = locks[key];
		if (Is.empty(lock)) {
			throw new GeneralError(Mutex.CLASS_NAME, "lockNotFound", { key });
		}

		const previous = Atomics.compareExchange(lock, 0, 1, 0);
		if (previous !== 1) {
			throw new GeneralError(Mutex.CLASS_NAME, "lockAlreadyReleased", { key });
		}

		Atomics.notify(lock, 0, 1);
	}

	/**
	 * Inspect a message received from a worker and, if it is a Mutex buffer-fetch request,
	 * respond to it synchronously. Call from the main thread's worker message handler.
	 * @param msg The raw message received from the worker.
	 * @returns True if the message was a Mutex protocol message and was handled, false otherwise.
	 */
	public static handleWorkerMessage(msg: unknown): boolean {
		if (!Is.object<IMutexWorkerMessage>(msg) || msg.type !== MutexMessageTypes.GetBuffer) {
			return false;
		}

		Guards.stringValue(Mutex.CLASS_NAME, nameof(msg.key), msg.key);
		Guards.object<SharedArrayBuffer>(Mutex.CLASS_NAME, nameof(msg.signal), msg.signal);
		Guards.object<MessagePort>(Mutex.CLASS_NAME, nameof(msg.port), msg.port);

		const locks = Mutex.getLocks();
		locks[msg.key] ??= new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
		// Send the buffer to the worker before notifying so that it is guaranteed
		// to be in port1's receive queue when Atomics.wait returns on the worker side.
		msg.port.postMessage({ buffer: locks[msg.key].buffer });
		Atomics.notify(new Int32Array(msg.signal), 0, 1);
		msg.port.close();

		return true;
	}

	/**
	 * Returns the Int32Array for the given key, fetching it from the main thread if this
	 * is a worker thread and the key is not yet in the local cache.
	 * @param key The lock key.
	 * @returns The Int32Array backed by a SharedArrayBuffer for this key.
	 * @internal
	 */
	private static async getOrFetchLock(key: string, deadline: number): Promise<Int32Array> {
		const locks = Mutex.getLocks();
		if (!Is.empty(locks[key])) {
			return locks[key];
		}

		const wt = await Mutex.loadWorkerThreads();

		if (Is.empty(wt) || wt.isMainThread) {
			// Main thread, fork-mode process, or browser: own the registry entry.
			locks[key] = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
			return locks[key];
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
			// Block until the main thread posts the response and fires Atomics.notify.
			// The response is guaranteed to be in port1's queue at this point because
			// port.postMessage executes before Atomics.notify on the main thread.
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

			locks[key] = new Int32Array(response.message.buffer);
			return locks[key];
		} finally {
			port1.close();
		}
	}

	/**
	 * Get the shared locks map, creating it if it does not exist.
	 * @returns The shared locks map.
	 * @internal
	 */
	private static getLocks(): { [key: string]: Int32Array } {
		let locks = SharedStore.get<{ [key: string]: Int32Array }>(Mutex._LOCKS_KEY);
		if (Is.undefined(locks)) {
			locks = {};
			SharedStore.set(Mutex._LOCKS_KEY, locks);
		}
		return locks;
	}

	/**
	 * Lazily loads node:worker_threads, returning null in environments where it is unavailable.
	 * @returns The worker_threads module or null.
	 * @internal
	 */
	// false positive: this is a type not an actual import
	// eslint-disable-next-line @typescript-eslint/consistent-type-imports
	private static async loadWorkerThreads(): Promise<typeof import("node:worker_threads") | null> {
		if (Mutex._workerThreadsModule === undefined) {
			try {
				Mutex._workerThreadsModule = await import("node:worker_threads");
			} catch {
				Mutex._workerThreadsModule = null;
			}
		}
		return Mutex._workerThreadsModule;
	}
}
