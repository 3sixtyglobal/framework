// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { GeneralError, Guards, Is } from "@3sixty/core";
import { nameof } from "@3sixty/nameof";
import { DecoratorHelper } from "./decoratorHelper.js";
import { EntitySchemaPropertyFormat } from "../models/entitySchemaPropertyFormat.js";
import { EntitySchemaPropertyType } from "../models/entitySchemaPropertyType.js";
import type { IEntitySchema } from "../models/IEntitySchema.js";
import type { IEntitySchemaProperty } from "../models/IEntitySchemaProperty.js";
import type { IEntitySort } from "../models/IEntitySort.js";
import { SortDirection } from "../models/sortDirection.js";

/**
 * Class to help with entity schema operations.
 */
export class EntitySchemaHelper {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<EntitySchemaHelper>();

	/**
	 * The default maximum lengths for string properties, keyed by their format.
	 */
	public static readonly FORMAT_MAX_LENGTHS: { [format: string]: number } = {
		[EntitySchemaPropertyFormat.Uuid]: 36,
		[EntitySchemaPropertyFormat.Date]: 64,
		[EntitySchemaPropertyFormat.Time]: 64,
		[EntitySchemaPropertyFormat.DateTime]: 64,
		[EntitySchemaPropertyFormat.Email]: 254,
		[EntitySchemaPropertyFormat.Uri]: 2048
	};

	/**
	 * Get the schema for the specified object.
	 * @param target The object to get the schema data for.
	 * @returns The schema for the object if it can be found.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static getSchema<T = unknown>(target: any): IEntitySchema<T> {
		return DecoratorHelper.getSchema<T>(target);
	}

	/**
	 * Get the version of the entity schema, defaulting to 0 when absent.
	 * This is the single source of truth for the "absent version = v0" convention.
	 * When a version is present it must be a non-negative integer >= 0.
	 * @param entitySchema The entity schema to read the version from.
	 * @returns The declared version, or 0 if no version was set.
	 * @throws GuardError if entitySchema is undefined or version is not an integer.
	 * @throws GeneralError if version is present but less than 0.
	 */
	public static getVersion(entitySchema: IEntitySchema): number {
		Guards.object<IEntitySchema>(EntitySchemaHelper.CLASS_NAME, nameof(entitySchema), entitySchema);

		if (!Is.empty(entitySchema?.version)) {
			Guards.integer(
				EntitySchemaHelper.CLASS_NAME,
				nameof(entitySchema?.version),
				entitySchema?.version
			);
			if (entitySchema.version < 0) {
				throw new GeneralError(
					EntitySchemaHelper.CLASS_NAME,
					"versionMustBeGreaterThanOrEqualZero",
					{
						version: entitySchema.version
					}
				);
			}
		}

		return entitySchema.version ?? 0;
	}

	/**
	 * Get the primary key from the entity schema.
	 * @param entitySchema The entity schema to find the primary key from.
	 * @returns The key if only one was found.
	 * @throws If no primary key was found, or more than one.
	 */
	public static getPrimaryKey<T>(entitySchema: IEntitySchema<T>): IEntitySchemaProperty<T> {
		Guards.object<IEntitySchema<T>>(
			EntitySchemaHelper.CLASS_NAME,
			nameof(entitySchema),
			entitySchema
		);

		const primaryKeys = (entitySchema.properties ?? [])?.filter(p => p.isPrimary);
		if (primaryKeys.length === 0) {
			throw new GeneralError(EntitySchemaHelper.CLASS_NAME, "noIsPrimary");
		}
		if (primaryKeys.length > 1) {
			throw new GeneralError(EntitySchemaHelper.CLASS_NAME, "multipleIsPrimary");
		}
		return primaryKeys[0];
	}

	/**
	 * Get the sort properties from the schema.
	 * @param entitySchema The entity schema to find the primary key from.
	 * @returns The sort keys from the schema or undefined if there are none.
	 */
	public static getSortProperties<T>(entitySchema: IEntitySchema<T>): IEntitySort<T>[] | undefined {
		Guards.object<IEntitySchema<T>>(
			EntitySchemaHelper.CLASS_NAME,
			nameof(entitySchema),
			entitySchema
		);

		const sortFields = (entitySchema.properties ?? []).filter(p => !Is.undefined(p.sortDirection));

		return sortFields.length > 0
			? sortFields.map(
					p =>
						({
							property: p.property,
							type: p.type,
							sortDirection: p.sortDirection
						}) as IEntitySort<T>
				)
			: undefined;
	}

