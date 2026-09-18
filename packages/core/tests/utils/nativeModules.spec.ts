// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { NativeModules } from "../../src/utils/nativeModules.js";
import { SharedStore } from "../../src/utils/sharedStore.js";

describe("NativeModules", () => {
	test("typeExists is true for a global that exists in this environment", () => {
		expect(NativeModules.typeExists("Buffer")).toEqual(true);
	});

	test("typeExists is false for a name that is not a global", () => {
		expect(NativeModules.typeExists("thisGlobalDoesNotExist")).toEqual(false);
	});

	test("getModule returns undefined for a Node builtin that init() was never called for", () => {
		expect(NativeModules.getModule("node:crypto")).toBeUndefined();
	});

	test("getModule resolves a Node builtin once init() has registered it", async () => {
		await NativeModules.init(["node:crypto"]);

		// eslint-disable-next-line @typescript-eslint/consistent-type-imports
		const nodeCrypto = NativeModules.getModule<typeof import("node:crypto")>("node:crypto");
		expect(typeof nodeCrypto?.createHash).toEqual("function");
	});

	test("getModule returns undefined for a specifier that is neither registered nor a builtin", () => {
		expect(NativeModules.getModule("this-module-does-not-exist")).toBeUndefined();
	});

	test("init registers an importable, non-builtin module for getModule to return", async () => {
		const failures = await NativeModules.init(["rfc6902"]);

		expect(failures).toEqual({});

		const rfc6902Module = NativeModules.getModule<{ createPatch: unknown }>("rfc6902");
		expect(typeof rfc6902Module?.createPatch).toEqual("function");
	});

	test("init stores resolved modules in SharedStore, so multiple loaded copies of this class share one registry", async () => {
		await NativeModules.init(["rfc6902"]);

		const registry = SharedStore.get<{ [specifier: string]: { createPatch?: unknown } }>(
			"nativeModulesRegistry"
		);
		expect(typeof registry?.rfc6902?.createPatch).toEqual("function");
	});

	test("init reports a failed specifier instead of throwing, and leaves it unresolved", async () => {
		const failures = await NativeModules.init(["this-module-does-not-exist"]);

		expect(failures["this-module-does-not-exist"]).toEqual(
			expect.objectContaining({ name: expect.any(String), message: expect.any(String) })
		);
		expect(NativeModules.getModule("this-module-does-not-exist")).toBeUndefined();
	});
});
