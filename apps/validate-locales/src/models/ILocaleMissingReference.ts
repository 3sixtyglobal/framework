// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
/**
 * Model for a locale dictionary missing reference.
 */
export interface ILocaleMissingReference {
	/**
	 * The type of the missing reference.
	 */
	type: string;

	/**
	 * The key of the missing reference.
	 */
	key: string;

	/**
	 * The source file for the missing reference.
	 */
	source: string;

	/**
	 * The line number for the missing reference.
	 */
	line: number;

	/**
	 * The column number for the missing reference.
	 */
	column: number;
}
