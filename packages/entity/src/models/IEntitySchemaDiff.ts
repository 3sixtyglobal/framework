// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IEntitySchemaProperty } from "./IEntitySchemaProperty.js";

/**
 * The result of comparing two sets of entity schema properties.
 */
export interface IEntitySchemaDiff<T = unknown, U = unknown> {
	/**
	 * Properties that are structurally identical between the old and new schemas.
	 */
	unchanged: IEntitySchemaProperty<T | U>[];

	/**
	 * Properties present in the new schema but absent from the old one.
	 */
	added: IEntitySchemaProperty<U>[];

	/**
	 * Properties present in the old schema but absent from the new one.
	 */
	removed: IEntitySchemaProperty<T>[];

	/**
	 * Properties that exist in both schemas but differ in at least one structural
	 * field (property, type, format, isPrimary, isSecondary, sortDirection, optional, itemType, itemTypeRef).
	 * `from` is the old descriptor; `to` is the new one.
	 */
	modified: {
		/**
		 * The old property descriptor.
		 */
		from: IEntitySchemaProperty<T>;
		/**
		 * The new property descriptor.
		 */
		to: IEntitySchemaProperty<U>;
	}[];
}
