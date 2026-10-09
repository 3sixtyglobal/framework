// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Guards } from "@3sixty/core";
import { nameof } from "@3sixty/nameof";
import { blake3 } from "@noble/hashes/blake3.js";
import type { Hash } from "@noble/hashes/utils.js";

/**
 * Class to help with Blake3 Signature scheme.
 */
export class Blake3 {
	/**
	 * Blake3 256.
	 */
	public static SIZE_256: number = 32;

	/**
	 * Blake3 512.
	 */
	public static SIZE_512: number = 64;

	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<Blake3>();

	/**
	 * The instance of the hash.
	 * @internal
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private readonly _instance: Hash<any>;

	/**
	 * Create a new instance of Blake3.
	 * @param outputLength The output length.
	 * @param key Optional key for the hash.
	 */
	constructor(outputLength: number, key?: Uint8Array) {
		this._instance = blake3.create({
			dkLen: outputLength,
			key
		});
	}

	/**
	 * Perform Sum 256 on the block.
	 * @param block The block to operate on.
	 * @param key Optional key for the hash.
	 * @returns The sum 256 of the block.
	 */
	public static sum256(block: Uint8Array, key?: Uint8Array): Uint8Array {
		Guards.uint8Array(Blake3.CLASS_NAME, nameof(block), block);
		return new Blake3(Blake3.SIZE_256, key).update(block).digest();
	}

	/**
	 * Perform Sum 512 on the block.
	 * @param block The block to operate on.
	 * @param key Optional key for the hash.
	 * @returns The sum 512 of the block.
	 */
	public static sum512(block: Uint8Array, key?: Uint8Array): Uint8Array {
		Guards.uint8Array(Blake3.CLASS_NAME, nameof(block), block);
		return new Blake3(Blake3.SIZE_512, key).update(block).digest();
	}

	/**
	 * Update the hash with the block.
	 * @param block The block to update the hash with.
	 * @returns The instance for chaining.
	 */
	public update(block: Uint8Array): Blake3 {
		Guards.uint8Array(Blake3.CLASS_NAME, nameof(block), block);
		this._instance.update(block);
		return this;
	}

	/**
	 * Get the digest for the hash.
	 * @returns The computed hash as bytes.
	 */
	public digest(): Uint8Array {
		return this._instance.digest();
	}
}
