// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ed25519 } from "@noble/curves/ed25519.js";
import { Guards } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import { Ed25519 } from "./ed25519.js";
import { NativeModulesCrypto } from "../helpers/nativeModulesCrypto.js";

/**
 * Implementation of X25519.
 */
export class X25519 {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<X25519>();

	/**
	 * The hash the Ed25519 seed is expanded with before clamping.
	 * @internal
	 */
	private static readonly _HASH: string = "sha512";

	/**
	 * Convert Ed25519 private key to X25519 private key.
	 * @param ed25519PrivateKey The ed25519 private key to convert.
	 * @returns The x25519 private key.
	 */
	public static convertPrivateKeyToX25519(ed25519PrivateKey: Uint8Array): Uint8Array {
		Guards.uint8Array(X25519.CLASS_NAME, nameof(ed25519PrivateKey), ed25519PrivateKey);

		const seed = ed25519PrivateKey.slice(0, Ed25519.PRIVATE_KEY_SIZE);
		const nodeCrypto = NativeModulesCrypto.getNodeCryptoHash(X25519._HASH);

		if (nodeCrypto) {
			// The X25519 secret is the first half of the expanded Ed25519 seed, clamped so the
			// low three bits are clear, the top bit is clear and the second to top bit is set
			const expanded = nodeCrypto.createHash(X25519._HASH).update(seed).digest();
			const secret = new Uint8Array(expanded.subarray(0, Ed25519.PRIVATE_KEY_SIZE));
			secret[0] -= secret[0] % 8;
			secret[31] = (secret[31] % 64) + 64;
			return secret;
		}

		return ed25519.utils.toMontgomerySecret(seed);
	}

	/**
	 * Convert Ed25519 public key to X25519 public key.
	 * @param ed25519PublicKey The ed25519 public key to convert.
	 * @returns The x25519 public key.
	 * @throws GeneralError On invalid public key.
	 */
	public static convertPublicKeyToX25519(ed25519PublicKey: Uint8Array): Uint8Array {
		Guards.uint8Array(X25519.CLASS_NAME, nameof(ed25519PublicKey), ed25519PublicKey);
		return ed25519.utils.toMontgomery(ed25519PublicKey);
	}
}
