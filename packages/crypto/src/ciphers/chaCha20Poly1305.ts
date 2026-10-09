// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type * as NodeCrypto from "node:crypto";
import { Guards, Is, Uint8ArrayHelper } from "@3sixty/core";
import { nameof } from "@3sixty/nameof";
import { chacha20poly1305 } from "@noble/ciphers/chacha.js";
import type { CipherWithOutput } from "@noble/ciphers/utils.js";
import { NativeModulesCrypto } from "../helpers/nativeModulesCrypto.js";

/**
 * Implementation of the ChaCha20Poly1305 cipher.
 */
export class ChaCha20Poly1305 {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<ChaCha20Poly1305>();

	/**
	 * The trailing Poly1305 authentication tag length, in bytes, for both the native and
	 * pure JavaScript implementations.
	 * @internal
	 */
	private static readonly _AUTH_TAG_LENGTH: number = 16;

	/**
	 * The cipher to request from node:crypto.
	 * @internal
	 */
	private static readonly _CIPHER: NodeCrypto.CipherChaCha20Poly1305Types = "chacha20-poly1305";

	/**
	 * node:crypto when it supports chacha20-poly1305, otherwise undefined.
	 * @internal
	 */
	private readonly _nodeCrypto: typeof NodeCrypto | undefined;

	/**
	 * The key, retained to build a native cipher/decipher per call.
	 * @internal
	 */
	private readonly _key: Uint8Array;

	/**
	 * The nonce, retained to build a native cipher/decipher per call.
	 * @internal
	 */
	private readonly _nonce: Uint8Array;

	/**
	 * The additional authenticated data, retained to build a native cipher/decipher per call.
	 * @internal
	 */
	private readonly _aad?: Uint8Array;

	/**
	 * The pure JavaScript cipher instance, only constructed when the native cipher is
	 * not usable in this build.
	 * @internal
	 */
	private readonly _instance?: CipherWithOutput;

	/**
	 * Create a new instance of ChaCha20Poly1305.
	 * @param key The key.
	 * @param nonce The nonce.
	 * @param aad The additional authenticated data.
	 */
	constructor(key: Uint8Array, nonce: Uint8Array, aad?: Uint8Array) {
		Guards.uint8Array(ChaCha20Poly1305.CLASS_NAME, nameof(key), key);
		Guards.uint8Array(ChaCha20Poly1305.CLASS_NAME, nameof(nonce), nonce);

		this._key = key;
		this._nonce = nonce;
		this._aad = aad;
		this._nodeCrypto = NativeModulesCrypto.getNodeCryptoCipher(ChaCha20Poly1305._CIPHER);

		if (!this._nodeCrypto) {
			this._instance = chacha20poly1305(key, nonce, aad);
		}
	}

	/**
	 * Encrypt the block.
	 * @param block The block to encrypt.
	 * @returns The block encrypted.
	 */
	public encrypt(block: Uint8Array): Uint8Array {
		Guards.uint8Array(ChaCha20Poly1305.CLASS_NAME, nameof(block), block);

		const nodeCrypto = this._nodeCrypto;
		if (nodeCrypto) {
			const cipher = nodeCrypto.createCipheriv(ChaCha20Poly1305._CIPHER, this._key, this._nonce, {
				authTagLength: ChaCha20Poly1305._AUTH_TAG_LENGTH
			});
			if (!Is.empty(this._aad)) {
				cipher.setAAD(this._aad);
			}
			return Uint8ArrayHelper.concat([cipher.update(block), cipher.final(), cipher.getAuthTag()]);
		}

		Guards.defined(ChaCha20Poly1305.CLASS_NAME, nameof(this._instance), this._instance);
		return this._instance.encrypt(block);
	}

	/**
	 * Decrypt the block.
	 * @param block The block to decrypt.
	 * @returns The block decrypted.
	 */
	public decrypt(block: Uint8Array): Uint8Array {
		Guards.uint8Array(ChaCha20Poly1305.CLASS_NAME, nameof(block), block);

		const nodeCrypto = this._nodeCrypto;
		if (nodeCrypto) {
			const tag = block.subarray(block.length - ChaCha20Poly1305._AUTH_TAG_LENGTH);
			const cipherText = block.subarray(0, block.length - ChaCha20Poly1305._AUTH_TAG_LENGTH);

			const decipher = nodeCrypto.createDecipheriv(
				ChaCha20Poly1305._CIPHER,
				this._key,
				this._nonce,
				{
					authTagLength: ChaCha20Poly1305._AUTH_TAG_LENGTH
				}
			);
			if (!Is.empty(this._aad)) {
				decipher.setAAD(this._aad);
			}
			decipher.setAuthTag(tag);
			return Uint8ArrayHelper.concat([decipher.update(cipherText), decipher.final()]);
		}

		Guards.defined(ChaCha20Poly1305.CLASS_NAME, nameof(this._instance), this._instance);
		return this._instance.decrypt(block);
	}
}
