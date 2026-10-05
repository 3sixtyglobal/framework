// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { MessageChannel, Worker, receiveMessageOnPort } from "node:worker_threads";
import { MutexMessageTypes } from "../../src/models/mutexMessageTypes.js";
import { Mutex } from "../../src/utils/mutex.js";
import { SharedStore } from "../../src/utils/sharedStore.js";

// A worker blocked in an unbounded Atomics.wait never exits, which would hang the
// suite until the vitest timeout. Every wait in the worker scripts below is bounded
// and the test side terminates any worker which has not exited, so a starved worker
// fails the test quickly instead of wedging it.
// The worker side wait is deliberately shorter than the test side timeout, so a worker
// which is never serviced times out first and reports why, rather than the test giving
// up at the same instant and hiding the cause.
const WORKER_WAIT_MS = 5000;
const WORKER_EXIT_TIMEOUT_MS = 20000;

/**
 * Wait for workers to exit, terminating any which have not.
 * @param exited Exit promises, registered when each worker was created so an early exit is not missed.
 * @param workers The workers those promises belong to.
 * @param errors Errors reported by the workers, surfaced so the cause is visible.
 */
async function waitForWorkerExits(
	exited: Promise<void>[],
	workers: Worker[],
	errors: string[] = []
): Promise<void> {
	let timer: ReturnType<typeof setTimeout> | undefined;
	const timedOut = new Promise<boolean>(resolve => {
		timer = setTimeout(() => resolve(true), WORKER_EXIT_TIMEOUT_MS);
	});

	const didTimeOut = await Promise.race([Promise.all(exited).then(() => false), timedOut]);
	clearTimeout(timer);

	if (didTimeOut) {
		await Promise.all(
			workers.map(async worker => {
				await worker.terminate();
			})
		);
		throw new Error(`Workers did not exit within ${WORKER_EXIT_TIMEOUT_MS}ms`);
	}

	if (errors.length > 0) {
		throw new Error(`A worker reported an error: ${errors[0]}`);
	}
}

/**
 * A worker started by startMutexWorker, with its lifecycle tracked from creation.
 */
interface IMutexTestWorker {
	/**
	 * The worker.
	 */
	worker: Worker;

	/**
	 * Resolves when the worker exits.
	 */
	exited: Promise<void>;

	/**
	 * Errors reported by the worker.
	 */
	errors: string[];

	/**
	 * String messages posted by the worker.
	 */
	messages: string[];
}

/**
 * Start an eval worker which has its Mutex buffer requests answered by the main thread. The
 * exit, error and message listeners are registered immediately, so an event which fires
 * before the test awaits it is not missed.
 * @param script The worker script.
 * @param workerData Data passed to the worker.
 * @returns The worker and its tracked lifecycle.
 */
function startMutexWorker(script: string, workerData?: unknown): IMutexTestWorker {
	const worker = new Worker(script, { eval: true, workerData });
	const errors: string[] = [];
	const messages: string[] = [];
	worker.on("error", err => errors.push(String(err)));
	worker.on("message", (msg: unknown) => {
		if (!Mutex.handleWorkerMessage(msg)) {
			messages.push(String(msg));
		}
	});
	const exited = new Promise<void>(resolve => {
		worker.on("exit", () => {
			resolve();
		});
	});
	return { worker, exited, errors, messages };
}

/**
 * Wait for a worker to post a message, failing if it exits or does not post it in time.
 * @param testWorker The worker to wait on.
 * @param expected The message to wait for.
 */
async function waitForWorkerMessage(testWorker: IMutexTestWorker, expected: string): Promise<void> {
	if (testWorker.messages.includes(expected)) {
		return;
	}

	let timer: ReturnType<typeof setTimeout> | undefined;
	const received = new Promise<boolean>(resolve => {
		testWorker.worker.on("message", (msg: unknown) => {
			if (msg === expected) {
				resolve(true);
			}
		});
	});
	const timedOut = new Promise<boolean>(resolve => {
		timer = setTimeout(() => resolve(false), WORKER_EXIT_TIMEOUT_MS);
	});

	const didReceive = await Promise.race([received, testWorker.exited.then(() => false), timedOut]);
	clearTimeout(timer);

	if (!didReceive) {
		await testWorker.worker.terminate();
		const cause = testWorker.errors.length > 0 ? `: ${testWorker.errors[0]}` : "";
		throw new Error(`Worker did not post "${expected}"${cause}`);
	}
}

