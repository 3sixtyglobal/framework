// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The sort directions.
 */
export const SortDirection = {
	/**
	 * Ascending.
	 */
	Ascending: "asc",

	/**
	 * Descending.
	 */
	Descending: "desc"
} as const;

/**
 * The sort directions.
 */
export type SortDirection = (typeof SortDirection)[keyof typeof SortDirection];
