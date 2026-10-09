// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IValidationFailure } from "@3sixty/core";
import { PasswordGenerator } from "../../src/passwords/passwordGenerator.js";
import { PasswordValidator } from "../../src/passwords/passwordValidator.js";

describe("PasswordGenerator", () => {
	test("generates passwords that pass validation", () => {
		for (let i = 0; i < 200; i++) {
			const password = PasswordGenerator.generate();
			const failures: IValidationFailure[] = [];

			PasswordValidator.validate("password", password, failures);

			expect(failures).toHaveLength(0);
		}
	});

	test("enforces the minimum length", () => {
		const password = PasswordGenerator.generate(8);

		expect(password.length).toBeGreaterThanOrEqual(15);
	});

	test("respects requested length when above minimum", () => {
		const password = PasswordGenerator.generate(24);

		expect(password.length).toEqual(24);
	});

	test("includes required character classes", () => {
		const password = PasswordGenerator.generate(20);

		expect(/[a-z]/.test(password)).toBe(true);
		expect(/[A-Z]/.test(password)).toBe(true);
		expect(/\d/.test(password)).toBe(true);
		expect(/[^\dA-Za-z]/.test(password)).toBe(true);
	});

	test("avoids three repeated characters in a row", () => {
		for (let i = 0; i < 200; i++) {
			const password = PasswordGenerator.generate(20);
			expect(/(.)\1{2,}/.test(password)).toBe(false);
		}
	});

	test("hashPassword is deterministic for same inputs", async () => {
		const passwordBytes = new TextEncoder().encode("test-password");
		const saltBytes = new TextEncoder().encode("test-salt");

		const hash1 = await PasswordGenerator.hashPassword(passwordBytes, saltBytes);
		const hash2 = await PasswordGenerator.hashPassword(passwordBytes, saltBytes);

		expect(hash1).toEqual(hash2);
		expect(hash1.length).toEqual(44);
	});

	test("hashPassword changes when salt changes", async () => {
		const passwordBytes = new TextEncoder().encode("test-password");
		const saltBytes1 = new TextEncoder().encode("test-salt-1");
		const saltBytes2 = new TextEncoder().encode("test-salt-2");

		const hash1 = await PasswordGenerator.hashPassword(passwordBytes, saltBytes1);
		const hash2 = await PasswordGenerator.hashPassword(passwordBytes, saltBytes2);

		expect(hash1).not.toEqual(hash2);
	});

	test("hashPassword changes when password changes", async () => {
		const passwordBytes1 = new TextEncoder().encode("test-password-1");
		const passwordBytes2 = new TextEncoder().encode("test-password-2");
		const saltBytes = new TextEncoder().encode("test-salt");

		const hash1 = await PasswordGenerator.hashPassword(passwordBytes1, saltBytes);
		const hash2 = await PasswordGenerator.hashPassword(passwordBytes2, saltBytes);

		expect(hash1).not.toEqual(hash2);
	});

	test("generate respects minimum length boundary", () => {
		const password = PasswordGenerator.generate(15);
		expect(password.length).toEqual(15);
	});

	test("generate produces very long passwords", () => {
		const password = PasswordGenerator.generate(256);
		expect(password.length).toEqual(256);
	});

	test("generate with 0 length enforces minimum", () => {
		const password = PasswordGenerator.generate(0);
		expect(password.length).toBeGreaterThanOrEqual(15);
	});

	test("generate with negative length enforces minimum", () => {
		const password = PasswordGenerator.generate(-10);
		expect(password.length).toBeGreaterThanOrEqual(15);
	});

	test("hashPassword handles empty password bytes", async () => {
		const passwordBytes = new Uint8Array(0);
		const saltBytes = new TextEncoder().encode("test-salt");

		const hash = await PasswordGenerator.hashPassword(passwordBytes, saltBytes);

		expect(hash.length).toEqual(44);
	});

	test("hashPassword handles empty salt bytes", async () => {
		const passwordBytes = new TextEncoder().encode("test-password");
		const saltBytes = new Uint8Array(0);

		const hash = await PasswordGenerator.hashPassword(passwordBytes, saltBytes);

		expect(hash.length).toEqual(44);
	});

	test("hashPassword handles both empty password and salt", async () => {
		const passwordBytes = new Uint8Array(0);
		const saltBytes = new Uint8Array(0);

		const hash = await PasswordGenerator.hashPassword(passwordBytes, saltBytes);

		expect(hash.length).toEqual(44);
	});

	test("hashPassword with large password and salt produces consistent hash", async () => {
		const passwordBytes = new Uint8Array(10_000).fill(5);
		const saltBytes = new Uint8Array(1_000).fill(7);

		const hash1 = await PasswordGenerator.hashPassword(passwordBytes, saltBytes);
		const hash2 = await PasswordGenerator.hashPassword(passwordBytes, saltBytes);

		expect(hash1).toEqual(hash2);
	});
});
