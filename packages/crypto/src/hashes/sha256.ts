// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { sha224, sha256 } from "@noble/hashes/sha2.js";
import { GeneralError, Guards } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import { NativeModulesCrypto } from "../helpers/nativeModulesCrypto.js";
import type { IHashInstance } from "../models/IHashInstance.js";

/**
 * Perform a SHA-256 hash on the block.
 */
export class Sha256 {
	/**
	 * Sha256 256.
	 */
	public static readonly SIZE_256: number = 256;

	/**
	 * Sha256 224.
	 */
	public static readonly SIZE_224: number = 224;

	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<Sha256>();

	/**
	 * The hash to request from node:crypto, keyed by bit size.
	 * @internal
	 */
	private static readonly _HASHES: { [bits: number]: string } = {
		224: "sha224",
		256: "sha256"
	};

	/**
	 * The instance of the hash.
	 * @internal
	 */
	private readonly _instance: IHashInstance;

	/**
	 * Create a new instance of Sha256.
	 * @param bits The number of bits.
	 * @throws GeneralError If the bits are not a valid size.
	 */
	constructor(bits: number = Sha256.SIZE_256) {
		if (bits !== Sha256.SIZE_224 && bits !== Sha256.SIZE_256) {
			throw new GeneralError(Sha256.CLASS_NAME, "bitSize", { bitSize: bits });
		}

		const hash = Sha256._HASHES[bits];
		const nodeCrypto = NativeModulesCrypto.getNodeCryptoHash(hash);

		if (nodeCrypto) {
			this._instance = nodeCrypto.createHash(hash);
		} else {
			this._instance = bits === Sha256.SIZE_256 ? sha256.create() : sha224.create();
		}
	}

	/**
	 * Perform Sum 256 on the block.
	 * @param block The block to operate on.
	 * @returns The sum 256 of the block.
	 */
	public static sum256(block: Uint8Array): Uint8Array {
		const b2b = new Sha256(Sha256.SIZE_256);
		b2b.update(block);
		return b2b.digest();
	}

	/**
	 * Perform Sum 224 on the block.
	 * @param block The block to operate on.
	 * @returns The sum 224 of the block.
	 */
	public static sum224(block: Uint8Array): Uint8Array {
		const b2b = new Sha256(Sha256.SIZE_224);
		b2b.update(block);
		return b2b.digest();
	}

	/**
	 * Update the hash with the block.
	 * @param block The block to update the hash with.
	 * @returns The instance for chaining.
	 */
	public update(block: Uint8Array): Sha256 {
		Guards.uint8Array(Sha256.CLASS_NAME, nameof(block), block);
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
