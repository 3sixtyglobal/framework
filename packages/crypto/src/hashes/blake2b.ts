// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Guards, Is } from "@3sixty/core";
import { nameof } from "@3sixty/nameof";
import { blake2b } from "@noble/hashes/blake2.js";
import { NativeModulesCrypto } from "../helpers/nativeModulesCrypto.js";
import type { IHashInstance } from "../models/IHashInstance.js";

/**
 * Class to help with Blake2B Signature scheme.
 */
export class Blake2b {
	/**
	 * Blake2b 160.
	 */
	public static SIZE_160: number = 20;

	/**
	 * Blake2b 256.
	 */
	public static SIZE_256: number = 32;

	/**
	 * Blake2b 512.
	 */
	public static SIZE_512: number = 64;

	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<Blake2b>();

	/**
	 * The hash to request from node:crypto. OpenSSL only exposes the unkeyed 512 bit
	 * variant, so every other output length and any keyed hash stays on the fallback.
	 * @internal
	 */
	private static readonly _HASH: string = "blake2b512";

	/**
	 * The instance of the hash.
	 * @internal
	 */
	private readonly _instance: IHashInstance;

	/**
	 * Create a new instance of Blake2b.
	 * @param outputLength The output length.
	 * @param key Optional key for the hash.
	 */
	constructor(outputLength: number, key?: Uint8Array) {
		const nodeCrypto =
			outputLength === Blake2b.SIZE_512 && Is.undefined(key)
				? NativeModulesCrypto.getNodeCryptoHash(Blake2b._HASH)
				: undefined;

		this._instance = nodeCrypto
			? nodeCrypto.createHash(Blake2b._HASH)
			: blake2b.create({
					dkLen: outputLength,
					key
				});
	}

	/**
	 * Perform Sum 160 on the block.
	 * @param block The block to operate on.
	 * @param key Optional key for the hash.
	 * @returns The sum 160 of the block.
	 */
	public static sum160(block: Uint8Array, key?: Uint8Array): Uint8Array {
		Guards.uint8Array(Blake2b.CLASS_NAME, nameof(block), block);
		return new Blake2b(Blake2b.SIZE_160, key).update(block).digest();
	}

	/**
	 * Perform Sum 256 on the block.
	 * @param block The block to operate on.
	 * @param key Optional key for the hash.
	 * @returns The sum 256 of the block.
	 */
	public static sum256(block: Uint8Array, key?: Uint8Array): Uint8Array {
		Guards.uint8Array(Blake2b.CLASS_NAME, nameof(block), block);
		return new Blake2b(Blake2b.SIZE_256, key).update(block).digest();
	}

	/**
	 * Perform Sum 512 on the block.
	 * @param block The block to operate on.
	 * @param key Optional key for the hash.
	 * @returns The sum 512 of the block.
	 */
	public static sum512(block: Uint8Array, key?: Uint8Array): Uint8Array {
		Guards.uint8Array(Blake2b.CLASS_NAME, nameof(block), block);
		return new Blake2b(Blake2b.SIZE_512, key).update(block).digest();
	}

	/**
	 * Update the hash with the block.
	 * @param block The block to update the hash with.
	 * @returns The instance for chaining.
	 */
	public update(block: Uint8Array): Blake2b {
		Guards.uint8Array(Blake2b.CLASS_NAME, nameof(block), block);
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
