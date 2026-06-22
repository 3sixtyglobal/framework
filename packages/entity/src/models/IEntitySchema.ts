// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IEntitySchemaOptions } from "./IEntitySchemaOptions.js";
import type { IEntitySchemaProperty } from "./IEntitySchemaProperty.js";

/**
 * Definition for an entity schema.
 */
export interface IEntitySchema<T = unknown> extends IEntitySchemaOptions {
	/**
	 * The type of the entity.
	 */
	type: string | undefined;

	/**
	 * The properties of the entity.
	 */
	properties?: IEntitySchemaProperty<T>[];
}
