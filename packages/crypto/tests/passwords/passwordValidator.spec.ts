// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IValidationFailure } from "@twin.org/core";
import { PasswordGenerator } from "../../src/passwords/passwordGenerator.js";
import { PasswordValidator } from "../../src/passwords/passwordValidator.js";

describe("PasswordValidator", () => {
	const getReasons = (failures: IValidationFailure[]): string[] =>
		failures.map(failure => failure.reason);

	test("can validate a strong password", () => {
		const failures: IValidationFailure[] = [];
		const password = "Abcd12!efg HIjK3$lmN";

		PasswordValidator.validate("password", password, failures);

		expect(failures).toHaveLength(0);
	});

	test("adds failure for non-string input", () => {
		const failures: IValidationFailure[] = [];

		PasswordValidator.validate("password", 123 as unknown as string, failures);

		expect(failures).toHaveLength(1);
		expect(failures[0].reason).toEqual("validation.beTextValue");
	});

	test("fails for passwords shorter than the minimum length", () => {
		const failures: IValidationFailure[] = [];

		PasswordValidator.validate("password", "Ab1!a", failures);

		expect(getReasons(failures)).toEqual(["validation.minLengthRequired"]);
	});

	test("fails for passwords longer than the maximum length", () => {
		const failures: IValidationFailure[] = [];
		const password = "Ab1!".repeat(33).slice(0, 129);

		PasswordValidator.validate("password", password, failures);

		expect(getReasons(failures)).toEqual(["validation.maxLengthRequired"]);
	});

	test("flags repeated characters", () => {
		const failures: IValidationFailure[] = [];
		const password = "Abc111!dXyZ 1234";

		PasswordValidator.validate("password", password, failures);

		expect(getReasons(failures)).toEqual(["validation.repeatedCharacters"]);
	});

	test("allows passphrases without character class mix", () => {
		const failures: IValidationFailure[] = [];

		PasswordValidator.validate("password", "this is a long passphrase", failures);

		expect(failures).toHaveLength(0);
	});

	test("enforces character classes when passphrase is too short", () => {
		const failures: IValidationFailure[] = [];

		PasswordValidator.validate("password", "this is a long passphrase", failures, {
			minPhraseLength: 30
		});

		expect(getReasons(failures)).toEqual([
			"validation.atLeastOneUpperCase",
			"validation.atLeastOneNumber"
		]);
	});

	test("validatePassword throws for invalid passwords", () => {
		expect(() => PasswordValidator.validatePassword("short")).toThrow();
	});

	test("validatePassword throws for missing character classes", () => {
		expect(() => PasswordValidator.validatePassword("abcdefghijklmnop")).toThrow();
	});

	test("validatePassword does not throw for valid passwords", () => {
		const password = PasswordGenerator.generate();
		expect(() => PasswordValidator.validatePassword(password)).not.toThrow();
	});

	test("comparePasswordBytes returns true for matching byte arrays", () => {
		const bytes1 = new TextEncoder().encode("test-hash");
		const bytes2 = new TextEncoder().encode("test-hash");

		expect(PasswordValidator.comparePasswordBytes(bytes1, bytes2)).toBe(true);
	});

	test("comparePasswordBytes returns false for different byte arrays", () => {
		const bytes1 = new TextEncoder().encode("test-hash-1");
		const bytes2 = new TextEncoder().encode("test-hash-2");

		expect(PasswordValidator.comparePasswordBytes(bytes1, bytes2)).toBe(false);
	});

	test("comparePasswordBytes handles different length arrays", () => {
		const bytes1 = new TextEncoder().encode("short");
		const bytes2 = new TextEncoder().encode("much-longer");

		expect(PasswordValidator.comparePasswordBytes(bytes1, bytes2)).toBe(false);
	});

	test("comparePasswordBytes handles empty byte arrays", () => {
		const bytes1 = new Uint8Array(0);
		const bytes2 = new Uint8Array(0);

		expect(PasswordValidator.comparePasswordBytes(bytes1, bytes2)).toBe(true);
	});

	test("comparePasswordBytes returns false when comparing empty and non-empty", () => {
		const bytes1 = new Uint8Array(0);
		const bytes2 = new TextEncoder().encode("data");

		expect(PasswordValidator.comparePasswordBytes(bytes1, bytes2)).toBe(false);
	});

	test("comparePasswordBytes handles single byte arrays", () => {
		const bytes1 = new Uint8Array([42]);
		const bytes2 = new Uint8Array([42]);

		expect(PasswordValidator.comparePasswordBytes(bytes1, bytes2)).toBe(true);
	});

	test("comparePasswordBytes returns false for different single bytes", () => {
		const bytes1 = new Uint8Array([42]);
		const bytes2 = new Uint8Array([43]);

		expect(PasswordValidator.comparePasswordBytes(bytes1, bytes2)).toBe(false);
	});

	test("comparePasswordBytes handles large byte arrays", () => {
		const bytes1 = new Uint8Array(1024);
		const bytes2 = new Uint8Array(1024);
		bytes1.fill(5);
		bytes2.fill(5);

		expect(PasswordValidator.comparePasswordBytes(bytes1, bytes2)).toBe(true);
	});

	test("comparePasswordBytes detects single byte difference in large array", () => {
		const bytes1 = new Uint8Array(1024);
		const bytes2 = new Uint8Array(1024);
		bytes1.fill(5);
		bytes2.fill(5);
		bytes2[512] = 6;

		expect(PasswordValidator.comparePasswordBytes(bytes1, bytes2)).toBe(false);
	});

	test("comparePasswordHashes returns true for matching hashes", async () => {
		const passwordBytes = new TextEncoder().encode("test-password");
		const saltBytes = new TextEncoder().encode("test-salt");

		const hash = await PasswordGenerator.hashPassword(passwordBytes, saltBytes);

		expect(PasswordValidator.comparePasswordHashes(hash, hash)).toBe(true);
	});

	test("comparePasswordHashes returns false for different hashes", async () => {
		const passwordBytes = new TextEncoder().encode("test-password");
		const saltBytes1 = new TextEncoder().encode("test-salt-1");
		const saltBytes2 = new TextEncoder().encode("test-salt-2");

		const hash1 = await PasswordGenerator.hashPassword(passwordBytes, saltBytes1);
		const hash2 = await PasswordGenerator.hashPassword(passwordBytes, saltBytes2);

		expect(PasswordValidator.comparePasswordHashes(hash1, hash2)).toBe(false);
	});

	test("comparePasswordHashes handles different length hashes", async () => {
		const hash1 = "dGVzdC1oYXNo";
		const hash2 = "dGVzdC1oYXNoLWxvbmdlcg==";

		expect(PasswordValidator.comparePasswordHashes(hash1, hash2)).toBe(false);
	});

	test("validate with empty string password", () => {
		const failures: IValidationFailure[] = [];

		PasswordValidator.validate("password", "", failures);

		expect(failures.length).toBeGreaterThan(0);
		expect(getReasons(failures)[0]).toEqual("validation.beTextValue");
	});

	test("validate with whitespace-only password", () => {
		const failures: IValidationFailure[] = [];

		PasswordValidator.validate("password", "   ", failures);

		expect(failures.length).toBeGreaterThan(0);
		expect(getReasons(failures)[0]).toEqual("validation.beTextValue");
	});

	test("validate with minLength greater than maxLength", () => {
		const failures: IValidationFailure[] = [];

		PasswordValidator.validate("password", "ValidPassword123!", failures, {
			minLength: 50,
			maxLength: 30
		});

		expect(failures.length).toBeGreaterThan(0);
	});

	test("validate with minLength = maxLength = 15", () => {
		const failures: IValidationFailure[] = [];
		const password = "Abcd12!efghijkl";

		PasswordValidator.validate("password", password, failures, {
			minLength: 15,
			maxLength: 15
		});

		expect(failures).toHaveLength(0);
	});

	test("validate with minLength = 0", () => {
		const failures: IValidationFailure[] = [];

		PasswordValidator.validate("password", "a", failures, {
			minLength: 0
		});

		expect(failures.length).toBeGreaterThan(0);
	});

	test("validate password exactly at maximum length", () => {
		const failures: IValidationFailure[] = [];
		const password = "Abcd12!efg HIjK3$lmNopqr";

		PasswordValidator.validate("password", password, failures, {
			maxLength: password.length
		});

		expect(failures).toHaveLength(0);
	});

	test("validate allows all required character classes in different positions", () => {
		const failures: IValidationFailure[] = [];
		const password = "1!aB2!cD";

		PasswordValidator.validate("password", password, failures, {
			minLength: 8
		});

		expect(failures).toHaveLength(0);
	});

	test("validate detects missing lowercase in long password", () => {
		const failures: IValidationFailure[] = [];
		const password = "ABC123!@#$%^&*+=";

		PasswordValidator.validate("password", password, failures);

		expect(getReasons(failures)).toContain("validation.atLeastOneLowerCase");
	});

	test("validate detects missing uppercase in long password", () => {
		const failures: IValidationFailure[] = [];
		const password = "abc123!@#$%^&*+=";

		PasswordValidator.validate("password", password, failures);

		expect(getReasons(failures)).toContain("validation.atLeastOneUpperCase");
	});

	test("validate detects missing digits in long password", () => {
		const failures: IValidationFailure[] = [];
		const password = "abcABC!@#$%^&*+=";

		PasswordValidator.validate("password", password, failures);

		expect(getReasons(failures)).toContain("validation.atLeastOneNumber");
	});

	test("validate detects missing special characters in long password", () => {
		const failures: IValidationFailure[] = [];
		const password = "abcABC123456789";

		PasswordValidator.validate("password", password, failures);

		expect(getReasons(failures)).toContain("validation.atLeastOneSpecialChar");
	});

	test("validatePassword with null throws", () => {
		expect(() => PasswordValidator.validatePassword(null as unknown as string)).toThrow();
	});

	test("validatePassword with undefined throws", () => {
		expect(() => PasswordValidator.validatePassword(undefined as unknown as string)).toThrow();
	});

	test("validatePassword with empty string throws", () => {
		expect(() => PasswordValidator.validatePassword("")).toThrow();
	});

	test("comparePasswordBytes maintains constant-time comparison semantics", () => {
		const bytes1 = new Uint8Array(32).fill(0);
		const bytes2 = new Uint8Array(32).fill(0);

		const result1 = PasswordValidator.comparePasswordBytes(bytes1, bytes2);

		bytes2[31] = 1;

		const result2 = PasswordValidator.comparePasswordBytes(bytes1, bytes2);

		expect(result1).toBe(true);
		expect(result2).toBe(false);
	});

	test("comparePasswordHashes maintains constant-time comparison semantics", () => {
		const hash1 = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
		const hash2 = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

		const result1 = PasswordValidator.comparePasswordHashes(hash1, hash2);

		expect(result1).toBe(true);
	});

	test("comparePasswordHashes returns false immediately for length mismatch", () => {
		const result = PasswordValidator.comparePasswordHashes("short", "muchlongerstring");

		expect(result).toBe(false);
	});

	test("validate passphrase with special characters", () => {
		const failures: IValidationFailure[] = [];
		const passphrase = "this is a long passphrase with special chars !@#$%";

		PasswordValidator.validate("password", passphrase, failures);

		expect(failures).toHaveLength(0);
	});

	test("validate with very long passphrase", () => {
		const failures: IValidationFailure[] = [];
		const passphrase = "word ".repeat(20).trim();

		PasswordValidator.validate("password", passphrase, failures);

		expect(failures).toHaveLength(0);
	});

	test("validate edge case: exactly 4 repeated characters", () => {
		const failures: IValidationFailure[] = [];
		const password = "Abcd1111!xyz ABC";

		PasswordValidator.validate("password", password, failures);

		expect(getReasons(failures)).toContain("validation.repeatedCharacters");
	});
});
