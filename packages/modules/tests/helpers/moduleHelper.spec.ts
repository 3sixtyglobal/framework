// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { Coerce, Mutex } from "@twin.org/core";
import { ModuleHelper } from "../../src/helpers/moduleHelper.js";

const TEST_MODULE = `file://${path.join(__dirname, "testModule.js")}`;

describe("ModuleHelper", () => {
	test("getModuleEntry can throw if a module does not exist", async () => {
		await expect(ModuleHelper.getModuleEntry("non-existing-module", "entry")).rejects.toMatchObject(
			{
				name: "GeneralError",
				source: "ModuleHelper",
				message: "moduleHelper.moduleNotFound",
				properties: {
					module: "non-existing-module",
					entry: "entry"
				}
			}
		);
	});

	test("getModuleEntry can throw if a module entry does not exist", async () => {
		await expect(
			ModuleHelper.getModuleEntry(TEST_MODULE, "non-existing-entry")
		).rejects.toMatchObject({
			name: "GeneralError",
			source: "ModuleHelper",
			message: "moduleHelper.entryNotFound",
			properties: {
				module: TEST_MODULE,
				entry: "non-existing-entry"
			}
		});
	});

	test("execModuleMethod can throw if it is not a function", async () => {
		await expect(ModuleHelper.execModuleMethod(TEST_MODULE, "testValue")).rejects.toMatchObject({
			name: "GeneralError",
			source: "ModuleHelper",
			message: "moduleHelper.notFunction",
			properties: {
				module: TEST_MODULE,
				method: "testValue"
			}
		});
	});

	test("execModuleMethod can get a result from a function with no parameters", async () => {
		expect(await ModuleHelper.execModuleMethod(TEST_MODULE, "testMethod")).toEqual(1);
	});

	test("execModuleMethod can get a result from a function with parameters", async () => {
		expect(await ModuleHelper.execModuleMethod(TEST_MODULE, "testMethodAdd", [1, 2])).toEqual(3);
	});

	test("execModuleMethod can get a result from a function with parameters async", async () => {
		expect(await ModuleHelper.execModuleMethod(TEST_MODULE, "testMethodAddAsync", [4, 5])).toEqual(
			20
		);
	});

	test("execModuleMethod can get a result from a function with parameters from a module", async () => {
		expect(
			await ModuleHelper.execModuleMethod("@twin.org/core", "StringHelper.camelCase", ["foo-bar"])
		).toEqual("fooBar");
	});

	test("execModuleMethodThread can throw if a module does not exist", async () => {
		await expect(
			ModuleHelper.execModuleMethodThread("non-existing-module", "entry")
		).rejects.toMatchObject({
			name: "GeneralError",
			source: "ModuleHelper",
			message: "moduleHelper.moduleNotFound"
		});
	});

	test("execModuleMethodThread can throw if a module method does not exist", async () => {
		await expect(
			ModuleHelper.execModuleMethodThread(TEST_MODULE, "non-existing-method")
		).rejects.toMatchObject({
			name: "GeneralError",
			source: "ModuleHelper",
			message: "moduleHelper.entryNotFound",
			properties: {
				module: TEST_MODULE,
				method: "non-existing-method"
			}
		});
	});

	test("execModuleMethodThread can throw if it is not a function", async () => {
		await expect(
			ModuleHelper.execModuleMethodThread(TEST_MODULE, "testValue")
		).rejects.toMatchObject({
			name: "GeneralError",
			source: "ModuleHelper",
			message: "moduleHelper.notFunction",
			properties: {
				module: TEST_MODULE,
				method: "testValue"
			}
		});
	});

	test("execModuleMethodThread can get a result from a function with no parameters", async () => {
		expect(await ModuleHelper.execModuleMethodThread(TEST_MODULE, "testMethod")).toEqual(1);
	});

	test("execModuleMethodThread can get a result from a function with parameters", async () => {
		expect(await ModuleHelper.execModuleMethodThread(TEST_MODULE, "testMethodAdd", [1, 2])).toEqual(
			3
		);
	});

	test("execModuleMethodThread can get a result from a function with parameters async", async () => {
		expect(
			await ModuleHelper.execModuleMethodThread(TEST_MODULE, "testMethodAddAsync", [4, 5])
		).toEqual(20);
	});

	test("execModuleMethodThread can get a result from a function with parameters from a module", async () => {
		expect(
			await ModuleHelper.execModuleMethodThread("@twin.org/core", "StringHelper.camelCase", [
				"foo-bar"
			])
		).toEqual("fooBar");
	});

	test("execModuleMethodThread can throw if a function throws an error", async () => {
		await expect(
			ModuleHelper.execModuleMethodThread(TEST_MODULE, "testMethodWithError")
		).rejects.toMatchObject({
			name: "GeneralError",
			source: "ModuleHelper",
			message: "moduleHelper.resultError",
			properties: {
				module: TEST_MODULE,
				method: "testMethodWithError"
			},
			cause: { name: "Error", message: "This is a test error" }
		});
	});

	test("execModuleMethodThread can throw if a function throws an error async", async () => {
		await expect(
			ModuleHelper.execModuleMethodThread(TEST_MODULE, "testMethodWithErrorAsync")
		).rejects.toMatchObject({
			name: "GeneralError",
			source: "ModuleHelper",
			message: "moduleHelper.resultError",
			properties: {
				module: TEST_MODULE,
				method: "testMethodWithErrorAsync"
			},
			cause: { name: "Error", message: "This is a test error async" }
		});
	});

	test("execModuleMethodThread can propogate context ids to the module method", async () => {
		const res = await ModuleHelper.execModuleMethodThread(
			TEST_MODULE,
			"testMethodWithContextIds",
			undefined,
			{ node: "node-123", org: "org-456" }
		);

		expect(res).toEqual({ node: "node-123", org: "org-456" });
	});

	test("execModuleMethodThreadMessage can run a long background task", async () => {
		let finalTotal = 0;
		let endCalled = false;
		const taskResults: number[] = [];
		let taskResultsResolved = false;
		let resolveTaskResults: (() => void) | undefined;
		let resolveTaskEnd: (() => void) | undefined;

		const allTaskResultsPromise = new Promise<void>(resolve => {
			resolveTaskResults = resolve;
		});

		const taskEndPromise = new Promise<void>(resolve => {
			resolveTaskEnd = resolve;
		});
		const module = ModuleHelper.execModuleMethodThreadMessage(
			TEST_MODULE,
			(operation, result, err) => {
				if (operation === "testEndTaskRunner") {
					endCalled = true;
					finalTotal = Coerce.number(result) ?? 0;
					resolveTaskEnd?.();
				} else {
					taskResults.push(Coerce.number(result) ?? 0);

					if (taskResults.length === 3 && !taskResultsResolved) {
						taskResultsResolved = true;
						resolveTaskResults?.();
					}
				}
			}
		);

		module.executeMethod("testStartTaskRunner");
		module.executeMethod("testTask", [1]);
		module.executeMethod("testTask", [2]);
		module.executeMethod("testTask", [3]);

		await Promise.race([
			allTaskResultsPromise,
			new Promise<void>((resolve, reject) => {
				setTimeout(() => reject(new Error("Timed out waiting for task results")), 3000);
			})
		]);

		module.executeMethod("testEndTaskRunner");

		await Promise.race([
			taskEndPromise,
			new Promise<void>((resolve, reject) => {
				setTimeout(() => reject(new Error("Timed out waiting for task runner end")), 3000);
			})
		]);

		expect(taskResults).toEqual([1, 3, 6]);
		expect(finalTotal).toEqual(6);
		expect(endCalled).toBeTruthy();
	});

	describe("mutex", () => {
		test("execModuleMethodThread worker can acquire and release a mutex", async () => {
			const result = await ModuleHelper.execModuleMethodThread(
				TEST_MODULE,
				"testMethodAcquireMutex",
				["mutex-acquire"]
			);
			expect(result).toEqual("acquired");
		});

		test("execModuleMethodThread worker blocks on a mutex held by the main thread", async () => {
			await Mutex.lock("mutex-main-holds");

			const workerPromise = ModuleHelper.execModuleMethodThread(
				TEST_MODULE,
				"testMethodAcquireMutex",
				["mutex-main-holds"]
			);

			// Give the worker time to start and block on the mutex.
			await new Promise<void>(resolve => {
				setTimeout(resolve, 100);
			});

			Mutex.unlock("mutex-main-holds");

			await expect(workerPromise).resolves.toEqual("acquired");
		});

		test("main thread blocks on a mutex held by a worker", async () => {
			const signalBuf = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
			const signal = new Int32Array(signalBuf);

			// Worker acquires the mutex, sets the signal, holds for 200ms, then releases.
			const workerPromise = ModuleHelper.execModuleMethodThread(
				TEST_MODULE,
				"testMethodAcquireMutexSignalled",
				["mutex-worker-holds", signalBuf, 200]
			);

			// Poll (non-blocking) until the worker signals it holds the mutex.
			// Atomics.wait cannot be used here — it would block this thread's event loop
			// and prevent it from servicing the worker's buffer-fetch request, causing a deadlock.
			const deadline = Date.now() + 5000;
			while (Atomics.load(signal, 0) === 0 && Date.now() < deadline) {
				await new Promise<void>(resolve => {
					setTimeout(resolve, 10);
				});
			}
			expect(Atomics.load(signal, 0)).toEqual(1);

			const start = Date.now();
			await Mutex.lock("mutex-worker-holds", { timeoutMs: 5000 });
			const elapsed = Date.now() - start;
			Mutex.unlock("mutex-worker-holds");

			await workerPromise;
			expect(elapsed).toBeGreaterThanOrEqual(100);
		});

		test("execModuleMethodThread worker times out waiting for a mutex held by the main thread", async () => {
			await Mutex.lock("mutex-timeout");

			const result = await ModuleHelper.execModuleMethodThread(
				TEST_MODULE,
				"testMethodTryAcquireMutex",
				["mutex-timeout", 50]
			);

			Mutex.unlock("mutex-timeout");
			expect(result).toEqual(false);
		});
	});

	describe("parallel mutex", () => {
		test("20 concurrent workers serialize counter increments under mutex with no lost updates", async () => {
			const workerCount = 20;
			const counterBuf = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
			const counter = new Int32Array(counterBuf);

			await Promise.all(
				Array.from({ length: workerCount }, async () =>
					ModuleHelper.execModuleMethodThread(TEST_MODULE, "testMethodMutexIncrement", [
						"concurrent-increment",
						counterBuf
					])
				)
			);

			expect(Atomics.load(counter, 0)).toEqual(workerCount);
		}, 30000);

		test("main thread and 10 workers interleaving increments under mutex produce the correct total", async () => {
			const workerCount = 10;
			const mainIncrements = 5;
			const counterBuf = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
			const counter = new Int32Array(counterBuf);

			const workerPromises = Array.from({ length: workerCount }, async () =>
				ModuleHelper.execModuleMethodThread(TEST_MODULE, "testMethodMutexIncrement", [
					"mixed-parallel",
					counterBuf
				])
			);

			for (let i = 0; i < mainIncrements; i++) {
				await Mutex.lock("mixed-parallel", { timeoutMs: 10000 });
				const val = Atomics.load(counter, 0);
				Atomics.store(counter, 0, val + 1);
				Mutex.unlock("mixed-parallel");
			}

			await Promise.all(workerPromises);
			expect(Atomics.load(counter, 0)).toEqual(workerCount + mainIncrements);
		}, 30000);

		test("30 concurrent workers under high load produce no lost counter updates", async () => {
			const workerCount = 30;
			const counterBuf = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
			const counter = new Int32Array(counterBuf);

			await Promise.all(
				Array.from({ length: workerCount }, async () =>
					ModuleHelper.execModuleMethodThread(TEST_MODULE, "testMethodMutexIncrement", [
						"high-load",
						counterBuf
					])
				)
			);

			expect(Atomics.load(counter, 0)).toEqual(workerCount);
		}, 30000);

		test("10 persistent workers via execModuleMethodThreadMessage produce no lost counter updates", async () => {
			const workerCount = 10;
			const counterBuf = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
			const counter = new Int32Array(counterBuf);

			await Promise.all(
				Array.from(
					{ length: workerCount },
					async () =>
						new Promise<void>((resolve, reject) => {
							const m = ModuleHelper.execModuleMethodThreadMessage(
								TEST_MODULE,
								(operation, result, err) => {
									if (err) {
										reject(err);
									} else if (operation === "testMethodMutexIncrement") {
										resolve();
									}
								}
							);
							m.executeMethod("testMethodMutexIncrement", ["persistent-increment", counterBuf]);
						})
				)
			);

			expect(Atomics.load(counter, 0)).toEqual(workerCount);
		}, 30000);
	});

	test("execModuleMethodThreadMessage can terminate a long background task", async () => {
		let op;
		let opResult;
		const module = ModuleHelper.execModuleMethodThreadMessage(
			TEST_MODULE,
			(operation, result, err) => {
				op = operation;
				opResult = result;
			}
		);

		module.executeMethod("testStartTaskRunner");
		await new Promise<void>(resolve => setTimeout(() => resolve(), 500));

		await module.terminate();
		expect(op).toEqual("terminate");
		expect(opResult).toEqual(1);
	});
});
