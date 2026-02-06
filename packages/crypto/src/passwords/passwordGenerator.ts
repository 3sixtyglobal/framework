// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter, Guards, RandomHelper } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import { Blake2b } from "../hashes/blake2b.js";

/**
 * Generate random passwords.
 */
export class PasswordGenerator {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<PasswordGenerator>();

	/**
	 * The minimum password length, 15 to match owasp rules.
	 * @see https://www.owasp.org/index.php/Authentication_Cheat_Sheet#Implement_Proper_Password_Strength_Controls .
	 * @internal
	 */
	private static readonly _DEFAULT_MIN_PASSWORD_LENGTH: number = 15;

	/**
	 * Generate a password of given length.
	 * @param length The length of the password to generate, default to 15.
	 * @returns The random password.
	 */
	public static generate(length: number = PasswordGenerator._DEFAULT_MIN_PASSWORD_LENGTH): string {
		const lower = "abcdefghijklmnopqrstuvwxyz";
		const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		const digits = "0123456789";
		const specials = "!#$£%^&*+=@~?}";
		const alphabet = `${lower}${upper}`;
		const allChars = `${alphabet}${digits}${specials}`;

		const targetLength = Math.max(length, PasswordGenerator._DEFAULT_MIN_PASSWORD_LENGTH);
		const chars: string[] = [];

		// Ensure required character classes are present.
		PasswordGenerator.pushChar(chars, lower);
		PasswordGenerator.pushChar(chars, upper);
		PasswordGenerator.pushChar(chars, digits);
		PasswordGenerator.pushChar(chars, specials);

		while (chars.length < targetLength) {
			const charSet = chars.length === 0 ? alphabet : allChars;
			PasswordGenerator.pushChar(chars, charSet);
		}

		return chars.join("");
	}

	/**
	 * Hash the password for the user.
	 * @param passwordBytes The password bytes.
	 * @param saltBytes The salt bytes.
	 * @returns The hashed password.
	 */
	public static async hashPassword(
		passwordBytes: Uint8Array,
		saltBytes: Uint8Array
	): Promise<string> {
		Guards.uint8Array(PasswordGenerator.CLASS_NAME, nameof(passwordBytes), passwordBytes);
		Guards.uint8Array(PasswordGenerator.CLASS_NAME, nameof(saltBytes), saltBytes);

		const combined = new Uint8Array(saltBytes.length + passwordBytes.length);
		combined.set(saltBytes);
		combined.set(passwordBytes, saltBytes.length);

		const hashedPassword = Blake2b.sum256(combined);

		return Converter.bytesToBase64(hashedPassword);
	}

	/**
	 * Get a random character from the given character set.
	 * @param charSet The character set to get a random character from.
	 * @returns A random character from the given character set.
	 * @internal
	 */
	private static getRandomChar(charSet: string): string {
		let b = 0;
		do {
			b = RandomHelper.generate(1)[0];
		} while (b >= charSet.length);
		return charSet[b];
	}

	/**
	 * Push a random character from the given character set to the chars array, ensuring no three repeated characters in a row.
	 * @param chars The array to push the character to.
	 * @param charSet The character set to get a random character from.
	 * @internal
	 */
	private static pushChar(chars: string[], charSet: string): void {
		let next = PasswordGenerator.getRandomChar(charSet);
		while (chars.length >= 2 && next === chars.at(-1) && next === chars.at(-2)) {
			next = PasswordGenerator.getRandomChar(charSet);
		}
		chars.push(next);
	}
}
