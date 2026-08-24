// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { GeneralError, Guards, Is } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import { FlattenedSign, flattenedVerify } from "jose";
import type { JwkCryptoKey } from "../models/jwkCryptoKey.js";

/**
 * Class to handle JSON Web Signatures.
 */
export class Jws {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<Jws>();

	/**
	 * Create a signature.
	 * @param privateKey The private key to use.
	 * @param hash The hash to sign.
	 * @param algOverride An optional algorithm override.
	 * @returns The signature.
	 */
	public static async create(
		privateKey: JwkCryptoKey,
		hash: Uint8Array,
		algOverride?: string
	): Promise<string> {
		Guards.defined(Jws.CLASS_NAME, nameof(privateKey), privateKey);
		Guards.uint8Array(Jws.CLASS_NAME, nameof(hash), hash);

		try {
			const jws = await new FlattenedSign(hash)
				.setProtectedHeader({
					alg: algOverride ?? (Is.uint8Array(privateKey) ? "EdDSA" : privateKey.algorithm.name),
					b64: false,
					crit: ["b64"]
				})
				.sign(privateKey);

			return `${jws.protected}.${jws.payload}.${jws.signature}`;
		} catch (err) {
			throw new GeneralError(Jws.CLASS_NAME, "createFailed", undefined, err);
		}
	}

	/**
	 * Verify a signature.
	 * @param jws The signature to verify.
	 * @param publicKey The public key to verify the signature with.
	 * @param hash The hash to verify.
	 * @returns True if the signature was verified.
	 */
	public static async verify(
		jws: string,
		publicKey: JwkCryptoKey,
		hash: Uint8Array
	): Promise<boolean> {
		Guards.stringValue(Jws.CLASS_NAME, nameof(jws), jws);
		Guards.defined(Jws.CLASS_NAME, nameof(publicKey), publicKey);
		Guards.uint8Array(Jws.CLASS_NAME, nameof(hash), hash);

		try {
			const jwsParts: string[] = jws.split(".");

			await flattenedVerify(
				{ protected: jwsParts[0], payload: hash, signature: jwsParts[2] },
				publicKey
			);

			return true;
		} catch (err) {
			throw new GeneralError(Jws.CLASS_NAME, "verifyFailed", undefined, err);
		}
	}
}
