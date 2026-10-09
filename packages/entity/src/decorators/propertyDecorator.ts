// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
/* eslint-disable @typescript-eslint/no-explicit-any */
import "reflect-metadata";
import "tslib";
import { GeneralError, Is } from "@3sixty/core";
import { EntitySchemaPropertyType } from "../models/entitySchemaPropertyType.js";
import type { IEntitySchemaProperty } from "../models/IEntitySchemaProperty.js";
import { DecoratorHelper } from "../utils/decoratorHelper.js";

/**
 * Decorator to produce schema property data for entities.
 * @param options The options for the property.
 * @returns The property decorator.
 * @throws GeneralError if an index group is declared on an object or array property.
 * @throws GeneralError if the same index group name is declared more than once for the property.
 */
export function property(options: Omit<IEntitySchemaProperty, "property">): any {
	return (target: any, propertyKey: string) => {
		if (Is.arrayValue(options.indexGroup)) {
			if (
				options.type === EntitySchemaPropertyType.Object ||
				options.type === EntitySchemaPropertyType.Array
			) {
				throw new GeneralError("propertyDecorator", "indexGroupTypeNotSupported", {
					property: propertyKey,
					type: options.type
				});
			}

			const seenGroups = new Set<string>();
			for (const propertyIndex of options.indexGroup) {
				if (Is.stringValue(propertyIndex?.name)) {
					if (seenGroups.has(propertyIndex.name)) {
						throw new GeneralError("propertyDecorator", "duplicateIndexGroup", {
							property: propertyKey,
							group: propertyIndex.name
						});
					}
					seenGroups.add(propertyIndex.name);
				}
			}
		}

		const entitySchema = DecoratorHelper.getSchema<any>(target);
		entitySchema.properties ??= [];
		const idx = entitySchema.properties.findIndex(p => p.property === propertyKey);
		if (idx !== -1) {
			entitySchema.properties[idx] = {
				...options,
				property: propertyKey
			};
		} else {
			entitySchema.properties.push({
				...options,
				property: propertyKey
			});
		}
		DecoratorHelper.setSchema(target, entitySchema);
	};
}
