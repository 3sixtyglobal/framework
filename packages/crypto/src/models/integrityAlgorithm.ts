// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The names of the integrity algorithms.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const IntegrityAlgorithm = {
	/**
	 * Sha256.
	 */
	Sha256: "sha256",

	/**
	 * Sha384.
	 */
	Sha384: "sha384",

	/**
	 * Sha512.
	 */
	Sha512: "sha512"
} as const;

/**
 * Integrity algorithms.
 */
export type IntegrityAlgorithm = (typeof IntegrityAlgorithm)[keyof typeof IntegrityAlgorithm];
