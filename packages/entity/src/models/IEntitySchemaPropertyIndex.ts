// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { SortDirection } from "./sortDirection.js";

/**
 * Definition of a composite index that a property is part of.
 */
export interface IEntitySchemaPropertyIndex {
	/**
	 * The name of the composite index group.
	 */
	name: string;

	/**
	 * The sort direction for the property within the index.
	 */
	direction: SortDirection;

	/**
	 * The position of the property within the index, ordered ascending.
	 */
	index: number;
}
