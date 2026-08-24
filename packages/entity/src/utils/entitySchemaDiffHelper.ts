// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { GeneralError, Guards } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import type { IEntitySchemaDiff } from "../models/IEntitySchemaDiff.js";
import type { IEntitySchemaProperty } from "../models/IEntitySchemaProperty.js";

/**
 * Helper class for comparing entity schemas and generating diffs.
 */
export class EntitySchemaDiffHelper {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<EntitySchemaDiffHelper>();

	/**
	 * Compare two arrays of entity schema properties and return a structured diff.
	 *
	 * Properties are matched by their `property` key name. A property is considered modified when any structural field differs: `type`, `format`, `isPrimary`, `isSecondary`, `isVersion`, `sortDirection`, `optional`, `itemType`, or `itemTypeRef`.
	 * Documentation-only fields (`description`, `examples`) are intentionally excluded from the comparison to avoid spurious diffs.
	 *
	 * Because a pure name change cannot be detected automatically, callers may supply a `renames` list mapping old names to new names. Renamed properties appear in `modified` (never in `added` or `removed`) even when no other fields changed. Rename lookups take priority over direct same-name matches, which allows swap renames to work correctly and prevents a renamed source from silently disappearing when the target name already existed in the old schema. Self-renames (`from === to`) are ignored and the property is classified normally.
	 *
	 * When `renames` contains duplicate entries: if two entries share the same target, the last definition wins and the first source is treated as removed; if two entries share the same source, the first target wins and the second target is treated as added. Both cases are deterministic but callers should avoid them.
	 * @param oldProperties The property descriptors from the current (live) schema.
	 * @param newProperties The property descriptors from the target (new) schema.
	 * @param renames Optional list of property renames `{ from, to }` where `from` is the old name and `to` is the new name.
	 * @returns A diff object with `added`, `removed`, `modified`, and `unchanged` arrays, each containing full `IEntitySchemaProperty` descriptors.
	 * @throws `GeneralError` if either input array contains duplicate property keys.
	 */
	public static diff<T, U = T>(
		oldProperties: IEntitySchemaProperty<T>[],
		newProperties: IEntitySchemaProperty<U>[],
		renames?: { from: string; to: string }[]
	): IEntitySchemaDiff<T, U> {
		Guards.array(EntitySchemaDiffHelper.CLASS_NAME, nameof(oldProperties), oldProperties);
		Guards.array(EntitySchemaDiffHelper.CLASS_NAME, nameof(newProperties), newProperties);

		const added: IEntitySchemaProperty<U>[] = [];
		const removed: IEntitySchemaProperty<T>[] = [];
		const modified: IEntitySchemaDiff<T, U>["modified"] = [];
		const unchanged: IEntitySchemaProperty<T | U>[] = [];

		const oldMap = new Map<string, IEntitySchemaProperty<T>>();
		for (const prop of oldProperties) {
			const propKey = prop.property as string;
			if (oldMap.has(propKey)) {
				throw new GeneralError(EntitySchemaDiffHelper.CLASS_NAME, "duplicateOldProperty", {
					property: propKey
				});
			}
			oldMap.set(propKey, prop);
		}

		const newMap = new Map<string, IEntitySchemaProperty<U>>();
		for (const prop of newProperties) {
			const propKey = prop.property as string;
			if (newMap.has(propKey)) {
				throw new GeneralError(EntitySchemaDiffHelper.CLASS_NAME, "duplicateNewProperty", {
					property: propKey
				});
			}
			newMap.set(propKey, prop);
		}

		// new-name → old-name, used when iterating newProperties
		const renameToFrom = new Map<string, string>();
		if (renames) {
			for (const rename of renames) {
				renameToFrom.set(rename.to, rename.from);
			}
		}

		// Old names that were consumed by a rename (prevents double-use of the same source).
		const consumedByRename = new Set<string>();
		// New names matched via rename path (their same-named old prop is not their direct match).
		const newKeyMatchedViaRename = new Set<string>();

		for (const newProp of newProperties) {
			const key = newProp.property as string;

			// Rename lookup takes priority over a direct same-name match so that:
			// - swap renames work (both names exist in old and new)
			// - a renamed source does not vanish when the target name already existed in old
			// Self-renames (fromKey === key) are skipped so the property is classified normally.
			const fromKey = renameToFrom.get(key);
			const renamedSource = fromKey !== undefined ? oldMap.get(fromKey) : undefined;

			if (
				fromKey !== undefined &&
				fromKey !== key &&
				renamedSource !== undefined &&
				!consumedByRename.has(fromKey)
			) {
				modified.push({ from: renamedSource, to: newProp });
				consumedByRename.add(fromKey);
				newKeyMatchedViaRename.add(key);
			} else {
				const oldProp = oldMap.get(key);
				if (oldProp !== undefined) {
					if (!EntitySchemaDiffHelper.schemaPropertiesEqual(oldProp, newProp)) {
						modified.push({ from: oldProp, to: newProp });
					} else {
						unchanged.push(newProp as IEntitySchemaProperty<T | U>);
					}
				} else {
					added.push(newProp);
				}
			}
		}

		for (const oldProp of oldProperties) {
			const key = oldProp.property as string;
			// Removed when absent from new, or when its same-named new prop was claimed by a rename
			// (meaning this old prop was not the match for that new prop).
			// Exception: skip if this old prop was itself consumed as a rename source.
			if ((!newMap.has(key) || newKeyMatchedViaRename.has(key)) && !consumedByRename.has(key)) {
				removed.push(oldProp);
			}
		}

		return { added, removed, modified, unchanged };
	}

	/**
	 * Returns true when the diff contains at least one added, removed, or modified property.
	 * @param diff The diff to check.
	 * @returns True if the diff has any structural changes.
	 */
	public static hasChanges<T, U>(diff: IEntitySchemaDiff<T, U>): boolean {
		Guards.object(EntitySchemaDiffHelper.CLASS_NAME, nameof(diff), diff);
		Guards.array(EntitySchemaDiffHelper.CLASS_NAME, nameof(diff.added), diff.added);
		Guards.array(EntitySchemaDiffHelper.CLASS_NAME, nameof(diff.removed), diff.removed);
		Guards.array(EntitySchemaDiffHelper.CLASS_NAME, nameof(diff.modified), diff.modified);
		return diff.added.length > 0 || diff.removed.length > 0 || diff.modified.length > 0;
	}

	/**
	 * Compare two property descriptors for structural equality.
	 * The `property` name field and documentation fields (`description`, `examples`) are intentionally excluded - callers match by name before invoking this method.
	 * @param schema1 The first property descriptor.
	 * @param schema2 The second property descriptor.
	 * @returns True if all structural fields are equal.
	 */
	public static schemaPropertiesEqual<T, U>(
		schema1: IEntitySchemaProperty<T>,
		schema2: IEntitySchemaProperty<U>
	): boolean {
		Guards.object(EntitySchemaDiffHelper.CLASS_NAME, nameof(schema1), schema1);
		Guards.object(EntitySchemaDiffHelper.CLASS_NAME, nameof(schema2), schema2);
		return (
			schema1.type === schema2.type &&
			schema1.format === schema2.format &&
			schema1.isPrimary === schema2.isPrimary &&
			schema1.isSecondary === schema2.isSecondary &&
			schema1.isVersion === schema2.isVersion &&
			schema1.sortDirection === schema2.sortDirection &&
			schema1.optional === schema2.optional &&
			schema1.itemType === schema2.itemType &&
			schema1.itemTypeRef === schema2.itemTypeRef
		);
	}
}
