// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
/* eslint-disable @typescript-eslint/no-explicit-any */
import "reflect-metadata";
import "tslib";
import type { IEntitySchemaOptions } from "../models/IEntitySchemaOptions.js";
import { DecoratorHelper } from "../utils/decoratorHelper.js";

/**
 * Decorator to produce schema data for entity.
 * @param options The options for the entity.
 * @returns The class decorator.
 */
export function entity(options?: IEntitySchemaOptions): any {
	return (target: any) => {
		const entitySchema = DecoratorHelper.getSchema(target);
		entitySchema.type = target.name;
		if (options !== undefined) {
			// version is hoisted to the top-level schema field (single canonical location).
			// The stored options bag therefore never carries version — keeping it consistent
			// with how other IEntitySchemaOptions fields (e.g. description) are handled.
			const { version, ...optionsWithoutVersion } = options;
			if (version !== undefined) {
				entitySchema.version = version;
			}
			if (Object.keys(optionsWithoutVersion).length > 0) {
				entitySchema.options = optionsWithoutVersion;
			}
		}
		DecoratorHelper.setSchema(target, entitySchema);
	};
}
