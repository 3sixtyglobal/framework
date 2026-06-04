// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IEntitySchemaOptions } from "./IEntitySchemaOptions.js";
import type { IEntitySchemaProperty } from "./IEntitySchemaProperty.js";

/**
 * Definition for an entity schema.
 */
export interface IEntitySchema<T = unknown> {
	/**
	 * The type of the entity.
	 */
	type: string | undefined;

	/**
	 * The options for the entity.
	 */
	options?: IEntitySchemaOptions;

	/**
	 * The schema version. Used to drive ordered migrations. Absent is treated as version 1.
	 */
	version?: number;

	/**
	 * The properties of the entity.
	 */
	properties?: IEntitySchemaProperty<T>[];
}
