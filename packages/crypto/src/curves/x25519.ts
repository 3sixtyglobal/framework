// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ed25519 } from "@noble/curves/ed25519.js";
import { Guards } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import { Ed25519 } from "./ed25519.js";

/**
 * Implementation of X25519.
 */
export class X25519 {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<X25519>();

	/**
	 * Convert Ed25519 private key to X25519 private key.
	 * @param ed25519PrivateKey The ed25519 private key to convert.
	 * @returns The x25519 private key.
	 */
	public static convertPrivateKeyToX25519(ed25519PrivateKey: Uint8Array): Uint8Array {
		Guards.uint8Array(X25519.CLASS_NAME, nameof(ed25519PrivateKey), ed25519PrivateKey);
		return ed25519.utils.toMontgomerySecret(ed25519PrivateKey.slice(0, Ed25519.PRIVATE_KEY_SIZE));
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
