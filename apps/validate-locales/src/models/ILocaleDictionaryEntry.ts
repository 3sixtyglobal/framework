// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
/**
 * Model for a locale dictionary entry.
 */
export interface ILocaleDictionaryEntry {
	/**
	 * The locale.
	 */
	locale: string;

	/**
	 * The key.
	 */
	key: string;

	/**
	 * The value.
	 */
	value: string;

	/**
	 * The property names.
	 */
	propertyNames: string[];

	/**
	 * Whether the entry is referenced in the source code.
	 */
	referenced: boolean;
}
