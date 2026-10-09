// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter } from "@3sixty/core";
import testData from "./hmacSha512.json" with { type: "json" };
import { HmacSha512 } from "../../src/hashes/hmacSha512.js";
import {
	NATIVE_CRYPTO_VARIANTS,
	unregisterNodeCrypto,
	useNativeCryptoVariant
} from "../nativeCryptoVariants.js";

describe.each(NATIVE_CRYPTO_VARIANTS)("HmacSha512 ($implementation)", ({ useNodeCrypto }) => {
	beforeAll(async () => {
		await useNativeCryptoVariant(useNodeCrypto);
	});

	afterAll(() => {
		unregisterNodeCrypto();
	});

	test("Can perform a hmac on short text", () => {
		const hmacSha512 = new HmacSha512(Converter.utf8ToBytes("mykey"));
		hmacSha512.update(Converter.utf8ToBytes("abc"));
		const digest2 = hmacSha512.digest();
		expect(Converter.bytesToHex(digest2)).toEqual(
			"1facfdf577f1ab50db6c9b274a62024884d8c5e8484b4f5852e00e7acb2d96a83c70ed8c6acced4b2251472dbcea195bce4016af968320c1f7bdf3cdb3549ecf"
		);
	});

	test("Can perform a hmac on empty text", () => {
		const hmacSha512 = new HmacSha512(Converter.utf8ToBytes("mykey"));
		hmacSha512.update(Converter.utf8ToBytes(""));
		const digest2 = hmacSha512.digest();
		expect(Converter.bytesToHex(digest2)).toEqual(
			"0fce9150064e05f8743eb24f05c4e93c8265bfe1edb511dc3a614355de049989b347c7173c6f8abfe872519c79c2b4faee6787d7023d5e160b5fe4fdf79b1225"
		);
	});

	test("Can perform a hmac on sentence", () => {
		const hmacSha512 = new HmacSha512(Converter.utf8ToBytes("mykey"));
		hmacSha512.update(Converter.utf8ToBytes("The quick brown fox jumps over the lazy dog"));
		const digest2 = hmacSha512.digest();
		expect(Converter.bytesToHex(digest2)).toEqual(
			"36428b004e849827c41015a3d8a51363d58b916697d6755043be182b7ed610c44e6fec3cc8eb3ef53e2a46affc3f42b33764497271f13a4928df631dd083376e"
		);
	});

	test("Can verify with test vectors", () => {
		for (const test of testData) {
			expect(
				Converter.bytesToHex(
					HmacSha512.sum512(Converter.hexToBytes(test.key), Converter.hexToBytes(test.input))
				)
			).toEqual(test.hash);
		}
	});

	test("Returns a plain Uint8Array rather than a platform buffer type", () => {
		const key = Converter.utf8ToBytes("key");
		const block = Converter.utf8ToBytes("message");

		expect(HmacSha512.sum224(key, block).constructor).toEqual(Uint8Array);
		expect(HmacSha512.sum256(key, block).constructor).toEqual(Uint8Array);
		expect(HmacSha512.sum384(key, block).constructor).toEqual(Uint8Array);
		expect(HmacSha512.sum512(key, block).constructor).toEqual(Uint8Array);
	});

	test("Can accumulate multiple updates into one digest", () => {
		const key = Converter.utf8ToBytes("key");
		const chunked = new HmacSha512(key);
		chunked.update(Converter.utf8ToBytes("The quick brown fox "));
		chunked.update(Converter.utf8ToBytes("jumps over the lazy dog"));

		const single = new HmacSha512(key);
		single.update(Converter.utf8ToBytes("The quick brown fox jumps over the lazy dog"));

		expect(chunked.digest()).toEqual(single.digest());
	});

	test("Produces the same digest as the other implementation", async () => {
		const key = Converter.utf8ToBytes("cross implementation key");
		const block = Converter.utf8ToBytes("cross implementation block ".repeat(10));
		const sum224 = HmacSha512.sum224(key, block);
		const sum256 = HmacSha512.sum256(key, block);
		const sum384 = HmacSha512.sum384(key, block);
		const sum512 = HmacSha512.sum512(key, block);

		await useNativeCryptoVariant(!useNodeCrypto);

		try {
			expect(HmacSha512.sum224(key, block)).toEqual(sum224);
			expect(HmacSha512.sum256(key, block)).toEqual(sum256);
			expect(HmacSha512.sum384(key, block)).toEqual(sum384);
			expect(HmacSha512.sum512(key, block)).toEqual(sum512);
		} finally {
			await useNativeCryptoVariant(useNodeCrypto);
		}
	});
});
