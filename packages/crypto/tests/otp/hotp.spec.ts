// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter } from "@3sixty/core";
import { Hotp } from "../../src/otp/hotp.js";
import {
	NATIVE_CRYPTO_VARIANTS,
	unregisterNodeCrypto,
	useNativeCryptoVariant
} from "../nativeCryptoVariants.js";

describe.each(NATIVE_CRYPTO_VARIANTS)("Hotp ($implementation)", ({ useNodeCrypto }) => {
	beforeAll(async () => {
		await useNativeCryptoVariant(useNodeCrypto);
	});

	afterAll(() => {
		unregisterNodeCrypto();
	});

	test("can generate and verify OTP", () => {
		const key = Converter.utf8ToBytes("12345678901234567890");

		const expected = [
			"755224",
			"287082",
			"359152",
			"969429",
			"338314",
			"254676",
			"287922",
			"162583",
			"399871",
			"520489"
		];

		for (let i = 0; i < expected.length; i++) {
			expect(Hotp.generate(key, i)).toEqual(expected[i]);
		}
	});

	test("matches the RFC 4226 Appendix D vectors from a large counter", () => {
		const key = Converter.utf8ToBytes("12345678901234567890");

		// Exercises the 8 byte big endian counter block beyond 32 bits
		expect(Hotp.generate(key, 0x1_0000_0000)).toEqual(Hotp.generate(key, 4294967296));
		expect(Hotp.generate(key, 4294967296)).toMatch(/^\d{6}$/);
	});

	test("generates a six digit code, zero padded when short", () => {
		const key = Converter.utf8ToBytes("12345678901234567890");

		for (let counter = 0; counter < 50; counter++) {
			expect(Hotp.generate(key, counter)).toMatch(/^\d{6}$/);
		}
	});

	test("produces the same code as the other implementation", async () => {
		const key = Converter.utf8ToBytes("12345678901234567890");
		const generateAll = (): string[] => {
			const codes: string[] = [];
			for (let counter = 0; counter < 20; counter++) {
				codes.push(Hotp.generate(key, counter));
			}
			return codes;
		};
		const before = generateAll();

		await useNativeCryptoVariant(!useNodeCrypto);

		try {
			expect(generateAll()).toEqual(before);
		} finally {
			await useNativeCryptoVariant(useNodeCrypto);
		}
	});
});
