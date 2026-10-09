// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter } from "@3sixty/core";
import testData from "./hmacSha256.json" with { type: "json" };
import { HmacSha256 } from "../../src/hashes/hmacSha256.js";
import {
	NATIVE_CRYPTO_VARIANTS,
	unregisterNodeCrypto,
	useNativeCryptoVariant
} from "../nativeCryptoVariants.js";

describe.each(NATIVE_CRYPTO_VARIANTS)("HmacSha256 ($implementation)", ({ useNodeCrypto }) => {
	beforeAll(async () => {
		await useNativeCryptoVariant(useNodeCrypto);
	});

	afterAll(() => {
		unregisterNodeCrypto();
	});

	test("Can perform a hmac on short text", () => {
		const hmacSha256 = new HmacSha256(Converter.utf8ToBytes("mykey"));
		hmacSha256.update(Converter.utf8ToBytes("abc"));
		const digest2 = hmacSha256.digest();
		expect(Converter.bytesToHex(digest2)).toEqual(
			"19e13ec923a3e5ae829d18cb596bd3fad0705ccc147f9d1d914e8880d7e2e24c"
		);
	});

	test("Can perform a hmac on empty text", () => {
		const hmacSha256 = new HmacSha256(Converter.utf8ToBytes("mykey"));
		hmacSha256.update(Converter.utf8ToBytes(""));
		const digest2 = hmacSha256.digest();
		expect(Converter.bytesToHex(digest2)).toEqual(
			"e1b24265bf2e0b20c81837993b4f1415f7b68c503114d100a40601eca6a2745f"
		);
	});

	test("Can perform a hmac on sentence", () => {
		const hmacSha256 = new HmacSha256(Converter.utf8ToBytes("mykey"));
		hmacSha256.update(Converter.utf8ToBytes("The quick brown fox jumps over the lazy dog"));
		const digest2 = hmacSha256.digest();
		expect(Converter.bytesToHex(digest2)).toEqual(
			"73d4633e9ade7b197d6704c3ac5279456a44136f400edb332349592b7e2e8b2f"
		);
	});

	test("Can verify with test vectors", () => {
		for (const test of testData) {
			expect(
				Converter.bytesToHex(
					HmacSha256.sum256(Converter.hexToBytes(test.key), Converter.hexToBytes(test.input))
				)
			).toEqual(test.hash);
		}
	});

	test("Returns a plain Uint8Array rather than a platform buffer type", () => {
		const key = Converter.utf8ToBytes("key");
		const block = Converter.utf8ToBytes("message");

		expect(HmacSha256.sum224(key, block).constructor).toEqual(Uint8Array);
		expect(HmacSha256.sum256(key, block).constructor).toEqual(Uint8Array);
	});

	test("Can accumulate multiple updates into one digest", () => {
		const key = Converter.utf8ToBytes("key");
		const chunked = new HmacSha256(key);
		chunked.update(Converter.utf8ToBytes("The quick brown fox "));
		chunked.update(Converter.utf8ToBytes("jumps over the lazy dog"));

		const single = new HmacSha256(key);
		single.update(Converter.utf8ToBytes("The quick brown fox jumps over the lazy dog"));

		expect(chunked.digest()).toEqual(single.digest());
	});

	test("Produces the same digest as the other implementation", async () => {
		const key = Converter.utf8ToBytes("cross implementation key");
		const block = Converter.utf8ToBytes("cross implementation block ".repeat(10));
		const sum224 = HmacSha256.sum224(key, block);
		const sum256 = HmacSha256.sum256(key, block);

		await useNativeCryptoVariant(!useNodeCrypto);

		try {
			expect(HmacSha256.sum224(key, block)).toEqual(sum224);
			expect(HmacSha256.sum256(key, block)).toEqual(sum256);
		} finally {
			await useNativeCryptoVariant(useNodeCrypto);
		}
	});
});
