// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter } from "@3sixty/core";
import { Pbkdf2 } from "../../src/hashes/pbkdf2.js";
import {
	NATIVE_CRYPTO_VARIANTS,
	unregisterNodeCrypto,
	useNativeCryptoVariant
} from "../nativeCryptoVariants.js";

describe.each(NATIVE_CRYPTO_VARIANTS)("Pbkdf2 ($implementation)", ({ useNodeCrypto }) => {
	beforeAll(async () => {
		await useNativeCryptoVariant(useNodeCrypto);
	});

	afterAll(() => {
		unregisterNodeCrypto();
	});

	test("Can derive a key with sha256 using the RFC 6070 style vectors", () => {
		expect(
			Converter.bytesToHex(
				Pbkdf2.sha256(Converter.utf8ToBytes("password"), Converter.utf8ToBytes("salt"), 1, 20)
			)
		).toEqual("120fb6cffcf8b32c43e7225256c4f837a86548c9");

		expect(
			Converter.bytesToHex(
				Pbkdf2.sha256(
					Converter.utf8ToBytes("passwordPASSWORDpassword"),
					Converter.utf8ToBytes("saltSALTsaltSALTsaltSALTsaltSALTsalt"),
					4096,
					25
				)
			)
		).toEqual("348c89dbcbd32b2f32d814b8116e84cf2b17347ebc1800181c");
	});

	test("Can derive a key with sha256", () => {
		expect(
			Converter.bytesToHex(
				Pbkdf2.sha256(Converter.utf8ToBytes("password"), Converter.utf8ToBytes("salt"), 1000, 32)
			)
		).toEqual("632c2812e46d4604102ba7618e9d6d7d2f8128f6266b4a03264d2a0460b7dcb3");
	});

	test("Can derive a key with sha512", () => {
		expect(
			Converter.bytesToHex(
				Pbkdf2.sha512(Converter.utf8ToBytes("password"), Converter.utf8ToBytes("salt"), 1000, 64)
			)
		).toEqual(
			"afe6c5530785b6cc6b1c6453384731bd5ee432ee549fd42fb6695779ad8a1c5b" +
				"f59de69c48f774efc4007d5298f9033c0241d5ab69305e7b64eceeb8d834cfec"
		);
	});

	test("Can derive a key longer than one hash block", () => {
		expect(
			Pbkdf2.sha256(Converter.utf8ToBytes("password"), Converter.utf8ToBytes("salt"), 100, 100)
				.length
		).toEqual(100);
	});

	test("Can derive a key from an empty password and salt", () => {
		expect(Pbkdf2.sha256(new Uint8Array(), new Uint8Array(), 10, 16).length).toEqual(16);
	});

	test("Returns a plain Uint8Array rather than a platform buffer type", () => {
		const derived = Pbkdf2.sha256(
			Converter.utf8ToBytes("password"),
			Converter.utf8ToBytes("salt"),
			10,
			16
		);
		expect(derived.constructor).toEqual(Uint8Array);
	});

	test("Throws when the key length is less than 1", () => {
		for (const derive of [Pbkdf2.sha256, Pbkdf2.sha512]) {
			expect(() =>
				derive(Converter.utf8ToBytes("password"), Converter.utf8ToBytes("salt"), 10, 0)
			).toThrow(
				expect.objectContaining({ name: "GeneralError", message: "pbkdf2.keyLengthTooSmall" })
			);
		}
	});

	test("Throws when the password is not a Uint8Array", () => {
		expect(() => Pbkdf2.sha256(undefined as never, Converter.utf8ToBytes("salt"), 10, 16)).toThrow(
			expect.objectContaining({ name: "GuardError" })
		);
	});

	test("Produces the same key as the other implementation", async () => {
		const password = Converter.utf8ToBytes("cross implementation password");
		const salt = Converter.utf8ToBytes("cross implementation salt");
		const sha256Key = Pbkdf2.sha256(password, salt, 500, 48);
		const sha512Key = Pbkdf2.sha512(password, salt, 500, 48);

		unregisterNodeCrypto();
		if (!useNodeCrypto) {
			await useNativeCryptoVariant(true);
		}

		try {
			expect(Pbkdf2.sha256(password, salt, 500, 48)).toEqual(sha256Key);
			expect(Pbkdf2.sha512(password, salt, 500, 48)).toEqual(sha512Key);
		} finally {
			await useNativeCryptoVariant(useNodeCrypto);
		}
	});
});