	/**
	 * Get the composite index groups from the schema.
	 * Each property can be part of multiple indexes through its `indexGroup` list, so a property
	 * can appear in more than one group. The properties within a group are ordered by the `index`
	 * of their index entry, and each is returned with the sort direction it declared for that group.
	 * @param entitySchema The entity schema to find the index groups from.
	 * @returns The properties and their directions keyed by the group name, empty if there are no groups.
	 * @throws GeneralError if an index entry has an invalid direction or index, or if two properties
	 * claim the same index within the same group, or if a group contains fewer than two properties.
	 */
	public static getIndexGroups<T>(entitySchema: IEntitySchema<T>): {
		[group: string]: { property: IEntitySchemaProperty<T>; direction: SortDirection }[];
	} {
		Guards.object<IEntitySchema<T>>(
			EntitySchemaHelper.CLASS_NAME,
			nameof(entitySchema),
			entitySchema
		);

		const groupEntries: {
			[group: string]: {
				entry: { property: IEntitySchemaProperty<T>; direction: SortDirection };
				index: number;
			}[];
		} = {};
		const groupIndexes: { [group: string]: Set<number> } = {};

		for (const property of entitySchema.properties ?? []) {
			if (Is.arrayValue(property.indexGroup)) {
				for (const propertyIndex of property.indexGroup) {
					if (Is.stringValue(propertyIndex?.name)) {
						if (!Object.values(SortDirection).includes(propertyIndex.direction)) {
							throw new GeneralError(EntitySchemaHelper.CLASS_NAME, "invalidIndexGroupDirection", {
								group: propertyIndex.name,
								direction: propertyIndex.direction,
								property: property.property
							});
						}

						if (!Is.integer(propertyIndex.index) || propertyIndex.index < 0) {
							throw new GeneralError(EntitySchemaHelper.CLASS_NAME, "invalidIndexGroupIndex", {
								group: propertyIndex.name,
								index: propertyIndex.index,
								property: property.property
							});
						}

						groupIndexes[propertyIndex.name] ??= new Set();
						if (groupIndexes[propertyIndex.name].has(propertyIndex.index)) {
							throw new GeneralError(EntitySchemaHelper.CLASS_NAME, "duplicateIndexGroupIndex", {
								group: propertyIndex.name,
								index: propertyIndex.index,
								property: property.property
							});
						}
						groupIndexes[propertyIndex.name].add(propertyIndex.index);

						groupEntries[propertyIndex.name] ??= [];
						groupEntries[propertyIndex.name].push({
							entry: { property, direction: propertyIndex.direction },
							index: propertyIndex.index
						});
					}
				}
			}
		}

		const indexGroups: {
			[group: string]: { property: IEntitySchemaProperty<T>; direction: SortDirection }[];
		} = {};

		for (const group of Object.keys(groupEntries)) {
			if (groupEntries[group].length < 2) {
				throw new GeneralError(
					EntitySchemaHelper.CLASS_NAME,
					"indexGroupMustHaveAtLeastTwoProperties",
					{
						group,
						count: groupEntries[group].length
					}
				);
			}

			indexGroups[group] = groupEntries[group]
				.sort((a, b) => a.index - b.index)
				.map(groupEntry => groupEntry.entry);
		}

		return indexGroups;
	}

	/**
	 * Build sort properties from the schema and override if necessary.
	 * @param entitySchema The entity schema to retrieve the default sort keys.
	 * @param overrideSortKeys The override sort keys.
	 * @returns The finalised sort keys.
	 */
	public static buildSortProperties<T>(
		entitySchema: IEntitySchema<T>,
		overrideSortKeys?: {
			property: keyof T;
			sortDirection: SortDirection;
		}[]
	): IEntitySort<T>[] | undefined {
		Guards.object(EntitySchemaHelper.CLASS_NAME, nameof(entitySchema), entitySchema);

		let finalSortKeys: IEntitySort<T>[] | undefined;

		if (Is.arrayValue(overrideSortKeys)) {
			finalSortKeys = [];

			for (const sortKey of overrideSortKeys) {
				const property = (entitySchema.properties ?? []).find(p => p.property === sortKey.property);
				if (property) {
					finalSortKeys.push({
						property: sortKey.property,
						sortDirection: sortKey.sortDirection,
						type: property.type
					});
				}
			}
		} else {
			finalSortKeys = EntitySchemaHelper.getSortProperties(entitySchema);
		}

		return finalSortKeys;
	}

