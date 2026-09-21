// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter } from "@twin.org/core";
import testVectors from "./argon2id.json" with { type: "json" };
import { Argon2id } from "../../src/hashes/argon2id.js";
import {
	NATIVE_CRYPTO_VARIANTS,
	unregisterNodeCrypto,
	useNativeCryptoVariant
} from "../nativeCryptoVariants.js";

describe.each(NATIVE_CRYPTO_VARIANTS)("Argon2id ($implementation)", ({ useNodeCrypto }) => {
	beforeAll(async () => {
		await useNativeCryptoVariant(useNodeCrypto);
	});

	afterAll(() => {
		unregisterNodeCrypto();
	});

	test("can hash with the test vectors", async () => {
		for (const testVector of testVectors) {
			expect(
				Converter.bytesToHex(
					await Argon2id.hash(
						Converter.utf8ToBytes(testVector.password),
						Converter.utf8ToBytes(testVector.salt),
						testVector.options
					)
				)
			).toEqual(testVector.expected);
		}
	});

	test("can fail if password is invalid", async () => {
		await expect(Argon2id.hash(undefined as never, new Uint8Array(8))).rejects.toThrow(
			expect.objectContaining({
				name: "GuardError",
				message: "guard.uint8Array"
			})
		);
	});

	test("can fail if salt is invalid", async () => {
		await expect(Argon2id.hash(new Uint8Array(1), undefined as never)).rejects.toThrow(
			expect.objectContaining({
				name: "GuardError",
				message: "guard.uint8Array"
			})
		);
	});

	test("can fail if the parameters are outside the Argon2 bounds", async () => {
		// Both implementations reject the same inputs, but each words the message its own
		// way, so this asserts the rejection rather than a backend specific string
		const password = Converter.utf8ToBytes("password");
		const salt = Converter.utf8ToBytes("saltsaltsaltsalt");

		await expect(Argon2id.hash(password, Converter.utf8ToBytes("short"))).rejects.toThrow();
		await expect(Argon2id.hash(password, salt, { m: 1 })).rejects.toThrow();
		await expect(Argon2id.hash(password, salt, { m: 8, p: 4 })).rejects.toThrow();
		await expect(Argon2id.hash(password, salt, { t: 0 })).rejects.toThrow();
		await expect(Argon2id.hash(password, salt, { p: 0 })).rejects.toThrow();
		await expect(Argon2id.hash(password, salt, { dkLen: 1 })).rejects.toThrow();
	});

	test("can hash with a larger memory and iteration count", async () => {
		const digest = await Argon2id.hash(
			Converter.utf8ToBytes("password"),
			Converter.utf8ToBytes("saltsaltsaltsalt"),
			{ t: 3, m: 4096, p: 1, dkLen: 32 }
		);

		expect(Converter.bytesToHex(digest)).toEqual(
			"7f16c555d3c63d0d4d268cbcec269369bcab5ce2997a967d486045c0f90f276f"
		);
	});
});
