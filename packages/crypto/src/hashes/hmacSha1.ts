// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Guards } from "@3sixty/core";
import { nameof } from "@3sixty/nameof";
import { hmac } from "@noble/hashes/hmac.js";
import { sha1 } from "@noble/hashes/legacy.js";
import { NativeModulesCrypto } from "../helpers/nativeModulesCrypto.js";
import type { IHashInstance } from "../models/IHashInstance.js";

/**
 * Class to help with HmacSha1 scheme.
 */
export class HmacSha1 {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<HmacSha1>();

	/**
	 * The hash to request from node:crypto.
	 * @internal
	 */
	private static readonly _HASH: string = "sha1";

	/**
	 * The instance of the hash.
	 * @internal
	 */
	private readonly _instance: IHashInstance;

	/**
	 * Create a new instance of HmacSha1.
	 * @param key The key for the hmac.
	 */
	constructor(key: Uint8Array) {
		const nodeCrypto = NativeModulesCrypto.getNodeCryptoHash(HmacSha1._HASH);
		this._instance = nodeCrypto
			? nodeCrypto.createHmac(HmacSha1._HASH, nodeCrypto.createSecretKey(key))
			: hmac.create(sha1, key);
	}

	/**
	 * Perform Sum on the block.
	 * @param key The key for the hmac.
	 * @param block The block to operate on.
	 * @returns The sum of the block.
	 */
	public static sum(key: Uint8Array, block: Uint8Array): Uint8Array {
		Guards.uint8Array(HmacSha1.CLASS_NAME, nameof(key), key);
		Guards.uint8Array(HmacSha1.CLASS_NAME, nameof(block), block);
		return new HmacSha1(key).update(block).digest();
	}

	/**
	 * Update the hash with the block.
	 * @param block The block to update the hash with.
	 * @returns The instance for chaining.
	 */
	public update(block: Uint8Array): HmacSha1 {
		Guards.uint8Array(HmacSha1.CLASS_NAME, nameof(block), block);
		this._instance.update(block);
		return this;
	}

	/**
	 * Get the digest for the hash.
	 * @returns The computed hash as bytes.
	 */
	public digest(): Uint8Array {
		return new Uint8Array(this._instance.digest());
	}
}
