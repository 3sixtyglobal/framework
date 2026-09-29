// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter } from "@twin.org/core";
import testData from "./x25519.json" with { type: "json" };
import { X25519 } from "../../src/curves/x25519.js";
import {
	NATIVE_CRYPTO_VARIANTS,
	unregisterNodeCrypto,
	useNativeCryptoVariant
} from "../nativeCryptoVariants.js";

// https://github.com/hdevalence/ed25519consensus/blob/main/zip215_test.go
describe.each(NATIVE_CRYPTO_VARIANTS)("X25519 ($implementation)", ({ useNodeCrypto }) => {
	beforeAll(async () => {
		await useNativeCryptoVariant(useNodeCrypto);
	});

	afterAll(() => {
		unregisterNodeCrypto();
	});

	test("Can verify with standard tests", () => {
		for (const test of testData) {
			const ed25519PrivateKey = Converter.hexToBytes(test.ePrivateKey);
			const ed25519PublicKey = Converter.hexToBytes(test.ePublicKey);

			const xPrivate = X25519.convertPrivateKeyToX25519(ed25519PrivateKey);
			const xPublic = X25519.convertPublicKeyToX25519(ed25519PublicKey);

			expect(Converter.bytesToHex(xPrivate)).toEqual(test.xPrivateKey);
			expect(Converter.bytesToHex(xPublic)).toEqual(test.xPublicKey);
		}
	});

	test("Converts a private key the same way as the other implementation", async () => {
		const seeds = [new Uint8Array(32).fill(9), new Uint8Array(32).fill(1), new Uint8Array(32)];
		const converted = seeds.map(seed => X25519.convertPrivateKeyToX25519(seed));

		await useNativeCryptoVariant(!useNodeCrypto);

		try {
			expect(seeds.map(seed => X25519.convertPrivateKeyToX25519(seed))).toEqual(converted);
		} finally {
			await useNativeCryptoVariant(useNodeCrypto);
		}
	});

	test("Clamps the converted private key", () => {
		const secret = X25519.convertPrivateKeyToX25519(new Uint8Array(32).fill(9));

		expect(secret.length).toEqual(32);
		// Low three bits clear, top bit clear, second to top bit set
		expect(secret[0] % 8).toEqual(0);
		expect(secret[31]).toBeGreaterThanOrEqual(64);
		expect(secret[31]).toBeLessThan(128);
	});

	test("Returns a plain Uint8Array rather than a platform buffer type", () => {
		expect(X25519.convertPrivateKeyToX25519(new Uint8Array(32).fill(9)).constructor).toEqual(
			Uint8Array
		);
	});
});
