// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter, NativeModules } from "@twin.org/core";
import testVectors from "./chacha20poly1305.json" with { type: "json" };
import { ChaCha20Poly1305 } from "../../src/ciphers/chaCha20Poly1305.js";
import {
	NATIVE_CRYPTO_VARIANTS,
	unregisterNodeCrypto,
	useNativeCryptoVariant
} from "../nativeCryptoVariants.js";

describe.each(NATIVE_CRYPTO_VARIANTS)("ChaCha20Poly1305 ($implementation)", ({ useNodeCrypto }) => {
	beforeAll(async () => {
		await useNativeCryptoVariant(useNodeCrypto);
		if (useNodeCrypto) {
			// The native path is only taken when OpenSSL lists the algorithm, so a build
			// without it would otherwise run this variant as pure JavaScript in disguise
			const nodeCrypto = NativeModules.getModule<{ getCiphers: () => string[] }>("node:crypto");
			expect(nodeCrypto?.getCiphers()).toContain("chacha20-poly1305");
		}
	});

	afterAll(() => {
		unregisterNodeCrypto();
	});

	test("encrypt/decrypt test vectors", () => {
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

	test("works without additional authenticated data", () => {
		const key = new Uint8Array(32).fill(11);
		const nonce = new Uint8Array(12).fill(22);
		const plainText = Converter.utf8ToBytes("a message with no associated data");

		const cipher = new ChaCha20Poly1305(key, nonce);
		const cipherData = cipher.encrypt(plainText);

		const decipher = new ChaCha20Poly1305(key, nonce);
		const decipherData = decipher.decrypt(cipherData);
		expect(Converter.bytesToUtf8(decipherData)).toEqual(Converter.bytesToUtf8(plainText));
	});

	test("round-trips an empty block", () => {
		const key = new Uint8Array(32).fill(1);
		const nonce = new Uint8Array(12).fill(2);

		const cipher = new ChaCha20Poly1305(key, nonce);
		const cipherData = cipher.encrypt(new Uint8Array());

		const decipher = new ChaCha20Poly1305(key, nonce);
		expect(decipher.decrypt(cipherData)).toEqual(new Uint8Array());
	});

	test("round-trips a block larger than a single ChaCha20 block", () => {
		const key = new Uint8Array(32).fill(9);
		const nonce = new Uint8Array(12).fill(10);
		const plainText = new Uint8Array(4096);
		for (let i = 0; i < plainText.length; i++) {
			plainText[i] = i % 256;
		}

		const cipher = new ChaCha20Poly1305(key, nonce);
		const cipherData = cipher.encrypt(plainText);
		expect(cipherData.length).toEqual(plainText.length + 16);

		const decipher = new ChaCha20Poly1305(key, nonce);
		expect(decipher.decrypt(cipherData)).toEqual(plainText);
	});

	test("decrypt throws when the auth tag has been tampered with", () => {
		const key = new Uint8Array(32).fill(3);
		const nonce = new Uint8Array(12).fill(4);
		const plainText = Converter.utf8ToBytes("tamper detection must survive the native swap");

		const cipher = new ChaCha20Poly1305(key, nonce);
		const cipherData = cipher.encrypt(plainText);
		cipherData[cipherData.length - 1] = (cipherData[cipherData.length - 1] + 1) % 256;

		const decipher = new ChaCha20Poly1305(key, nonce);
		expect(() => decipher.decrypt(cipherData)).toThrow();
	});

	test("decrypt throws when the cipher text has been tampered with", () => {
		const key = new Uint8Array(32).fill(15);
		const nonce = new Uint8Array(12).fill(16);
		const plainText = Converter.utf8ToBytes("the body must be authenticated too");

		const cipher = new ChaCha20Poly1305(key, nonce);
		const cipherData = cipher.encrypt(plainText);
		cipherData[0] = (cipherData[0] + 1) % 256;

		const decipher = new ChaCha20Poly1305(key, nonce);
		expect(() => decipher.decrypt(cipherData)).toThrow();
	});

	test("decrypt throws when the additional authenticated data does not match", () => {
		const key = new Uint8Array(32).fill(17);
		const nonce = new Uint8Array(12).fill(18);
		const plainText = Converter.utf8ToBytes("aad is covered by the tag");

		const cipher = new ChaCha20Poly1305(key, nonce, Converter.utf8ToBytes("expected"));
		const cipherData = cipher.encrypt(plainText);

		const decipher = new ChaCha20Poly1305(key, nonce, Converter.utf8ToBytes("different"));
		expect(() => decipher.decrypt(cipherData)).toThrow();
	});

	test("produces cipher text the other implementation can decrypt", async () => {
		const key = new Uint8Array(32).fill(19);
		const nonce = new Uint8Array(12).fill(20);
		const aad = Converter.utf8ToBytes("cross implementation aad");
		const plainText = Converter.utf8ToBytes("interoperable between native and pure ".repeat(10));

		const cipherData = new ChaCha20Poly1305(key, nonce, aad).encrypt(plainText);

		// Flip to the opposite implementation, so this really does cross the two.
		await useNativeCryptoVariant(!useNodeCrypto);

		try {
			const decipher = new ChaCha20Poly1305(key, nonce, aad);
			expect(decipher.decrypt(cipherData)).toEqual(plainText);
		} finally {
			// Put the registry back, as the remaining tests in this block rely on it.
			await useNativeCryptoVariant(useNodeCrypto);
		}
	});
});
