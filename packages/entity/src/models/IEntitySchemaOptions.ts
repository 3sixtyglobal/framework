// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Definition for an entity schema options.
 */
export interface IEntitySchemaOptions {
	/**
	 * Description of the object.
	 */
	description?: string;

	/**
	 * The schema version. Used to drive ordered migrations. Absent is treated as version 0.
	 */
	version?: number;
}
