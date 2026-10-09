// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Guards } from "@3sixty/core";
import { nameof } from "@3sixty/nameof";
import * as otp from "micro-key-producer/otp.js";
import { NativeModulesCrypto } from "../helpers/nativeModulesCrypto.js";

/**
 * Perform HOTP.
 * Implementation of https://datatracker.ietf.org/doc/html/rfc4226 .
 */
export class Hotp {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<Hotp>();

	/**
	 * The hash the one time password is derived with.
	 * @internal
	 */
	private static readonly _HASH: string = "sha1";

	/**
	 * The number of digits in a generated password.
	 * @internal
	 */
	private static readonly _DIGITS: number = 6;

	/**
	 * The modulus applied to the truncated value to leave the password digits.
	 * @internal
	 */
	private static readonly _DIGITS_MODULUS: number = 1000000;

	/**
	 * Generate a counter based One Time Password.
	 * @param key Key for the one time password.
	 * @param counter This should be stored by the application,
	 * must be user specific, and be incremented for each request.
	 * @returns The one time password.
	 */
	public static generate(key: Uint8Array, counter: number): string {
		Guards.uint8Array(Hotp.CLASS_NAME, nameof(key), key);
		Guards.number(Hotp.CLASS_NAME, nameof(counter), counter);

		const nodeCrypto = NativeModulesCrypto.getNodeCryptoHash(Hotp._HASH);
		if (nodeCrypto) {
			const mac = nodeCrypto
				.createHmac(Hotp._HASH, nodeCrypto.createSecretKey(key))
				.update(Hotp.counterToBytes(counter))
				.digest();

			// RFC 4226 dynamic truncation, the low nibble of the last byte picks the offset,
			// then four bytes are read from there with the top bit of the first masked off
			const offset = mac[mac.length - 1] % 16;
			const byte0 = (mac[offset] % 128) * 16777216;
			const byte1 = mac[offset + 1] * 65536;
			const byte2 = mac[offset + 2] * 256;
			const binary = byte0 + byte1 + byte2 + mac[offset + 3];

			return String(binary % Hotp._DIGITS_MODULUS).padStart(Hotp._DIGITS, "0");
		}

		return otp.hotp(
			{ secret: key, digits: Hotp._DIGITS, algorithm: "sha1", interval: 30 },
			counter
		);
	}

	/**
	 * Convert the counter to the big endian 8 byte block RFC 4226 hashes.
	 * @param counter The counter to convert.
	 * @returns The counter as bytes.
	 * @internal
	 */
	private static counterToBytes(counter: number): Uint8Array {
		const bytes = new Uint8Array(8);
		new DataView(bytes.buffer).setBigUint64(0, BigInt(Math.trunc(counter)));
		return bytes;
	}
}
