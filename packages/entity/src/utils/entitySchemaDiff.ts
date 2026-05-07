// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IEntitySchemaDiff } from "../models/IEntitySchemaDiff.js";
import type { IEntitySchemaProperty } from "../models/IEntitySchemaProperty.js";

/**
 * Compare two arrays of entity schema properties and return a structured diff.
 *
 * Properties are matched by their `property` key name. A property is considered
 * modified when any structural field differs: `type`, `format`, `isPrimary`,
 * `isSecondary`, `sortDirection`, `optional`, `itemType`, or `itemTypeRef`.
 * Documentation-only fields (`description`, `examples`) are intentionally
 * excluded from the comparison to avoid spurious diffs.
 * @param oldProperties The property descriptors from the current (live) schema.
 * @param newProperties The property descriptors from the target (new) schema.
 * @returns A diff object with `added`, `removed`, and `modified` arrays, each
 * containing full `IEntitySchemaProperty` descriptors.
 */
export function entitySchemaDiff<T>(
	oldProperties: IEntitySchemaProperty<T>[],
	newProperties: IEntitySchemaProperty<T>[]
): IEntitySchemaDiff<T> {
	const added: IEntitySchemaProperty<T>[] = [];
	const removed: IEntitySchemaProperty<T>[] = [];
	const modified: IEntitySchemaDiff<T>["modified"] = [];

	const oldMap = new Map<string, IEntitySchemaProperty<T>>();
	for (const prop of oldProperties) {
		oldMap.set(prop.property as string, prop);
	}

	const newMap = new Map<string, IEntitySchemaProperty<T>>();
	for (const prop of newProperties) {
		newMap.set(prop.property as string, prop);
	}

	for (const newProp of newProperties) {
		const oldProp = oldMap.get(newProp.property as string);
		if (!oldProp) {
			added.push(newProp);
		} else if (!schemaPropertiesEqual(oldProp, newProp)) {
			modified.push({ from: oldProp, to: newProp });
		}
	}

	for (const oldProp of oldProperties) {
		if (!newMap.has(oldProp.property as string)) {
			removed.push(oldProp);
		}
	}

	return { added, removed, modified };
}

/**
 * Returns true when the diff contains no changes (nothing added, removed, or modified).
 * @param diff The diff to check.
 * @returns True if the diff is empty.
 */
export function isEmptyDiff<T>(diff: IEntitySchemaDiff<T>): boolean {
	return diff.added.length === 0 && diff.removed.length === 0 && diff.modified.length === 0;
}

/**
 * Compare two property descriptors for structural equality.
 * Documentation fields (description, examples) are excluded.
 * @param a The first property descriptor.
 * @param b The second property descriptor.
 * @returns True if all structural fields are equal.
 */
function schemaPropertiesEqual<T>(
	a: IEntitySchemaProperty<T>,
	b: IEntitySchemaProperty<T>
): boolean {
	return (
		a.type === b.type &&
		a.format === b.format &&
		a.isPrimary === b.isPrimary &&
		a.isSecondary === b.isSecondary &&
		a.sortDirection === b.sortDirection &&
		a.optional === b.optional &&
		a.itemType === b.itemType &&
		a.itemTypeRef === b.itemTypeRef
	);
}
