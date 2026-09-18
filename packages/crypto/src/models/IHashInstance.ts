// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The subset of a hash implementation Sha256 depends on. Both @noble/hashes' Hash and
 * node:crypto's Hash (whose digest() returns a Buffer, itself a Uint8Array) satisfy it.
 * @internal
 */
export interface IHashInstance {
	/**
	 * Absorb more message bytes into the running hash state.
	 * @param block The bytes to absorb.
	 * @returns Whatever the underlying implementation returns; Sha256 does not use it.
	 */
	update(block: Uint8Array): unknown;

	/**
	 * Finalize the hash and return the digest.
	 * @returns The computed hash as bytes.
	 */
	digest(): Uint8Array;
}