	/**
	 * Validate the entity against the schema.
	 * @param entity The entity to validate.
	 * @param entitySchema The schema to validate against.
	 * @throws If the entity is invalid, or a string value exceeds its maxLength.
	 */
	public static validateEntity<T>(entity: T, entitySchema: IEntitySchema<T>): void {
		Guards.object(EntitySchemaHelper.CLASS_NAME, nameof(entity), entity);
		Guards.object<IEntitySchema<T>>(
			EntitySchemaHelper.CLASS_NAME,
			nameof(entitySchema),
			entitySchema
		);

		const properties = entitySchema.properties ?? [];
		if (properties.length === 0 && Is.objectValue(entity)) {
			throw new GeneralError(EntitySchemaHelper.CLASS_NAME, "invalidEntityProperties");
		}

		const allKeys = Object.keys(entity);

		for (const prop of properties) {
			const idx = allKeys.indexOf(prop.property as string);
			if (idx !== -1) {
				allKeys.splice(idx, 1);
			}

			const value = entity[prop.property];
			const valueType = typeof value;

			if (Is.empty(value)) {
				// If the value is empty but the property is not optional, then it's invalid
				if (!prop.optional) {
					throw new GeneralError(EntitySchemaHelper.CLASS_NAME, "invalidOptional", {
						property: prop.property,
						type: prop.type
					});
				}
			} else if (prop.type === EntitySchemaPropertyType.Integer && Is.integer(value)) {
				// If the schema expects an integer and the value is an integer, then it's valid
			} else if (
				prop.type === EntitySchemaPropertyType.Object &&
				(Is.object(value) ||
					Is.array(value) ||
					Is.string(value) ||
					Is.number(value) ||
					Is.boolean(value) ||
					Is.null(value))
			) {
				// If the schema expects an object and the value is anything that can be JSON serialised, then it's valid
			} else if (prop.type === EntitySchemaPropertyType.Array && Is.array(value)) {
				// If the schema expects an array and the value is an array, then it's valid
			} else if (prop.type !== valueType) {
				// The schema type does not match the value type
				throw new GeneralError(EntitySchemaHelper.CLASS_NAME, "invalidEntityProperty", {
					value,
					property: prop.property,
					type: prop.type
				});
			}

			if (prop.type === EntitySchemaPropertyType.String && Is.string(value)) {
				// Formats with a known length default to it when no explicit maxLength is set
				const maxLength =
					prop.maxLength ??
					(Is.stringValue(prop.format)
						? EntitySchemaHelper.FORMAT_MAX_LENGTHS[prop.format]
						: undefined);

				if (Is.number(maxLength) && maxLength > 0 && value.length > maxLength) {
					// The value is longer than the maximum length defined in the schema
					throw new GeneralError(EntitySchemaHelper.CLASS_NAME, "maxLengthExceeded", {
						property: prop.property,
						maxLength,
						length: value.length
					});
				}
			}
		}

		if (allKeys.length > 0) {
			// There are keys in the entity that are not in the schema
			throw new GeneralError(EntitySchemaHelper.CLASS_NAME, "invalidEntityKeys", {
				keys: allKeys.join(", ")
			});
		}
	}

	/**
	 * Find the property in the schema that is marked as the optimistic-lock version token.
	 * @param schema The entity schema to search.
	 * @returns The name of the version property, or undefined if none is declared.
	 * @throws GeneralError if more than one property has isVersion set.
	 * @throws GeneralError if the version property type is not integer.
	 */
	public static findVersionProperty<T>(schema: IEntitySchema<T>): string | undefined {
		Guards.object(EntitySchemaHelper.CLASS_NAME, nameof(schema), schema);

		const versionProperties = (schema.properties ?? []).filter(p => p.isVersion === true);
		if (versionProperties.length > 1) {
			throw new GeneralError(EntitySchemaHelper.CLASS_NAME, "multipleVersionProperties");
		}
		if (versionProperties.length === 1) {
			if (versionProperties[0].type !== EntitySchemaPropertyType.Integer) {
				throw new GeneralError(EntitySchemaHelper.CLASS_NAME, "versionPropertyMustBeInteger", {
					property: String(versionProperties[0].property),
					type: versionProperties[0].type
				});
			}
			return versionProperties[0].property as string | undefined;
		}
		return undefined;
	}
}
