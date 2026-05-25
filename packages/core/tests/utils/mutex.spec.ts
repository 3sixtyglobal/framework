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

describe("Mutex", () => {
	afterEach(() => {
		mutexClearPrivateLocks();
	});

	describe("lock", () => {
		test("acquires an unlocked key and returns true", () => {
			expect(Mutex.lock("key")).toEqual(true);
			Mutex.unlock("key");
		});

		test("acquires different keys independently", () => {
			expect(Mutex.lock("key-a")).toEqual(true);
			expect(Mutex.lock("key-b")).toEqual(true);
			Mutex.unlock("key-a");
			Mutex.unlock("key-b");
		});

		test("throws on empty key", () => {
			expect(() => Mutex.lock("")).toThrow();
		});

		test("returns false when the lock is held and the timeout elapses", () => {
			const arr = mutexSimulateHeldLock("held");
			expect(Mutex.lock("held", { timeoutMs: 50 })).toEqual(false);
			Atomics.store(arr, 0, 0);
		});

		test("throws when the lock is held and throwOnTimeout is true", () => {
			const arr = mutexSimulateHeldLock("held-throw");
			expect(() => Mutex.lock("held-throw", { timeoutMs: 50, throwOnTimeout: true })).toThrow();
			Atomics.store(arr, 0, 0);
		});

		test("returns false immediately with timeoutMs 0 when the lock is held", () => {
			const arr = mutexSimulateHeldLock("zero-timeout-held");
			const start = Date.now();
			expect(Mutex.lock("zero-timeout-held", { timeoutMs: 0 })).toEqual(false);
			expect(Date.now() - start).toBeLessThan(50);
			Atomics.store(arr, 0, 0);
		});

		test("acquires immediately with timeoutMs 0 when the lock is free", () => {
			expect(Mutex.lock("zero-timeout-free", { timeoutMs: 0 })).toEqual(true);
			Mutex.unlock("zero-timeout-free");
		});

		test("re-acquires the same key after it has been unlocked", () => {
			Mutex.lock("reuse");
			Mutex.unlock("reuse");
			expect(Mutex.lock("reuse")).toEqual(true);
			Mutex.unlock("reuse");
		});

		test("multiple sequential lock/unlock cycles on the same key all succeed", () => {
			for (let i = 0; i < 5; i++) {
				expect(Mutex.lock("cycle")).toEqual(true);
				Mutex.unlock("cycle");
			}
		});

		test("accepts keys containing special characters", () => {
			const keys = ["a/b", "a.b", "a b", "a:b"];
			for (const key of keys) {
				expect(Mutex.lock(key)).toEqual(true);
				Mutex.unlock(key);
			}
		});

		test("returns false immediately with negative timeoutMs when the lock is held", () => {
			const arr = mutexSimulateHeldLock("neg-timeout");
			const start = Date.now();
			expect(Mutex.lock("neg-timeout", { timeoutMs: -1 })).toEqual(false);
			expect(Date.now() - start).toBeLessThan(50);
			Atomics.store(arr, 0, 0);
		});

		test("throws immediately with negative timeoutMs when throwOnTimeout is true", () => {
			const arr = mutexSimulateHeldLock("neg-throw");
			expect(() => Mutex.lock("neg-throw", { timeoutMs: -1, throwOnTimeout: true })).toThrow();
			Atomics.store(arr, 0, 0);
		});

		test("creates a shared store entry when a key is first locked", () => {
			expect(mutexGetPrivateLock("brand-new")).toBeUndefined();
			Mutex.lock("brand-new");
			expect(mutexGetPrivateLock("brand-new")).toBeDefined();
			Mutex.unlock("brand-new");
		});

		test("is acquirable once the holder releases following a throwOnTimeout attempt", () => {
			const arr = mutexSimulateHeldLock("throw-recovery");
			expect(() => Mutex.lock("throw-recovery", { timeoutMs: 50, throwOnTimeout: true })).toThrow();
			// The thrower never held the lock; releasing the simulated holder makes it free.
			Atomics.store(arr, 0, 0);
			expect(Mutex.lock("throw-recovery", { timeoutMs: 100 })).toEqual(true);
			Mutex.unlock("throw-recovery");
		});
	});

	describe("nested locking (same key, same thread)", () => {
		test("second lock on the same key times out and returns false", () => {
			Mutex.lock("nested");
			// Not re-entrant: the same thread can never release the lock while blocked in Atomics.wait.
			const result = Mutex.lock("nested", { timeoutMs: 50 });
			expect(result).toEqual(false);
			Mutex.unlock("nested");
		});

		test("second lock on the same key throws when throwOnTimeout is true", () => {
			Mutex.lock("nested-throw");
			expect(() => Mutex.lock("nested-throw", { timeoutMs: 50, throwOnTimeout: true })).toThrow();
			Mutex.unlock("nested-throw");
		});

		test("lock is still held and usable after a nested attempt times out", () => {
			Mutex.lock("nested-recovery");
			Mutex.lock("nested-recovery", { timeoutMs: 50 });
			// The original holder should still be able to unlock normally.
			expect(() => Mutex.unlock("nested-recovery")).not.toThrow();
		});
	});

	describe("unlock", () => {
		test("releases a held lock without throwing", () => {
			Mutex.lock("key");
			expect(() => Mutex.unlock("key")).not.toThrow();
		});

		test("throws when key was never locked", () => {
			expect(() => Mutex.unlock("never-locked")).toThrow();
		});

		test("throws on double unlock", () => {
			Mutex.lock("double");
			Mutex.unlock("double");
			expect(() => Mutex.unlock("double")).toThrow();
		});

		test("throws on empty key", () => {
			expect(() => Mutex.unlock("")).toThrow();
		});

		test("retains the key entry in the registry after unlock with no waiters", () => {
			// parentPort is null in fork-mode test processes, so this process owns the
			// registry and never deletes entries — worker threads may still hold references.
			Mutex.lock("cleanup");
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
			const acquired = Mutex.lock("worker-key", { timeoutMs: 2000 });
			const elapsed = Date.now() - start;

			expect(acquired).toEqual(true);
			expect(elapsed).toBeGreaterThanOrEqual(150);
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

			expect(Mutex.lock("held-forever", { timeoutMs: 100 })).toEqual(false);
			await worker.terminate();
		});

		test("retains the key entry while a waiter is queued", async () => {
			// Main acquires first so the buffer is created in the registry before the worker starts.
			Mutex.lock("contested");

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
						Mutex.lock("fetch-timeout", { timeoutMs: 200, throwOnTimeout: true });
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
				Mutex.lock("stress-mixed", { timeoutMs: 5000 });
				const current = Atomics.load(counter, 0);
				Atomics.store(counter, 0, current + 1);
				Mutex.unlock("stress-mixed");
			}

			await Promise.all(exited);

			expect(Atomics.load(counter, 0)).toEqual(workerCount + mainIncrements);
		});
	});
});
