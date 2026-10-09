// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { BaseError, GeneralError, Guards, Is } from "@3sixty/core";
import { nameof } from "@3sixty/nameof";
import { bech32 } from "@scure/base";

/**
 * Bech32 encoding and decoding.
 */
export class Bech32 {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<Bech32>();

	/**
	 * Encode the buffer.
	 * @param humanReadablePart The header.
	 * @param data The data to encode.
	 * @returns The encoded data.
	 */
	public static encode(humanReadablePart: string, data: Uint8Array): string {
		Guards.stringValue(Bech32.CLASS_NAME, "humanReadablePart", humanReadablePart);
		Guards.uint8Array(Bech32.CLASS_NAME, "data", data);
		return bech32.encode(humanReadablePart, bech32.toWords(data));
	}

	/**
	 * Decode a bech32 string.
	 * @param bech The text to decode.
	 * @returns The decoded data or undefined if it could not be decoded.
	 * @throws An error if the decoding fails.
	 */
	public static decode(bech: string): {
		humanReadablePart: string;
		data: Uint8Array;
	} {
		Guards.stringValue(Bech32.CLASS_NAME, "bech", bech);

		try {
			const result = bech32.decodeToBytes(bech);
			return {
				humanReadablePart: result.prefix,
				data: result.bytes
			};
		} catch (err) {
			if (BaseError.isErrorMessage(err, /checksum/i)) {
				throw new GeneralError(Bech32.CLASS_NAME, "invalidChecksum", { bech32 });
			} else if (BaseError.isErrorMessage(err, /separator/i)) {
				throw new GeneralError(Bech32.CLASS_NAME, "separatorMisused", { bech32 });
			} else if (BaseError.isErrorMessage(err, /mixed-case/i)) {
				throw new GeneralError(Bech32.CLASS_NAME, "lowerUpper", { bech32 });
			} else if (BaseError.isErrorMessage(err, /data length/i)) {
				throw new GeneralError(Bech32.CLASS_NAME, "dataTooShort", { bech32 });
			} else if (BaseError.isErrorMessage(err, /string length/i)) {
				throw new GeneralError(Bech32.CLASS_NAME, "invalidLength", { bech32 });
			}

			throw new GeneralError(Bech32.CLASS_NAME, "decodeFailed", { bech32 }, err);
		}
	}

	/**
	 * Is the input a bech 32 address.
	 * @param bech The value to test.
	 * @returns True if this is potentially a match.
	 */
	public static isBech32(bech: unknown): bech is string {
		try {
			if (Is.stringValue(bech)) {
				const result = bech32.decodeToBytes(bech);
				return (
					Is.stringValue(result.prefix) && Is.uint8Array(result.bytes) && result.bytes.length > 0
				);
			}
		} catch {}
		return false;
	}
}