// All of the lock state lives on a single instance in the SharedStore, so the tests reach
// through that instance and reset it by removing the one entry.
interface IMutexInternal {
	_locks: Map<string, Int32Array>;
	_waiters: Map<string, unknown[]>;
	_watchers: Map<string, Promise<void>>;
	_workerShared: Set<string>;
	_createdSinceSweep: number;
	_workerThreadsModule: unknown;
}

const mutexInstance = (): IMutexInternal =>
	(Mutex as unknown as { instance: () => IMutexInternal }).instance();

const getLocks = (): Map<string, Int32Array> => mutexInstance()._locks;

const mutexSetPrivateLock = (key: string, arr: Int32Array): void => {
	getLocks().set(key, arr);
};

const mutexGetPrivateLock = (key: string): Int32Array | undefined => getLocks().get(key);

const mutexResetInstance = (): void => {
	SharedStore.remove("mutex");
};

const mutexGetPrivateQueue = (key: string): unknown[] | undefined =>
	mutexInstance()._waiters.get(key);

const mutexGetPrivateReclaimThreshold = (): number =>
	(Mutex as unknown as { _RECLAIM_THRESHOLD: number })._RECLAIM_THRESHOLD;

const mutexSimulateHeldLock = (key: string): Int32Array => {
	const arr = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
	Atomics.store(arr, 0, 1);
	mutexSetPrivateLock(key, arr);
	return arr;
};

const mutexSetPrivateWorkerThreads = (module: unknown): void => {
	mutexInstance()._workerThreadsModule = module;
};

