// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter, Guards } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import { Sha256 } from "../hashes/sha256.js";
import { Sha512 } from "../hashes/sha512.js";
import { IntegrityAlgorithm } from "../models/integrityAlgorithm.js";

/**
 * Helper class for creating integrity signatures.
 * @see https://www.w3.org/TR/SRI/
 */
export class IntegrityHelper {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<IntegrityHelper>();

	/**
	 * Generate an integrity signature for the given content using the specified hash algorithm.
	 * @param type The hash algorithm to use, either "sha256", "sha384" or "sha512".
	 * @param content The content to hash as a Uint8Array.
	 * @returns The integrity signature in the format "type-base64hash".
	 */
	public static generate(type: IntegrityAlgorithm, content: Uint8Array): string {
		Guards.arrayOneOf(
			IntegrityHelper.CLASS_NAME,
			nameof(type),
			type,
			Object.values(IntegrityAlgorithm)
		);
		Guards.uint8Array(IntegrityHelper.CLASS_NAME, nameof(content), content);

		return `${type}-${IntegrityHelper.generateHash(type, content)}`;
	}

	/**
	 * Verify an integrity signature for the given content.
	 * @param integrity The integrity signature in the format "type-base64hash".
	 * @param content The content to hash as a Uint8Array.
	 * @returns True if the integrity signature matches the content.
	 * @throws If the integrity signature is invalid.
	 */
	public static verify(integrity: string, content: Uint8Array): boolean {
		Guards.stringValue(IntegrityHelper.CLASS_NAME, nameof(integrity), integrity);
		Guards.uint8Array(IntegrityHelper.CLASS_NAME, nameof(content), content);

		const parts = integrity.split("-");
		if (parts.length !== 2) {
			return false;
		}

		const [type, hash] = parts;

		Guards.arrayOneOf(
			IntegrityHelper.CLASS_NAME,
			nameof(type),
			type as IntegrityAlgorithm,
			Object.values(IntegrityAlgorithm)
		);
		Guards.stringValue(IntegrityHelper.CLASS_NAME, nameof(hash), hash);

		return IntegrityHelper.generateHash(type as IntegrityAlgorithm, content) === hash;
	}

	/**
	 * Generate a hash for the given content using the specified type.
	 * @param type The hash algorithm to use, either "sha256", "sha384" or "sha512".
	 * @param content The content to hash as a Uint8Array.
	 * @returns The integrity signature in the format "type-base64hash".
	 * @internal
	 */
	private static generateHash(type: IntegrityAlgorithm, content: Uint8Array): string {
		let hash;
		if (type === IntegrityAlgorithm.Sha384) {
			hash = Sha512.sum384(content);
		} else if (type === IntegrityAlgorithm.Sha512) {
			hash = Sha512.sum512(content);
		} else {
			hash = Sha256.sum256(content);
		}
		return Converter.bytesToBase64(hash);
	}
}
