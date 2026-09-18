// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter, NativeModules, SharedStore } from "@twin.org/core";
import testVectors from "./chacha20poly1305.json" with { type: "json" };
import { ChaCha20Poly1305 } from "../../src/ciphers/chaCha20Poly1305.js";

/**
 * Replace the registered "node:crypto" module for the duration of fn, restoring
 * whatever was registered (or nothing) beforehand.
 * @param nodeCryptoOverride The value getModule("node:crypto") should return meanwhile.
 * @param fn The test body to run with the override in place.
 */
async function withNodeCrypto(
	nodeCryptoOverride: unknown,
	fn: () => void | Promise<void>
): Promise<void> {
	const registry = SharedStore.get<{ [specifier: string]: unknown }>(
		"nativeModulesRegistry",
		() => ({})
	);
	const hadNodeCrypto = "node:crypto" in registry;
	const previousNodeCrypto = registry["node:crypto"];
	registry["node:crypto"] = nodeCryptoOverride;

	try {
		await fn();
	} finally {
		if (hadNodeCrypto) {
			registry["node:crypto"] = previousNodeCrypto;
		} else {
			delete registry["node:crypto"];
		}
	}
}

test("ChaCha20Poly1305 encrypt/decrypt test vectors", () => {
	// Test vector from RFC 7539 Section 2.8.1.
	for (const testVector of testVectors) {
		const key = Converter.hexToBytes(testVector.key);
		const nonce = Converter.hexToBytes(testVector.nonce);
		const plainText = Converter.hexToBytes(testVector.plainText);
		const aad = Converter.hexToBytes(testVector.aad);
		const authTag = testVector.authTag;

		const cipher = new ChaCha20Poly1305(key, nonce, aad);
		const cipherData = cipher.encrypt(plainText);
		expect(Converter.bytesToHex(cipherData)).toEqual(testVector.cipherText + authTag);

		const decipher = new ChaCha20Poly1305(key, nonce, aad);
		const decipherData = decipher.decrypt(cipherData);
		expect(Converter.bytesToHex(decipherData)).toEqual(Converter.bytesToHex(plainText));
	}
});

test("ChaCha20Poly1305 works without additional authenticated data", () => {
	const key = new Uint8Array(32).fill(11);
	const nonce = new Uint8Array(12).fill(22);
	const plainText = Converter.utf8ToBytes("a message with no associated data");

	const cipher = new ChaCha20Poly1305(key, nonce);
	const cipherData = cipher.encrypt(plainText);

	const decipher = new ChaCha20Poly1305(key, nonce);
	const decipherData = decipher.decrypt(cipherData);
	expect(Converter.bytesToUtf8(decipherData)).toEqual(Converter.bytesToUtf8(plainText));
});

test("ChaCha20Poly1305 decrypt throws when the auth tag has been tampered with", () => {
	const key = new Uint8Array(32).fill(3);
	const nonce = new Uint8Array(12).fill(4);
	const plainText = Converter.utf8ToBytes("tamper detection must survive the native swap");

	const cipher = new ChaCha20Poly1305(key, nonce);
	const cipherData = cipher.encrypt(plainText);
	cipherData[cipherData.length - 1] = (cipherData[cipherData.length - 1] + 1) % 256;

	const decipher = new ChaCha20Poly1305(key, nonce);
	expect(() => decipher.decrypt(cipherData)).toThrow();
});

test("Falls back to the pure JavaScript cipher when node:crypto does not list chacha20-poly1305 as supported", async () => {
	// Simulates a FIPS-restricted build, where node:crypto resolves and createCipheriv is a
	// function, but the algorithm itself is not available and calling it throws.
	await withNodeCrypto(
		{
			getCiphers: () => ["aes-256-gcm"],
			createCipheriv: () => {
				throw new Error("unsupported");
			},
			createDecipheriv: () => {
				throw new Error("unsupported");
			}
		},
		() => {
			const key = new Uint8Array(32).fill(5);
			const nonce = new Uint8Array(12).fill(6);
			const plainText = Converter.utf8ToBytes("falls back instead of throwing");

			const cipher = new ChaCha20Poly1305(key, nonce);
			const cipherData = cipher.encrypt(plainText);

			const decipher = new ChaCha20Poly1305(key, nonce);
			const decipherData = decipher.decrypt(cipherData);
			expect(Converter.bytesToUtf8(decipherData)).toEqual(Converter.bytesToUtf8(plainText));
		}
	);
});

test("Uses the native cipher once node:crypto has been registered via init()", async () => {
	await NativeModules.init(["node:crypto"]);

	const nodeCrypto = NativeModules.getModule<{
		createCipheriv: (...args: unknown[]) => unknown;
	}>("node:crypto");
	let createCipherivCalls = 0;
	const realCreateCipheriv = nodeCrypto?.createCipheriv.bind(nodeCrypto);

	await withNodeCrypto(
		{
			...nodeCrypto,
			createCipheriv: (...args: unknown[]) => {
				createCipherivCalls++;
				return realCreateCipheriv?.(...args);
			}
		},
		() => {
			const key = new Uint8Array(32).fill(7);
			const nonce = new Uint8Array(12).fill(8);
			const plainText = Converter.utf8ToBytes("proves the native path was actually invoked");

			const cipher = new ChaCha20Poly1305(key, nonce);
			const cipherData = cipher.encrypt(plainText);

			const decipher = new ChaCha20Poly1305(key, nonce);
			expect(Converter.bytesToUtf8(decipher.decrypt(cipherData))).toEqual(
				Converter.bytesToUtf8(plainText)
			);
			expect(createCipherivCalls).toEqual(1);
		}
	);
});

test("Uses the native cipher when node:crypto is available but Buffer is not exposed as a global", async () => {
	// A polyfilled/sandboxed runtime could resolve node:crypto without also exposing
	// Buffer as a global - the two are independent capabilities.
	await NativeModules.init(["node:crypto"]);

	const globalWithBuffer = globalThis as { Buffer?: unknown };
	const hadBuffer = "Buffer" in globalWithBuffer;
	const previousBuffer = globalWithBuffer.Buffer;
	delete globalWithBuffer.Buffer;

	try {
		const key = new Uint8Array(32).fill(13);
		const nonce = new Uint8Array(12).fill(14);
		const plainText = Converter.utf8ToBytes("works without a global Buffer");

		const cipher = new ChaCha20Poly1305(key, nonce);
		const cipherData = cipher.encrypt(plainText);

		const decipher = new ChaCha20Poly1305(key, nonce);
		expect(Converter.bytesToUtf8(decipher.decrypt(cipherData))).toEqual(
			Converter.bytesToUtf8(plainText)
		);
	} finally {
		if (hadBuffer) {
			globalWithBuffer.Buffer = previousBuffer;
		}
	}
});