describe("Mutex", () => {
	afterEach(() => {
		mutexResetInstance();
	});

	describe("getDefaultTimeoutMs / setDefaultTimeoutMs", () => {
		test("getDefaultTimeoutMs returns 5000 when no value has been set", () => {
			expect(Mutex.getDefaultTimeoutMs()).toEqual(5000);
		});

		test("setDefaultTimeoutMs changes the value returned by getDefaultTimeoutMs", () => {
			Mutex.setDefaultTimeoutMs(1000);
			expect(Mutex.getDefaultTimeoutMs()).toEqual(1000);
		});

		test("setDefaultTimeoutMs accepts 0", () => {
			Mutex.setDefaultTimeoutMs(0);
			expect(Mutex.getDefaultTimeoutMs()).toEqual(0);
		});

		test("setDefaultTimeoutMs throws on a non-integer value", () => {
			expect(() => Mutex.setDefaultTimeoutMs(1.5)).toThrow();
		});

		test("setDefaultTimeoutMs throws on a negative value", () => {
			expect(() => Mutex.setDefaultTimeoutMs(-1)).toThrow();
		});

		test("lock uses the default timeout when options.timeoutMs is not provided", async () => {
			Mutex.setDefaultTimeoutMs(50);
			const arr = mutexSimulateHeldLock("default-timeout");
			const start = Date.now();
			expect(await Mutex.lock("default-timeout")).toEqual(false);
			expect(Date.now() - start).toBeGreaterThanOrEqual(40);
			Atomics.store(arr, 0, 0);
		});

		test("lock options.timeoutMs overrides the default timeout", async () => {
			Mutex.setDefaultTimeoutMs(5000);
			const arr = mutexSimulateHeldLock("override-timeout");
			const start = Date.now();
			expect(await Mutex.lock("override-timeout", { timeoutMs: 50 })).toEqual(false);
			expect(Date.now() - start).toBeLessThan(500);
			Atomics.store(arr, 0, 0);
		});
	});

	describe("lock", () => {
		test("acquires an unlocked key and returns true", async () => {
			expect(await Mutex.lock("key")).toEqual(true);
			Mutex.unlock("key");
		});

		test("acquires different keys independently", async () => {
			expect(await Mutex.lock("key-a")).toEqual(true);
			expect(await Mutex.lock("key-b")).toEqual(true);
			Mutex.unlock("key-a");
			Mutex.unlock("key-b");
		});

		test("throws on empty key", async () => {
			await expect(Mutex.lock("")).rejects.toThrow();
		});

		test("returns false when the lock is held and the timeout elapses", async () => {
			const arr = mutexSimulateHeldLock("held");
			expect(await Mutex.lock("held", { timeoutMs: 50 })).toEqual(false);
			Atomics.store(arr, 0, 0);
		});

		test("throws when the lock is held and throwOnTimeout is true", async () => {
			const arr = mutexSimulateHeldLock("held-throw");
			await expect(
				Mutex.lock("held-throw", { timeoutMs: 50, throwOnTimeout: true })
			).rejects.toThrow();
			Atomics.store(arr, 0, 0);
		});

		test("returns false immediately with timeoutMs 0 when the lock is held", async () => {
			const arr = mutexSimulateHeldLock("zero-timeout-held");
			const start = Date.now();
			expect(await Mutex.lock("zero-timeout-held", { timeoutMs: 0 })).toEqual(false);
			expect(Date.now() - start).toBeLessThan(50);
			Atomics.store(arr, 0, 0);
		});

		test("acquires immediately with timeoutMs 0 when the lock is free", async () => {
			expect(await Mutex.lock("zero-timeout-free", { timeoutMs: 0 })).toEqual(true);
			Mutex.unlock("zero-timeout-free");
		});

		test("re-acquires the same key after it has been unlocked", async () => {
			await Mutex.lock("reuse");
			Mutex.unlock("reuse");
			expect(await Mutex.lock("reuse")).toEqual(true);
			Mutex.unlock("reuse");
		});

		test("multiple sequential lock/unlock cycles on the same key all succeed", async () => {
			for (let i = 0; i < 5; i++) {
				expect(await Mutex.lock("cycle")).toEqual(true);
				Mutex.unlock("cycle");
			}
		});

		test("accepts keys which collide with object prototype members", async () => {
			// The registries are Maps, so a key such as __proto__ is stored as an ordinary key
			// rather than reassigning the prototype of a plain object and vanishing.
			for (const key of ["__proto__", "constructor", "toString", "hasOwnProperty"]) {
				expect(await Mutex.lock(key, { timeoutMs: 50 })).toEqual(true);
				expect(mutexGetPrivateLock(key)).toBeInstanceOf(Int32Array);
				Mutex.unlock(key);
			}
		});

		test("accepts keys containing special characters", async () => {
			const keys = ["a/b", "a.b", "a b", "a:b"];
			for (const key of keys) {
				expect(await Mutex.lock(key)).toEqual(true);
				Mutex.unlock(key);
			}
		});

		test("throws immediately with negative timeoutMs regardless of throwOnTimeout", async () => {
			await expect(Mutex.lock("neg-timeout", { timeoutMs: -1 })).rejects.toThrow();
			await expect(
				Mutex.lock("neg-timeout", { timeoutMs: -1, throwOnTimeout: true })
			).rejects.toThrow();
		});

		test("creates a shared store entry when a key is first locked", async () => {
			expect(mutexGetPrivateLock("brand-new")).toBeUndefined();
			await Mutex.lock("brand-new");
			expect(mutexGetPrivateLock("brand-new")).toBeDefined();
			Mutex.unlock("brand-new");
		});

		test("is acquirable once the holder releases following a throwOnTimeout attempt", async () => {
			const arr = mutexSimulateHeldLock("throw-recovery");
			await expect(
				Mutex.lock("throw-recovery", { timeoutMs: 50, throwOnTimeout: true })
			).rejects.toThrow();
			// The thrower never held the lock; releasing the simulated holder makes it free.
			Atomics.store(arr, 0, 0);
			expect(await Mutex.lock("throw-recovery", { timeoutMs: 100 })).toEqual(true);
			Mutex.unlock("throw-recovery");
		});
	});

	describe("nested locking (same key, same thread)", () => {
		test("second lock on the same key times out and returns false", async () => {
			await Mutex.lock("nested");
			// Not re-entrant: the same context holds the lock and no one will release it.
			const result = await Mutex.lock("nested", { timeoutMs: 50 });
			expect(result).toEqual(false);
			Mutex.unlock("nested");
		});

		test("second lock on the same key throws when throwOnTimeout is true", async () => {
			await Mutex.lock("nested-throw");
			await expect(
				Mutex.lock("nested-throw", { timeoutMs: 50, throwOnTimeout: true })
			).rejects.toThrow();
			Mutex.unlock("nested-throw");
		});

		test("lock is still held and usable after a nested attempt times out", async () => {
			await Mutex.lock("nested-recovery");
			await Mutex.lock("nested-recovery", { timeoutMs: 50 });
			// The original holder should still be able to unlock normally.
			expect(() => Mutex.unlock("nested-recovery")).not.toThrow();
		});
	});

	describe("unlock", () => {
		test("releases a held lock without throwing", async () => {
			await Mutex.lock("key");
			expect(() => Mutex.unlock("key")).not.toThrow();
		});

		test("throws when key was never locked", () => {
			expect(() => Mutex.unlock("never-locked")).toThrow();
		});

		test("throws on double unlock", async () => {
			await Mutex.lock("double");
			Mutex.unlock("double");
			expect(() => Mutex.unlock("double")).toThrow();
		});

		test("throws on empty key", () => {
			expect(() => Mutex.unlock("")).toThrow();
		});

		test("retains the key entry in the registry after unlock with no waiters", async () => {
			// Reclamation is amortised, so a single unlock leaves the entry in place; it is
			// only discarded once enough new entries have been created to trigger a sweep.
			await Mutex.lock("cleanup");
			Mutex.unlock("cleanup");
			expect(mutexGetPrivateLock("cleanup")).toBeDefined();
		});
	});

	describe("registry reclamation", () => {
		test("does not create a waiter queue for an uncontended lock", async () => {
			await Mutex.lock("uncontended");
			expect(mutexGetPrivateQueue("uncontended")).toBeUndefined();
			Mutex.unlock("uncontended");
			expect(mutexGetPrivateQueue("uncontended")).toBeUndefined();
		});

		test("removes the waiter queue for a key once contention ends", async () => {
			await Mutex.lock("queue-drain");

			const waiting = Mutex.lock("queue-drain", { timeoutMs: 1000 });
			await new Promise(resolve => setTimeout(resolve, 1));
			expect(mutexGetPrivateQueue("queue-drain")).toHaveLength(1);

			Mutex.unlock("queue-drain");
			expect(await waiting).toEqual(true);
			expect(mutexGetPrivateQueue("queue-drain")).toBeUndefined();

			Mutex.unlock("queue-drain");
		});

		test("removes the waiter queue for a key when the waiter times out", async () => {
			await Mutex.lock("queue-timeout");

			expect(await Mutex.lock("queue-timeout", { timeoutMs: 20 })).toEqual(false);
			expect(mutexGetPrivateQueue("queue-timeout")).toBeUndefined();

			Mutex.unlock("queue-timeout");
		});

		test("reclaims idle lock entries once the creation threshold is reached", async () => {
			const threshold = mutexGetPrivateReclaimThreshold();
			const total = threshold + 50;

			for (let i = 0; i < total; i++) {
				await Mutex.lock(`reclaim-${i}`);
				Mutex.unlock(`reclaim-${i}`);
			}

			// The sweep runs on the unlock which crosses the threshold and clears every idle
			// entry, so only the keys created after that sweep are still registered.
			expect(getLocks().size).toEqual(total - threshold);

			// The registry is still usable for a key whose entry was discarded.
			expect(await Mutex.lock("reclaim-0")).toEqual(true);
			Mutex.unlock("reclaim-0");
		});

		test("retains a lock entry which is still held when the sweep runs", async () => {
			const threshold = mutexGetPrivateReclaimThreshold();
			await Mutex.lock("held-through-sweep");

			for (let i = 0; i < threshold; i++) {
				await Mutex.lock(`churn-${i}`);
				Mutex.unlock(`churn-${i}`);
			}

			expect(mutexGetPrivateLock("held-through-sweep")).toBeDefined();
			Mutex.unlock("held-through-sweep");
		});

		test("retains a lock entry whose buffer has been handed to a worker", async () => {
			const threshold = mutexGetPrivateReclaimThreshold();

			// Negotiating the buffer marks the key as shared with a worker thread. The worker
			// caches the Int32Array it receives, so replacing it would break mutual exclusion.
			const { port1, port2 } = new MessageChannel();
			const signal = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
			Mutex.handleWorkerMessage({
				type: MutexMessageTypes.GetBuffer,
				key: "worker-shared",
				signal: signal.buffer,
				port: port2
			});
			const shared = mutexGetPrivateLock("worker-shared");
			port1.close();

			for (let i = 0; i < threshold; i++) {
				await Mutex.lock(`churn-${i}`);
				Mutex.unlock(`churn-${i}`);
			}

			expect(mutexGetPrivateLock("worker-shared")).toBe(shared);
		});
	});

	describe("handleWorkerMessage", () => {
		test("processes a buffer request and returns true", () => {
			const { port1, port2 } = new MessageChannel();
			const signal = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));

			const result = Mutex.handleWorkerMessage({
				type: MutexMessageTypes.GetBuffer,
				key: "negotiated",
				signal: signal.buffer,
				port: port2
			});

			expect(result).toEqual(true);
			const response = receiveMessageOnPort(port1);
			expect(response?.message).toMatchObject({ buffer: expect.any(SharedArrayBuffer) });
			expect(mutexGetPrivateLock("negotiated")).toBeDefined();
			port1.close();
		});

		test("returns false for messages with a different type", () => {
			expect(Mutex.handleWorkerMessage({ type: "unrelated", key: "other" })).toEqual(false);
			expect(mutexGetPrivateLock("other")).toBeUndefined();
		});

		test("returns false for non-object messages", () => {
			expect(Mutex.handleWorkerMessage("plain string")).toEqual(false);
			expect(Mutex.handleWorkerMessage(null)).toEqual(false);
			expect(Mutex.handleWorkerMessage(42)).toEqual(false);
		});

		test("returns the same SharedArrayBuffer for a key already in the registry", () => {
			const arr = mutexSimulateHeldLock("pre-registered");
			Atomics.store(arr, 0, 0);

			const { port1, port2 } = new MessageChannel();
			const signal = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));

			Mutex.handleWorkerMessage({
				type: MutexMessageTypes.GetBuffer,
				key: "pre-registered",
				signal: signal.buffer,
				port: port2
			});

			const response = receiveMessageOnPort(port1);
			const returnedArr = new Int32Array(
				(response?.message as { buffer: SharedArrayBuffer }).buffer
			);
			// Verify shared memory: write through original, read through returned - same buffer.
			Atomics.store(arr, 0, 99);
			expect(Atomics.load(returnedArr, 0)).toEqual(99);
			Atomics.store(arr, 0, 0);
			port1.close();
		});

		test("closes the worker port after sending the buffer response", async () => {
			const { port1, port2 } = new MessageChannel();
			const signal = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));

			const portClosed = new Promise<void>(resolve => {
				port1.on("close", resolve);
				port1.start();
			});

			Mutex.handleWorkerMessage({
				type: MutexMessageTypes.GetBuffer,
				key: "port-cleanup",
				signal: signal.buffer,
				port: port2
			});

			await portClosed;
			port1.close();
		});
	});

	describe("threading", () => {
		// Reusable prefix: fetches the shared lock buffer from the main thread via the
		// Mutex protocol, then acquires the lock.  Runs inside an eval worker so uses CJS.
		const fetchAndAcquireScript = (key: string): string => `
			const { parentPort } = require("worker_threads");
			const { MessageChannel, receiveMessageOnPort } = require("worker_threads");
			const { port1, port2 } = new MessageChannel();
			const signalBuf = new SharedArrayBuffer(4);
			const signal = new Int32Array(signalBuf);
			parentPort.postMessage(
				{ type: "twin:mutex:getBuffer", key: "${key}", signal: signalBuf, port: port2 },
				[port2]
			);
			if (Atomics.wait(signal, 0, 0, ${WORKER_WAIT_MS}) === "timed-out") {
				throw new Error("Timed out waiting for the lock buffer from the main thread");
			}
			const response = receiveMessageOnPort(port1);
			port1.close();
			const lock = new Int32Array(response.message.buffer);
			for (;;) {
				const prev = Atomics.compareExchange(lock, 0, 0, 1);
				if (prev === 0) break;
				Atomics.wait(lock, 0, 1, 5000);
			}
		`;

		test("acquires the lock once a worker releases it", async () => {
			// Worker acquires the lock, signals main, then flags and releases it after 150 ms
			// and exits.
			const released = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
			const testWorker = startMutexWorker(
				`${fetchAndAcquireScript("worker-key")}
				const released = new Int32Array(require("worker_threads").workerData);
				parentPort.postMessage("locked");
				setTimeout(() => {
					Atomics.store(released, 0, 1);
					Atomics.store(lock, 0, 0);
					Atomics.notify(lock, 0, 1);
				}, 150);`,
				released.buffer
			);

			// Wait until the worker has the lock before we block in Mutex.lock.
			await waitForWorkerMessage(testWorker, "locked");

			const acquired = await Mutex.lock("worker-key", { timeoutMs: 2000 });

			// Checked through shared memory rather than elapsed time, which a loaded machine
			// can shorten by delaying delivery of the "locked" message.
			expect(acquired).toEqual(true);
			expect(Atomics.load(released, 0)).toEqual(1);
			Mutex.unlock("worker-key");

			// The worker can exit as soon as it releases, before this point is reached.
			await waitForWorkerExits([testWorker.exited], [testWorker.worker], testWorker.errors);
		});

		test("times out when the worker never releases the lock", async () => {
			// Worker acquires the lock and holds it indefinitely.
			const testWorker = startMutexWorker(
				`${fetchAndAcquireScript("held-forever")}
				parentPort.postMessage("locked");`
			);

			await waitForWorkerMessage(testWorker, "locked");

			expect(await Mutex.lock("held-forever", { timeoutMs: 100 })).toEqual(false);
			await testWorker.worker.terminate();
		});

		test("retains the key entry while a waiter is queued", async () => {
			// Main acquires first so the buffer is created in the registry before the worker starts.
			await Mutex.lock("contested");

			// Worker fetches the same buffer via the protocol, then blocks waiting for main to release.
			const testWorker = startMutexWorker(
				`${fetchAndAcquireScript("contested")}
				parentPort.postMessage("acquired");`
			);

			// Yield to the event loop so the worker can fetch its buffer and block on the lock.
			await new Promise<void>(resolve => {
				setTimeout(resolve, 50);
			});

			// Key must still exist while the worker is blocked.
			expect(mutexGetPrivateLock("contested")).toBeDefined();

			// Release - worker wakes and acquires.
			Mutex.unlock("contested");
			await waitForWorkerMessage(testWorker, "acquired");

			await waitForWorkerExits([testWorker.exited], [testWorker.worker], testWorker.errors);
		});

		test("lock throws bufferFetchFailed when the main thread does not handle the buffer-fetch request", async () => {
			// Drive the worker branch by substituting the cached worker_threads module, rather
			// than spawning a real worker which would have to import the package by name and
			// so require the package to have been built first.
			// parentPort accepts the buffer request and never answers it, which is exactly the
			// state a worker is in when the main thread does not call handleWorkerMessage.
			mutexSetPrivateWorkerThreads({
				isMainThread: false,
				parentPort: { postMessage: () => {} },
				MessageChannel,
				receiveMessageOnPort
			});

			await expect(
				Mutex.lock("fetch-timeout", { timeoutMs: 200, throwOnTimeout: true })
			).rejects.toThrow("bufferFetchFailed");
		});
	});

	describe("concurrent main-thread locks on a new key", () => {
		test("only one coroutine holds the lock at a time when N async tasks lock the same brand-new key simultaneously", async () => {
			const N = 10;
			let concurrentHolders = 0;
			let maxConcurrent = 0;
			const key = "toctou-mutual-exclusion";

			// Launch all N tasks at once - none of them have ever seen this key before,
			// so getOrFetchLock will hit the `await loadWorkerThreads()` yield window for all of them.
			await Promise.all(
				Array.from({ length: N }, async () => {
					await Mutex.lock(key, { throwOnTimeout: true, timeoutMs: 10_000 });
					try {
						concurrentHolders++;
						maxConcurrent = Math.max(maxConcurrent, concurrentHolders);
						// Yield to the event loop so concurrent coroutines can interleave
						// if (and only if) the mutex is broken and multiple are "holding" it.
						await new Promise<void>(resolve => {
							setTimeout(resolve, 10);
						});
						concurrentHolders--;
					} finally {
						Mutex.unlock(key);
					}
				})
			);

			// If mutual exclusion holds, no more than one coroutine was ever inside at once.
			expect(maxConcurrent).toEqual(1);
		});

		test("no counter increments are lost when N async tasks lock the same brand-new key simultaneously", async () => {
			const N = 10;
			let counter = 0;
			const key = "toctou-lost-update";

			// Each task reads the counter, yields, then writes counter + 1.
			// If two tasks read the same value concurrently, one increment is silently lost.
			await Promise.all(
				Array.from({ length: N }, async () => {
					await Mutex.lock(key, { throwOnTimeout: true, timeoutMs: 10_000 });
					try {
						const snapshot = counter;
						await new Promise<void>(resolve => {
							setTimeout(resolve, 10);
						});
						counter = snapshot + 1;
					} finally {
						Mutex.unlock(key);
					}
				})
			);

			expect(counter).toEqual(N);
		});
	});

	describe("fairness", () => {
		test("serves queued callers in the order they arrived", async () => {
			const key = "fair-order";
			const order: number[] = [];

			await Mutex.lock(key, { throwOnTimeout: true });

			const acquire = async (index: number): Promise<boolean> => {
				const acquired = await Mutex.lock(key, { timeoutMs: 10_000 });
				order.push(index);
				if (acquired) {
					Mutex.unlock(key);
				}
				return acquired;
			};

			const queued: Promise<boolean>[] = [];
			for (let i = 0; i < 5; i++) {
				queued.push(acquire(i));
				// Let each call reach the queue before the next one is made, so the
				// arrival order under test is the call order.
				await new Promise<void>(resolve => {
					setImmediate(resolve);
				});
			}

			Mutex.unlock(key);

			expect(await Promise.all(queued)).toEqual([true, true, true, true, true]);
			expect(order).toEqual([0, 1, 2, 3, 4]);
		});

		test("a queued caller is not starved by callers that arrive after it", async () => {
			const N = 20;
			const key = "fair-starvation";
			const state = { stopped: false };
			let acquisitions = 0;

			// Sustained contention on the key. Each task releases and immediately asks for
			// the lock again, which is what lets a barging mutex pass over a queued caller.
			const contend = async (): Promise<void> => {
				while (!state.stopped) {
					if (await Mutex.lock(key, { timeoutMs: 30_000 })) {
						acquisitions++;
						await new Promise<void>(resolve => {
							setImmediate(resolve);
						});
						Mutex.unlock(key);
					}
				}
			};

			const contenders: Promise<void>[] = [];
			for (let i = 0; i < N; i++) {
				contenders.push(contend());
			}

			// Let the contention establish itself so this caller joins the back of a
			// queue that is already busy, rather than an empty one.
			await new Promise<void>(resolve => {
				setTimeout(resolve, 50);
			});

			const acquisitionsWhenQueued = acquisitions;
			const acquired = await Mutex.lock(key, { timeoutMs: 30_000 });
			const grantsWhileQueued = acquisitions - acquisitionsWhenQueued;
			state.stopped = true;
			if (acquired) {
				Mutex.unlock(key);
			}
			await Promise.all(contenders);

			expect(acquired).toEqual(true);
			// At most one grant per task already queued ahead of this caller, plus the
			// holder at the time it queued. A barging mutex serves orders of magnitude more.
			expect(grantsWhileQueued).toBeLessThanOrEqual(N + 2);
		});
	});

	describe("stress", () => {
		// Worker script that fetches the lock buffer from the main thread via the Mutex protocol,
		// acquires the lock, increments a shared counter, then releases.
		const incrementWorkerScript = `
			const { workerData, parentPort } = require("worker_threads");
			const { MessageChannel, receiveMessageOnPort } = require("worker_threads");
			const { port1, port2 } = new MessageChannel();
			const signalBuf = new SharedArrayBuffer(4);
			const signal = new Int32Array(signalBuf);
			parentPort.postMessage(
				{ type: "twin:mutex:getBuffer", key: workerData.key, signal: signalBuf, port: port2 },
				[port2]
			);
			if (Atomics.wait(signal, 0, 0, ${WORKER_WAIT_MS}) === "timed-out") {
				throw new Error("Timed out waiting for the lock buffer from the main thread");
			}
			const response = receiveMessageOnPort(port1);
			port1.close();
			const lock = new Int32Array(response.message.buffer);
			const counter = new Int32Array(workerData.counter);
			for (;;) {
				const prev = Atomics.compareExchange(lock, 0, 0, 1);
				if (prev === 0) break;
				Atomics.wait(lock, 0, 1, 5000);
			}
			const current = Atomics.load(counter, 0);
			Atomics.store(counter, 0, current + 1);
			Atomics.store(lock, 0, 0);
			Atomics.notify(lock, 0, 1);
			parentPort.postMessage("done");
		`;

		test("20 workers contending on the same lock produce no lost counter updates", async () => {
			const workerCount = 20;
			const counterBuf = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
			const counter = new Int32Array(counterBuf);

			// Register exit listeners immediately so workers that finish early are not missed.
			const exited: Promise<void>[] = [];
			const workers: Worker[] = [];
			const errors: string[] = [];
			for (let i = 0; i < workerCount; i++) {
				const w = new Worker(incrementWorkerScript, {
					eval: true,
					workerData: { key: "stress-contention", counter: counterBuf }
				});
				workers.push(w);
				w.on("error", err => errors.push(String(err)));
				w.on("message", (msg: unknown) => {
					Mutex.handleWorkerMessage(msg);
				});
				exited.push(
					new Promise<void>(resolve => {
						w.on("exit", () => {
							resolve();
						});
					})
				);
			}

			await waitForWorkerExits(exited, workers, errors);

			expect(Atomics.load(counter, 0)).toEqual(workerCount);
		});

		test("main thread and 10 workers interleaving on the same lock produce no lost counter updates", async () => {
			const workerCount = 10;
			const mainIncrements = 5;
			const counterBuf = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
			const counter = new Int32Array(counterBuf);

			// Register exit listeners immediately so workers that finish early are not missed.
			const exited: Promise<void>[] = [];
			const workers: Worker[] = [];
			const errors: string[] = [];
			for (let i = 0; i < workerCount; i++) {
				const w = new Worker(incrementWorkerScript, {
					eval: true,
					workerData: { key: "stress-mixed", counter: counterBuf }
				});
				workers.push(w);
				w.on("error", err => errors.push(String(err)));
				w.on("message", (msg: unknown) => {
					Mutex.handleWorkerMessage(msg);
				});
				exited.push(
					new Promise<void>(resolve => {
						w.on("exit", () => {
							resolve();
						});
					})
				);
			}

			for (let i = 0; i < mainIncrements; i++) {
				await Mutex.lock("stress-mixed", { timeoutMs: 5000 });
				const current = Atomics.load(counter, 0);
				Atomics.store(counter, 0, current + 1);
				Mutex.unlock("stress-mixed");
			}

			await waitForWorkerExits(exited, workers, errors);

			expect(Atomics.load(counter, 0)).toEqual(workerCount + mainIncrements);
		});
	});
});
