// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { SharedStore } from "../../src/utils/sharedStore.js";

describe("SharedStore", () => {
	test("can not get an object in the shared store", async () => {
		const val = SharedStore.get("test");

		expect(val).toBeUndefined();
	});

	test("can set an object in the shared store", async () => {
		SharedStore.set("test", { test: "test" });

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect((globalThis as any).__TWIN_SHARED__.test).toEqual({ test: "test" });
	});

	test("can get an object from the shared store", async () => {
		const test = SharedStore.get("test");

		expect(test).toEqual({ test: "test" });
	});

	test("can remove an object from the shared store", async () => {
		SharedStore.remove("test");

		const test = SharedStore.get("test");
		expect(test).toBeUndefined();
	});

	test("get with factory returns the factory value when the key is absent", () => {
		SharedStore.remove("factory-test");

		const result = SharedStore.get("factory-test", () => ({ created: true }));

		expect(result).toEqual({ created: true });
		expect(SharedStore.get("factory-test")).toEqual({ created: true });
	});

	test("get with factory returns the existing value without calling the factory again", () => {
		SharedStore.set("factory-existing", { value: 42 });

		let factoryCalls = 0;
		const result = SharedStore.get("factory-existing", () => {
			factoryCalls++;
			return { value: 99 };
		});

		expect(result).toEqual({ value: 42 });
		expect(factoryCalls).toBe(0);
	});

	test("get with factory stores a Promise atomically so concurrent callers share the same instance", async () => {
		SharedStore.remove("factory-promise");

		// Simulate concurrent callers: both call get before either awaits.
		// The factory is invoked synchronously so the Promise is stored before any
		// yield - the second caller finds it already present and skips the factory.
		let factoryCalls = 0;
		const factory = async (): Promise<object> => {
			factoryCalls++;
			return Promise.resolve({ id: factoryCalls });
		};

		const p1 = SharedStore.get<Promise<object>>("factory-promise", factory);
		const p2 = SharedStore.get<Promise<object>>("factory-promise", factory);

		const [v1, v2] = await Promise.all([p1, p2]);

		// Factory must have been called exactly once.
		expect(factoryCalls).toBe(1);
		// Both callers must resolve to the same object reference.
		expect(v1).toBe(v2);
	});
});
