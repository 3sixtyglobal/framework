// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { chacha20poly1305 } from "@noble/ciphers/chacha.js";
import type { CipherWithOutput } from "@noble/ciphers/utils.js";
import { Guards, Is, NativeModules, Uint8ArrayHelper } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";

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
	 * node:crypto when it supports chacha20-poly1305, otherwise undefined.
	 * @internal
	 */
	// eslint-disable-next-line @typescript-eslint/consistent-type-imports
	private readonly _nodeCrypto: typeof import("node:crypto") | undefined;

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
		this._nodeCrypto = ChaCha20Poly1305.resolveNodeCrypto();

		if (!this._nodeCrypto) {
			this._instance = chacha20poly1305(key, nonce, aad);
		}
	}

	/**
	 * Resolve node:crypto, but only when this build's OpenSSL actually lists
	 * chacha20-poly1305 as a supported cipher.
	 * @returns The module to use natively, or undefined to use the pure JavaScript fallback.
	 * @internal
	 */
	private static resolveNodeCrypto():
		// eslint-disable-next-line @typescript-eslint/consistent-type-imports
		typeof import("node:crypto") | undefined {
		// eslint-disable-next-line @typescript-eslint/consistent-type-imports
		const nodeCrypto = NativeModules.getModule<typeof import("node:crypto")>("node:crypto");
		return nodeCrypto?.getCiphers().includes("chacha20-poly1305") ? nodeCrypto : undefined;
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
			const cipher = nodeCrypto.createCipheriv("chacha20-poly1305", this._key, this._nonce, {
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

			const decipher = nodeCrypto.createDecipheriv("chacha20-poly1305", this._key, this._nonce, {
				authTagLength: ChaCha20Poly1305._AUTH_TAG_LENGTH
			});
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
