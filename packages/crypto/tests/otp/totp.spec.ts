// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter } from "@3sixty/core";
import { Totp } from "../../src/otp/totp.js";
import {
	NATIVE_CRYPTO_VARIANTS,
	unregisterNodeCrypto,
	useNativeCryptoVariant
} from "../nativeCryptoVariants.js";

describe.each(NATIVE_CRYPTO_VARIANTS)("Totp ($implementation)", ({ useNodeCrypto }) => {
	beforeAll(async () => {
		await useNativeCryptoVariant(useNodeCrypto);
	});

	afterAll(() => {
		unregisterNodeCrypto();
	});

	test("can generate and verify OTP", () => {
		const key = Converter.utf8ToBytes("12345678901234567890");

		const baseTime = 10000000;
		const interval = 30;

		const times = [baseTime, baseTime - interval, baseTime + interval];
		const otps = ["612788", "612788", "612788"];
		const deltas = [0, 1, -1];

		for (let i = 0; i < times.length; i++) {
			expect(Totp.generate(key, interval, baseTime * 1000)).toEqual(otps[i]);
			expect(Totp.verify(otps[i], key, 2, interval, times[i] * 1000)).toEqual(deltas[i]);
		}
	});

	test("matches the RFC 6238 sha1 vector", () => {
		const key = Converter.utf8ToBytes("12345678901234567890");

		expect(Totp.generate(key, 30, 59000)).toEqual("287082");
	});

	test("generates the same code across a whole interval and a new one after it", () => {
		const key = Converter.utf8ToBytes("12345678901234567890");

		expect(Totp.generate(key, 30, 60000)).toEqual(Totp.generate(key, 30, 89999));
		expect(Totp.generate(key, 30, 60000)).not.toEqual(Totp.generate(key, 30, 90000));
	});

	test("honours a non default interval", () => {
		const key = Converter.utf8ToBytes("12345678901234567890");

		expect(Totp.generate(key, 60, 59000)).toEqual(Totp.generate(key, 60, 1000));
		expect(Totp.generate(key, 60, 59000)).not.toEqual(Totp.generate(key, 30, 59000));
	});

	test("produces the same codes as the other implementation", async () => {
		const key = Converter.utf8ToBytes("12345678901234567890");
		const stamps = [0, 59000, 1111111109000, 1234567890000, 2000000000000];
		const intervals = [15, 30, 60];
		const codes = intervals.flatMap(i => stamps.map(t => Totp.generate(key, i, t)));

		await useNativeCryptoVariant(!useNodeCrypto);

		try {
			expect(intervals.flatMap(i => stamps.map(t => Totp.generate(key, i, t)))).toEqual(codes);
		} finally {
			await useNativeCryptoVariant(useNodeCrypto);
		}
	});
});
