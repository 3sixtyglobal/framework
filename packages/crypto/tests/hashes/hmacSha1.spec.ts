// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter } from "@twin.org/core";
import testData from "./hmacSha1.json" with { type: "json" };
import { HmacSha1 } from "../../src/hashes/hmacSha1.js";
import {
	NATIVE_CRYPTO_VARIANTS,
	unregisterNodeCrypto,
	useNativeCryptoVariant
} from "../nativeCryptoVariants.js";

describe.each(NATIVE_CRYPTO_VARIANTS)("HmacSha1 ($implementation)", ({ useNodeCrypto }) => {
	beforeAll(async () => {
		await useNativeCryptoVariant(useNodeCrypto);
	});

	afterAll(() => {
		unregisterNodeCrypto();
	});

	test("Can perform a hmac on short text", () => {
		const hmacSha1 = new HmacSha1(Converter.utf8ToBytes("mykey"));
		hmacSha1.update(Converter.utf8ToBytes("abc"));
		const digest2 = hmacSha1.digest();
		expect(Converter.bytesToHex(digest2)).toEqual("8af7406c03bdd72532a4c3cee98b991e39524485");
	});

	test("Can perform a hmac on empty text", () => {
		const hmacSha1 = new HmacSha1(Converter.utf8ToBytes("mykey"));
		hmacSha1.update(Converter.utf8ToBytes(""));
		const digest2 = hmacSha1.digest();
		expect(Converter.bytesToHex(digest2)).toEqual("5bb9c066a336f0e6f17d7ddac4e43de7a94a6c9a");
	});

	test("Can perform a hmac on sentence", () => {
		const hmacSha1 = new HmacSha1(Converter.utf8ToBytes("mykey"));
		hmacSha1.update(Converter.utf8ToBytes("The quick brown fox jumps over the lazy dog"));
		const digest2 = hmacSha1.digest();
		expect(Converter.bytesToHex(digest2)).toEqual("5844898d8dace07a98f16ba1619795553ac37c4b");
	});

	test("Can verify with test vectors", () => {
		for (const test of testData) {
			expect(
				Converter.bytesToHex(
					HmacSha1.sum(Converter.hexToBytes(test.key), Converter.hexToBytes(test.input))
				)
			).toEqual(test.hash);
		}
	});

	test("Returns a plain Uint8Array rather than a platform buffer type", () => {
		const key = Converter.utf8ToBytes("key");
		const block = Converter.utf8ToBytes("message");

		expect(HmacSha1.sum(key, block).constructor).toEqual(Uint8Array);
	});

	test("Can accumulate multiple updates into one digest", () => {
		const key = Converter.utf8ToBytes("key");
		const chunked = new HmacSha1(key);
		chunked.update(Converter.utf8ToBytes("The quick brown fox "));
		chunked.update(Converter.utf8ToBytes("jumps over the lazy dog"));

		const single = new HmacSha1(key);
		single.update(Converter.utf8ToBytes("The quick brown fox jumps over the lazy dog"));

		expect(chunked.digest()).toEqual(single.digest());
	});

	test("Produces the same digest as the other implementation", async () => {
		const key = Converter.utf8ToBytes("cross implementation key");
		const block = Converter.utf8ToBytes("cross implementation block ".repeat(10));
		const sum = HmacSha1.sum(key, block);

		await useNativeCryptoVariant(!useNodeCrypto);

		try {
			expect(HmacSha1.sum(key, block)).toEqual(sum);
		} finally {
			await useNativeCryptoVariant(useNodeCrypto);
		}
	});
});
