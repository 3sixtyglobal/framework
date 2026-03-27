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
		entitySchema.options = options;
		DecoratorHelper.setSchema(target, entitySchema);
	};
}
