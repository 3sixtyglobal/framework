// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { MessageChannel, Worker, receiveMessageOnPort } from "node:worker_threads";
import { MutexMessageTypes } from "../../src/models/mutexMessageTypes.js";
import { Mutex } from "../../src/utils/mutex.js";
import { SharedStore } from "../../src/utils/sharedStore.js";

const getLocks = (): { [key: string]: Int32Array } => {
	let locks = SharedStore.get<{ [key: string]: Int32Array }>("mutexLocks");
	if (!locks) {
		locks = {};
		SharedStore.set("mutexLocks", locks);
	}
	return locks;
};

const mutexSetPrivateLock = (key: string, arr: Int32Array): void => {
	getLocks()[key] = arr;
};

const mutexGetPrivateLock = (key: string): Int32Array | undefined => getLocks()[key];

const mutexClearPrivateLocks = (): void => {
	SharedStore.set("mutexLocks", {});
};

const mutexSimulateHeldLock = (key: string): Int32Array => {
	const arr = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
	Atomics.store(arr, 0, 1);
	mutexSetPrivateLock(key, arr);
	return arr;
};

const mutexResetDefaultTimeout = (): void => {
	SharedStore.remove("mutexDefaultTimeoutMs");
};

describe("Mutex", () => {
	afterEach(() => {
		mutexClearPrivateLocks();
		mutexResetDefaultTimeout();
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
			expect(Date.now() - start).toBeGreaterThanOrEqual(50);
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
			// parentPort is null in fork-mode test processes, so this process owns the
			// registry and never deletes entries — worker threads may still hold references.
			await Mutex.lock("cleanup");
			Mutex.unlock("cleanup");
			expect(mutexGetPrivateLock("cleanup")).toBeDefined();
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
			// Verify shared memory: write through original, read through returned — same buffer.
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
			Atomics.wait(signal, 0, 0);
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
			// Worker acquires the lock, signals main, then releases after 150 ms.
			const worker = new Worker(
				`${fetchAndAcquireScript("worker-key")}
				parentPort.postMessage("locked");
				setTimeout(() => {
					Atomics.store(lock, 0, 0);
					Atomics.notify(lock, 0, 1);
				}, 150);`,
				{ eval: true }
			);
			worker.on("message", (msg: unknown) => {
				Mutex.handleWorkerMessage(msg);
			});

			// Wait until the worker has the lock before we block in Mutex.lock.
			await new Promise<void>(resolve => {
				worker.on("message", (msg: unknown) => {
					if (msg === "locked") {
						resolve();
					}
				});
			});

			const start = Date.now();
			const acquired = await Mutex.lock("worker-key", { timeoutMs: 2000 });
			const elapsed = Date.now() - start;

			expect(acquired).toEqual(true);
			expect(elapsed).toBeGreaterThanOrEqual(140);
			Mutex.unlock("worker-key");

			await new Promise<void>(resolve => {
				worker.on("exit", () => {
					resolve();
				});
			});
		});

		test("times out when the worker never releases the lock", async () => {
			// Worker acquires the lock and holds it indefinitely.
			const worker = new Worker(
				`${fetchAndAcquireScript("held-forever")}
				parentPort.postMessage("locked");`,
				{ eval: true }
			);
			worker.on("message", (msg: unknown) => {
				Mutex.handleWorkerMessage(msg);
			});

			await new Promise<void>(resolve => {
				worker.on("message", (msg: unknown) => {
					if (msg === "locked") {
						resolve();
					}
				});
			});

			expect(await Mutex.lock("held-forever", { timeoutMs: 100 })).toEqual(false);
			await worker.terminate();
		});

		test("retains the key entry while a waiter is queued", async () => {
			// Main acquires first so the buffer is created in the registry before the worker starts.
			await Mutex.lock("contested");

			// Worker fetches the same buffer via the protocol, then blocks waiting for main to release.
			const worker = new Worker(
				`${fetchAndAcquireScript("contested")}
				parentPort.postMessage("acquired");`,
				{ eval: true }
			);
			worker.on("message", (msg: unknown) => {
				Mutex.handleWorkerMessage(msg);
			});

			const workerAcquired = new Promise<void>(resolve => {
				worker.on("message", (msg: unknown) => {
					if (msg === "acquired") {
						resolve();
					}
				});
			});

			// Yield to the event loop so the worker can fetch its buffer and block on the lock.
			await new Promise<void>(resolve => {
				setTimeout(resolve, 50);
			});

			// Key must still exist while the worker is blocked.
			expect(mutexGetPrivateLock("contested")).toBeDefined();

			// Release — worker wakes and acquires.
			Mutex.unlock("contested");
			await workerAcquired;

			await new Promise<void>(resolve => {
				worker.on("exit", () => {
					resolve();
				});
			});
		});

		test("lock throws bufferFetchFailed when the main thread does not handle the buffer-fetch request", async () => {
			const worker = new Worker(
				`
				(async () => {
					const { parentPort } = require("worker_threads");
					try {
						const { Mutex } = await import("@twin.org/core");
						await Mutex.lock("fetch-timeout", { timeoutMs: 200, throwOnTimeout: true });
						parentPort.postMessage({ ok: true });
					} catch (err) {
						parentPort.postMessage({ error: err.message });
					}
				})();
				`,
				{ eval: true }
			);

			// Intentionally NOT wiring handleWorkerMessage — the signal will never be notified.
			const result = await new Promise<{ ok?: boolean; error?: string }>(resolve => {
				worker.on("message", (msg: unknown) => {
					if (msg !== null && typeof msg === "object" && !("type" in msg)) {
						resolve(msg);
					}
				});
			});

			// Worker should exit cleanly on its own — a leaked open port would keep it alive
			// and prevent the worker's event loop from draining, causing this await to hang.
			await new Promise<void>(resolve => {
				worker.on("exit", resolve);
			});

			expect(result.error).toContain("bufferFetchFailed");
		});
	});

	describe("concurrent main-thread locks on a new key", () => {
		test("only one coroutine holds the lock at a time when N async tasks lock the same brand-new key simultaneously", async () => {
			const N = 10;
			let concurrentHolders = 0;
			let maxConcurrent = 0;
			const key = "toctou-mutual-exclusion";

			// Launch all N tasks at once — none of them have ever seen this key before,
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
			Atomics.wait(signal, 0, 0);
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
			for (let i = 0; i < workerCount; i++) {
				const w = new Worker(incrementWorkerScript, {
					eval: true,
					workerData: { key: "stress-contention", counter: counterBuf }
				});
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

			await Promise.all(exited);

			expect(Atomics.load(counter, 0)).toEqual(workerCount);
		});

		test("main thread and 10 workers interleaving on the same lock produce no lost counter updates", async () => {
			const workerCount = 10;
			const mainIncrements = 5;
			const counterBuf = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
			const counter = new Int32Array(counterBuf);

			// Register exit listeners immediately so workers that finish early are not missed.
			const exited: Promise<void>[] = [];
			for (let i = 0; i < workerCount; i++) {
				const w = new Worker(incrementWorkerScript, {
					eval: true,
					workerData: { key: "stress-mixed", counter: counterBuf }
				});
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

			await Promise.all(exited);

			expect(Atomics.load(counter, 0)).toEqual(workerCount + mainIncrements);
		});
	});
});
