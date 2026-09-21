// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { sha1 } from "@noble/hashes/legacy.js";
import { Guards } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import { NativeModulesCrypto } from "../helpers/nativeModulesCrypto.js";
import type { IHashInstance } from "../models/IHashInstance.js";

/**
 * Perform a SHA-1 hash on the block.
 */
export class Sha1 {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<Sha1>();

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
	 * Create a new instance of Sha1.
	 */
	constructor() {
		const nodeCrypto = NativeModulesCrypto.getNodeCryptoHash(Sha1._HASH);
		this._instance = nodeCrypto ? nodeCrypto.createHash(Sha1._HASH) : sha1.create();
	}

	/**
	 * Perform Sum on the block.
	 * @param block The block to operate on.
	 * @returns The sum of the block.
	 */
	public static sum(block: Uint8Array): Uint8Array {
		Guards.uint8Array(Sha1.CLASS_NAME, nameof(block), block);
		return new Sha1().update(block).digest();
	}

	/**
	 * Update the hash with the block.
	 * @param block The block to update the hash with.
	 * @returns The instance for chaining.
	 */
	public update(block: Uint8Array): Sha1 {
		Guards.uint8Array(Sha1.CLASS_NAME, nameof(block), block);
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
