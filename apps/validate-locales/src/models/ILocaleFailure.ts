// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
/**
 * Model for a locale failure reference.
 */
export interface ILocaleFailure {
	/**
	 * The type of the failure reference.
	 */
	type: string;

	/**
	 * The key of the failure reference.
	 */
	key: string;

	/**
	 * The source file for the failure reference.
	 */
	source: string;

	/**
	 * The line number for the failure reference.
	 */
	line: number;

	/**
	 * The column number for the failure reference.
	 */
	column: number;
}
