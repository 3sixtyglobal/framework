// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { argon2idAsync } from "@noble/hashes/argon2.js";
import { Guards } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";

/**
 * Implementation of the Argon2id password based key derivation function.
 */
export class Argon2id {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<Argon2id>();

	/**
	 * Derive a key from the parameters using Argon2id.
	 * @param password The password to derive the key from.
	 * @param salt The salt for the derivation.
	 * @param options The options for the derivation.
	 * @param options.t Number of iterations to perform, default 1.
	 * @param options.m Amount of memory to use in kibibytes, default 8.
	 * @param options.p Number of parallel threads to use, default 1.
	 * @param options.dkLen The length of the derived key in bytes, default 32.
	 * @param options.maxmem The maximum amount of memory to use in bytes, default 2^30.
	 * @returns A promise that resolves with the derived key bytes.
	 */
	public static async hash(
		password: Uint8Array,
		salt: Uint8Array,
		options?: {
			t?: number;
			m?: number;
			p?: number;
			dkLen?: number;
			maxmem?: number;
		}
	): Promise<Uint8Array> {
		Guards.uint8Array(Argon2id.CLASS_NAME, nameof(password), password);
		Guards.uint8Array(Argon2id.CLASS_NAME, nameof(salt), salt);
		const localOptions = {
			t: options?.t ?? 1,
			m: options?.m ?? 8,
			p: options?.p ?? 1,
			dkLen: options?.dkLen ?? 32,
			maxmem: options?.maxmem ?? 2 ** 30
		};
		return argon2idAsync(password, salt, localOptions);
	}
}
