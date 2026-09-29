// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { NativeModules } from "@twin.org/core";
import { NativeModulesCrypto } from "../../src/helpers/nativeModulesCrypto.js";

/**
 * Drop node:crypto from the NativeModules registry.
 */
function unregisterNodeCrypto(): void {
	delete NativeModules.getRegistry()["node:crypto"];
}

describe("NativeModulesCrypto", () => {
	beforeEach(() => {
		unregisterNodeCrypto();
		NativeModulesCrypto.reset();
	});

	afterAll(() => {
		unregisterNodeCrypto();
		NativeModulesCrypto.reset();
	});

	describe("getNodeCryptoCipher", () => {
		test("returns undefined when node:crypto has not been registered", () => {
			expect(NativeModulesCrypto.getNodeCryptoCipher("chacha20-poly1305")).toBeUndefined();
		});

		test("returns the module when the cipher is supported", async () => {
			expect(await NativeModules.init(["node:crypto"])).toEqual({});

			const nodeCrypto = NativeModulesCrypto.getNodeCryptoCipher("chacha20-poly1305");
			expect(nodeCrypto).toBeDefined();
			expect(typeof nodeCrypto?.createCipheriv).toEqual("function");
		});

		test("returns undefined when the cipher is not one this build supports", async () => {
			expect(await NativeModules.init(["node:crypto"])).toEqual({});

			expect(NativeModulesCrypto.getNodeCryptoCipher("not-a-real-cipher")).toBeUndefined();
		});

		test("returns undefined when node:crypto resolves but omits the cipher", () => {
			// Mirrors a FIPS-restricted build, where the module is present and createCipheriv is
			// a function, but the algorithm is absent and calling it would throw
			NativeModules.getRegistry()["node:crypto"] = {
				getCiphers: () => ["aes-256-gcm"],
				createCipheriv: () => {
					throw new Error("unsupported");
				}
			};

			expect(NativeModulesCrypto.getNodeCryptoCipher("chacha20-poly1305")).toBeUndefined();
		});

		test("resolves each cipher independently", () => {
			NativeModules.getRegistry()["node:crypto"] = {
				getCiphers: () => ["aes-256-gcm"]
			};

			expect(NativeModulesCrypto.getNodeCryptoCipher("aes-256-gcm")).toBeDefined();
			expect(NativeModulesCrypto.getNodeCryptoCipher("chacha20-poly1305")).toBeUndefined();
		});
	});

	describe("getNodeCryptoHash", () => {
		test("returns undefined when node:crypto has not been registered", () => {
			expect(NativeModulesCrypto.getNodeCryptoHash("sha3-256")).toBeUndefined();
		});

		test("returns the module for each hash this build supports", async () => {
			expect(await NativeModules.init(["node:crypto"])).toEqual({});

			for (const hash of [
				"sha1",
				"sha256",
				"sha384",
				"sha512",
				"sha512-224",
				"sha512-256",
				"sha3-224",
				"sha3-256",
				"sha3-384",
				"sha3-512",
				"blake2b512"
			]) {
				expect(NativeModulesCrypto.getNodeCryptoHash(hash)).toBeDefined();
			}
		});

		test("returns undefined when the hash is not one this build supports", async () => {
			expect(await NativeModules.init(["node:crypto"])).toEqual({});

			expect(NativeModulesCrypto.getNodeCryptoHash("not-a-real-hash")).toBeUndefined();
		});

		test("returns undefined when node:crypto resolves but omits the hash", () => {
			NativeModules.getRegistry()["node:crypto"] = { getHashes: () => ["sha256"] };

			expect(NativeModulesCrypto.getNodeCryptoHash("sha256")).toBeDefined();
			expect(NativeModulesCrypto.getNodeCryptoHash("sha3-256")).toBeUndefined();
		});
	});

	describe("getNodeCryptoCurve", () => {
		test("returns undefined when node:crypto has not been registered", () => {
			expect(NativeModulesCrypto.getNodeCryptoCurve("secp256k1")).toBeUndefined();
		});

		test("returns the module when the curve is supported", async () => {
			expect(await NativeModules.init(["node:crypto"])).toEqual({});

			expect(NativeModulesCrypto.getNodeCryptoCurve("secp256k1")).toBeDefined();
		});

		test("returns undefined when the curve is not one this build supports", async () => {
			expect(await NativeModules.init(["node:crypto"])).toEqual({});

			expect(NativeModulesCrypto.getNodeCryptoCurve("not-a-real-curve")).toBeUndefined();
			// Ed25519 is absent from getCurves, which is why it has a resolver of its own
			expect(NativeModulesCrypto.getNodeCryptoCurve("ed25519")).toBeUndefined();
		});

		test("returns undefined when node:crypto resolves but omits the curve", () => {
			NativeModules.getRegistry()["node:crypto"] = { getCurves: () => ["prime256v1"] };

			expect(NativeModulesCrypto.getNodeCryptoCurve("prime256v1")).toBeDefined();
			expect(NativeModulesCrypto.getNodeCryptoCurve("secp256k1")).toBeUndefined();
		});
	});

	describe("getNodeCryptoArgon2", () => {
		test("returns undefined when node:crypto has not been registered", () => {
			expect(NativeModulesCrypto.getNodeCryptoArgon2()).toBeUndefined();
		});

		test("returns the module when argon2 is exposed", async () => {
			expect(await NativeModules.init(["node:crypto"])).toEqual({});

			expect(NativeModulesCrypto.getNodeCryptoArgon2()).toBeDefined();
		});

		test("returns undefined on a runtime older than the Node which added argon2", () => {
			NativeModules.getRegistry()["node:crypto"] = { createHash: () => undefined };

			expect(NativeModulesCrypto.getNodeCryptoArgon2()).toBeUndefined();
		});
	});

	describe("getNodeCryptoEd25519", () => {
		test("returns undefined when node:crypto has not been registered", () => {
			expect(NativeModulesCrypto.getNodeCryptoEd25519()).toBeUndefined();
		});

		test("returns the module when Ed25519 keys can be built", async () => {
			expect(await NativeModules.init(["node:crypto"])).toEqual({});

			expect(NativeModulesCrypto.getNodeCryptoEd25519()).toBeDefined();
		});

		test("returns undefined when building an Ed25519 key throws", () => {
			NativeModules.getRegistry()["node:crypto"] = {
				generateKeyPairSync: () => {
					throw new Error("unsupported");
				}
			};

			expect(NativeModulesCrypto.getNodeCryptoEd25519()).toBeUndefined();
		});

		test("caches the probe result until reset is called", async () => {
			let probes = 0;
			NativeModules.getRegistry()["node:crypto"] = {
				generateKeyPairSync: () => {
					probes++;
				}
			};

			NativeModulesCrypto.getNodeCryptoEd25519();
			NativeModulesCrypto.getNodeCryptoEd25519();
			expect(probes).toEqual(1);

			NativeModulesCrypto.reset();
			NativeModulesCrypto.getNodeCryptoEd25519();
			expect(probes).toEqual(2);
		});
	});
});
