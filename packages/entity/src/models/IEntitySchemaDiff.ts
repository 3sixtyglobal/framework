// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IEntitySchemaProperty } from "./IEntitySchemaProperty.js";

/**
 * The result of comparing two sets of entity schema properties.
 */
export interface IEntitySchemaDiff<T = unknown> {
	/**
	 * Properties present in the new schema but absent from the old one.
	 * Each entry is the full property descriptor from the new schema, so it can
	 * be passed directly to bootstrap / table-creation logic.
	 */
	added: IEntitySchemaProperty<T>[];

	/**
	 * Properties present in the old schema but absent from the new one.
	 * Each entry is the full property descriptor from the old schema, allowing
	 * connectors to drop the correct column, index, or field by name.
	 */
	removed: IEntitySchemaProperty<T>[];

	/**
	 * Properties that exist in both schemas but differ in at least one structural
	 * field (type, format, isSecondary, sortDirection, optional, itemType, itemTypeRef).
	 * `from` is the old descriptor; `to` is the new one.
	 * Both are full property objects so connectors can drop the old definition and
	 * create the new one using the same bootstrap code path.
	 */
	modified: {
		/**
		 * The old property descriptor.
		 */
		from: IEntitySchemaProperty<T>;
		/**
		 * The new property descriptor.
		 */
		to: IEntitySchemaProperty<T>;
	}[];
}
