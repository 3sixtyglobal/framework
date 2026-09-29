// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
/* eslint-disable no-bitwise */
import { nameof } from "@twin.org/nameof";
import { GeneralError } from "../errors/generalError.js";
import { Converter } from "../utils/converter.js";
import { Guards } from "../utils/guards.js";

/**
 * Class to help with random generation.
 */
export class RandomHelper {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<RandomHelper>();

	/**
	 * The most bytes getRandomValues will fill in a single call.
	 * @internal
	 */
	private static readonly _MAX_LENGTH: number = 65536;

	/**
	 * Generate a new random array.
	 * @param length The length of buffer to create.
	 * @returns The random array.
	 * @throws GeneralError if the length is above the maximum getRandomValues accepts.
	 */
	public static generate(length: number): Uint8Array {
		if (length > RandomHelper._MAX_LENGTH) {
			throw new GeneralError(RandomHelper.CLASS_NAME, "maxLength", {
				length,
				maxLength: RandomHelper._MAX_LENGTH
			});
		}

		const randomBytes = new Uint8Array(length);
		globalThis.crypto.getRandomValues(randomBytes);
		return randomBytes;
	}

	/**
	 * Generate a new UUIDv7.
	 * @param format The format of the UUIDv7 string.
	 * @returns The UUIDv7 string.
	 */
	public static generateUuidV7(format: "standard" | "compact" = "standard"): string {
		// Get unix timestamp in ms (48 bits)
		const unixTsMs = BigInt(Date.now());

		// Generate 10 random bytes (80 bits)
		const randBytes = RandomHelper.generate(10);
		const uuidBytes = new Uint8Array(16);

		// Fill timestamp (48 bits)
		uuidBytes[0] = Number((unixTsMs >> 40n) & 0xffn);
		uuidBytes[1] = Number((unixTsMs >> 32n) & 0xffn);
		uuidBytes[2] = Number((unixTsMs >> 24n) & 0xffn);
		uuidBytes[3] = Number((unixTsMs >> 16n) & 0xffn);
		uuidBytes[4] = Number((unixTsMs >> 8n) & 0xffn);
		uuidBytes[5] = Number(unixTsMs & 0xffn);

		// Next 2 bytes: 12 bits random, 4 bits version (0111)
		uuidBytes[6] = (randBytes[0] & 0x0f) | 0x70; // version 7
		uuidBytes[7] = randBytes[1];

		// Next byte: 2 bits variant (10), 6 bits random
		uuidBytes[8] = (randBytes[2] & 0x3f) | 0x80;

		// Fill remaining random bytes
		uuidBytes.set(randBytes.slice(3), 9);

		// Format as UUID string
		const hex = Converter.bytesToHex(uuidBytes);

		if (format === "compact") {
			return hex;
		}

		return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
	}

	/**
	 * Extract the unix timestamp (ms) from a UUIDv7.
	 * @param uuid The UUIDv7 string.
	 * @returns The unix timestamp in milliseconds.
	 */
	public static uuidV7ExtractTimestamp(uuid: string): number {
		Guards.uuidV7(RandomHelper.CLASS_NAME, nameof(uuid), uuid);

		const hex = uuid.replace(/-/g, "");
		const tsHex = hex.slice(0, 12);
		const ts = BigInt(`0x${tsHex}`);
		return Number(ts);
	}
}
