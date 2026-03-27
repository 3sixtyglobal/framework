// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter } from "@twin.org/core";
import testVectors from "./argon2id.json" with { type: "json" };
import { Argon2id } from "../../src/hashes/argon2id.js";

describe("Argon2id", () => {
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

	test("can fail if salt is shorter than the Argon2 minimum", async () => {
		await expect(
			Argon2id.hash(Converter.utf8ToBytes("password"), Converter.utf8ToBytes("short"))
		).rejects.toThrow(expect.objectContaining({ message: '"salt" must be of length 8..4Gb' }));
	});
});
