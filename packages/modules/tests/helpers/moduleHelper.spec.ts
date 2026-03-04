// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { Coerce } from "@twin.org/core";
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
			new Promise<void>((_, reject) => {
				setTimeout(() => reject(new Error("Timed out waiting for task results")), 3000);
			})
		]);

		module.executeMethod("testEndTaskRunner");

		await Promise.race([
			taskEndPromise,
			new Promise<void>((_, reject) => {
				setTimeout(() => reject(new Error("Timed out waiting for task runner end")), 3000);
			})
		]);

		expect(taskResults).toEqual([1, 3, 6]);
		expect(finalTotal).toEqual(6);
		expect(endCalled).toBeTruthy();
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
