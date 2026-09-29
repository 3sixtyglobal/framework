// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { secp256k1 } from "@noble/curves/secp256k1.js";
import { GeneralError, Guards } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import { NativeModulesCrypto } from "../helpers/nativeModulesCrypto.js";

/**
 * Implementation of secp256k1.
 */
export class Secp256k1 {
	/**
	 * Private Key Size is the size, in bytes, of private keys as used in this package.
	 */
	public static PRIVATE_KEY_SIZE: number = 32;

	/**
	 * Public Key Size is the size, in bytes, of public keys as used in this package.
	 */
	public static PUBLIC_KEY_SIZE: number = 33;

	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<Secp256k1>();

	/**
	 * The curve to request from node:crypto. Only key derivation uses it, as OpenSSL signs
	 * with a random k where this class must stay deterministic per RFC 6979.
	 * @internal
	 */
	private static readonly _CURVE: string = "secp256k1";

	/**
	 * Public returns the PublicKey corresponding to private.
	 * @param privateKey The private key to get the corresponding public key.
	 * @returns The public key.
	 * @throws Error if the private key is not the correct length.
	 */
	public static publicKeyFromPrivateKey(privateKey: Uint8Array): Uint8Array {
		Guards.uint8Array(Secp256k1.CLASS_NAME, nameof(privateKey), privateKey);

		if (privateKey.length !== Secp256k1.PRIVATE_KEY_SIZE) {
			throw new GeneralError(Secp256k1.CLASS_NAME, "privateKeyLength", {
				requiredSize: Secp256k1.PRIVATE_KEY_SIZE,
				actualSize: privateKey.length
			});
		}

		const nodeCrypto = NativeModulesCrypto.getNodeCryptoCurve(Secp256k1._CURVE);
		if (nodeCrypto) {
			const ecdh = nodeCrypto.createECDH(Secp256k1._CURVE);
			ecdh.setPrivateKey(privateKey);
			return new Uint8Array(ecdh.getPublicKey(null, "compressed"));
		}

		return secp256k1.getPublicKey(privateKey);
	}

	/**
	 * Signs the block with the private key and returns a signature.
	 * @param privateKey The private key.
	 * @param block The block to sign.
	 * @returns The signature.
	 * @throws Error if the private key is not the correct length.
	 */
	public static sign(privateKey: Uint8Array, block: Uint8Array): Uint8Array {
		Guards.uint8Array(Secp256k1.CLASS_NAME, nameof(privateKey), privateKey);
		Guards.uint8Array(Secp256k1.CLASS_NAME, nameof(block), block);

		if (privateKey.length !== Secp256k1.PRIVATE_KEY_SIZE) {
			throw new GeneralError(Secp256k1.CLASS_NAME, "privateKeyLength", {
				requiredSize: Secp256k1.PRIVATE_KEY_SIZE,
				actualSize: privateKey.length
			});
		}

		const res = secp256k1.sign(block, privateKey, { prehash: false });
		return res;
	}

	/**
	 * Verify reports whether sig is a valid signature of block by publicKey.
	 * @param publicKey The public key to verify the signature.
	 * @param block The block for the signature.
	 * @param signature The signature.
	 * @returns True if the signature matches.
	 * @throws Error if the public key is not the correct length.
	 */
	public static verify(publicKey: Uint8Array, block: Uint8Array, signature: Uint8Array): boolean {
		Guards.uint8Array(Secp256k1.CLASS_NAME, nameof(publicKey), publicKey);
		Guards.uint8Array(Secp256k1.CLASS_NAME, nameof(block), block);
		Guards.uint8Array(Secp256k1.CLASS_NAME, nameof(signature), signature);

		if (publicKey.length !== Secp256k1.PUBLIC_KEY_SIZE) {
			throw new GeneralError(Secp256k1.CLASS_NAME, "publicKeyLength", {
				requiredSize: Secp256k1.PUBLIC_KEY_SIZE,
				actualSize: publicKey ? publicKey.length : 0
			});
		}

		try {
			return secp256k1.verify(signature, block, publicKey, { prehash: false });
		} catch {
			return false;
		}
	}
}
