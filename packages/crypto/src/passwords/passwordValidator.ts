// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter, Guards, type IValidationFailure, Validation } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";

/**
 * Test password strength.
 * @see https://www.owasp.org/index.php/Authentication_Cheat_Sheet#Implement_Proper_Password_Strength_Controls .
 */
export class PasswordValidator {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<PasswordValidator>();

	/**
	 * The minimum password length, 15 to match owasp rules.
	 * @see https://www.owasp.org/index.php/Authentication_Cheat_Sheet#Implement_Proper_Password_Strength_Controls .
	 * @internal
	 */
	private static readonly _DEFAULT_MIN_PASSWORD_LENGTH: number = 15;

	/**
	 * Test the strength of the password.
	 * @param property The name of the property.
	 * @param password The password to test.
	 * @param failures The list of failures to add to.
	 * @param options Options to configure the testing.
	 * @param options.minLength The minimum length of the password, defaults to 15, can be 8 if MFA is enabled.
	 * @param options.maxLength The minimum length of the password, defaults to 128.
	 * @param options.minPhraseLength The minimum length of the password for it to be considered a pass phrase.
	 */
	public static validate(
		property: string,
		password: string,
		failures: IValidationFailure[],
		options?: {
			minLength?: number;
			maxLength?: number;
			minPhraseLength?: number;
		}
	): void {
		const isString = Validation.stringValue(property, password, failures);

		if (isString) {
			const minLength = options?.minLength ?? PasswordValidator._DEFAULT_MIN_PASSWORD_LENGTH;
			if (password.length < minLength) {
				failures.push({
					property,
					reason: "validation.minLengthRequired",
					properties: {
						minLength,
						actualLength: password.length
					}
				});
			}

			const maxLength = options?.maxLength ?? 128;
			if (password.length > maxLength) {
				failures.push({
					property,
					reason: "validation.maxLengthRequired",
					properties: {
						maxLength,
						actualLength: password.length
					}
				});
			}

			if (/(.)\1{2,}/.test(password)) {
				failures.push({
					property,
					reason: "validation.repeatedCharacters"
				});
			}

			// If this looks like a phrase then apply additional rules
			const minPhraseLength = options?.minPhraseLength ?? 20;

			if (password.length < minPhraseLength || !password.includes(" ")) {
				if (!/[a-z]/.test(password)) {
					failures.push({
						property,
						reason: "validation.atLeastOneLowerCase"
					});
				}

				if (!/[A-Z]/.test(password)) {
					failures.push({
						property,
						reason: "validation.atLeastOneUpperCase"
					});
				}

				if (!/\d/.test(password)) {
					failures.push({
						property,
						reason: "validation.atLeastOneNumber"
					});
				}

				if (!/[^\dA-Za-z]/.test(password)) {
					failures.push({
						property,
						reason: "validation.atLeastOneSpecialChar"
					});
				}
			}
		}
	}

	/**
	 * Validate the password against security policy.
	 * @param password The password to validate.
	 * @param options Options to configure the testing.
	 * @param options.minLength The minimum length of the password, defaults to 8.
	 * @param options.maxLength The minimum length of the password, defaults to 128.
	 * @param options.minPhraseLength The minimum length of the password for it to be considered a pass phrase.
	 * @throws Error if the password does not meet the requirements.
	 */
	public static validatePassword(
		password: string,
		options?: {
			minLength?: number;
			maxLength?: number;
			minPhraseLength?: number;
		}
	): void {
		Guards.stringValue(PasswordValidator.CLASS_NAME, nameof(password), password);

		const failures: IValidationFailure[] = [];

		PasswordValidator.validate(nameof(password), password, failures, options);

		Validation.asValidationError(PasswordValidator.CLASS_NAME, nameof(password), failures);
	}

	/**
	 * Compare two password byte arrays in constant time to prevent timing attacks.
	 * @param hashedPasswordBytes The computed password bytes to compare.
	 * @param storedPasswordBytes The stored password bytes to compare against.
	 * @returns True if the bytes match, false otherwise.
	 */
	public static comparePasswordBytes(
		hashedPasswordBytes: Uint8Array,
		storedPasswordBytes: Uint8Array
	): boolean {
		Guards.uint8Array(
			PasswordValidator.CLASS_NAME,
			nameof(hashedPasswordBytes),
			hashedPasswordBytes
		);
		Guards.uint8Array(
			PasswordValidator.CLASS_NAME,
			nameof(storedPasswordBytes),
			storedPasswordBytes
		);

		// Return immediately if lengths differ
		if (hashedPasswordBytes.length !== storedPasswordBytes.length) {
			return false;
		}

		// Compare bytes in constant time
		let result = 0;
		for (let i = 0; i < hashedPasswordBytes.length; i++) {
			// eslint-disable-next-line no-bitwise
			result |= hashedPasswordBytes[i] ^ storedPasswordBytes[i];
		}

		return result === 0;
	}

	/**
	 * Compare two hashed passwords in constant time to prevent timing attacks.
	 * @param hashedPassword The computed hash to compare.
	 * @param storedPassword The stored hash to compare against.
	 * @returns True if the hashes match, false otherwise.
	 */
	public static comparePasswordHashes(hashedPassword: string, storedPassword: string): boolean {
		Guards.stringValue(PasswordValidator.CLASS_NAME, nameof(hashedPassword), hashedPassword);
		Guards.stringValue(PasswordValidator.CLASS_NAME, nameof(storedPassword), storedPassword);

		// Return immediately if lengths differ
		if (hashedPassword.length !== storedPassword.length) {
			return false;
		}

		// Decode base64 strings to bytes
		const hashedBytes = Converter.base64ToBytes(hashedPassword);
		const storedBytes = Converter.base64ToBytes(storedPassword);

		return PasswordValidator.comparePasswordBytes(hashedBytes, storedBytes);
	}
}
