// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { EntitySchemaPropertyFormat } from "../../src/models/entitySchemaPropertyFormat.js";
import { EntitySchemaPropertyType } from "../../src/models/entitySchemaPropertyType.js";
import type { IEntitySchemaProperty } from "../../src/models/IEntitySchemaProperty.js";
import { SortDirection } from "../../src/models/sortDirection.js";
import { entitySchemaDiff, isEmptyDiff } from "../../src/utils/entitySchemaDiff.js";

/**
 * Test entity with a variety of field types.
 */
interface ITestEntity {
	id: string;
	name: string;
	age?: number;
	active?: boolean;
	score?: number;
	tags?: string[];
	ref?: string;
}

const idProp: IEntitySchemaProperty<ITestEntity> = {
	property: "id",
	type: EntitySchemaPropertyType.String,
	isPrimary: true
};

const nameProp: IEntitySchemaProperty<ITestEntity> = {
	property: "name",
	type: EntitySchemaPropertyType.String,
	isSecondary: true,
	sortDirection: SortDirection.Ascending
};

const ageProp: IEntitySchemaProperty<ITestEntity> = {
	property: "age",
	type: EntitySchemaPropertyType.Number,
	optional: true
};

const activeProp: IEntitySchemaProperty<ITestEntity> = {
	property: "active",
	type: EntitySchemaPropertyType.Boolean,
	optional: true
};

describe("entitySchemaDiff", () => {
	test("returns an empty diff when both property arrays are identical", () => {
		const props: IEntitySchemaProperty<ITestEntity>[] = [idProp, nameProp, ageProp];

		const diff = entitySchemaDiff(props, props);

		expect(diff.added).toHaveLength(0);
		expect(diff.removed).toHaveLength(0);
		expect(diff.modified).toHaveLength(0);
	});

	test("returns an empty diff for two empty arrays", () => {
		const diff = entitySchemaDiff<ITestEntity>([], []);

		expect(diff.added).toHaveLength(0);
		expect(diff.removed).toHaveLength(0);
		expect(diff.modified).toHaveLength(0);
	});

	test("detects a single added property with its full descriptor", () => {
		const diff = entitySchemaDiff([idProp, nameProp], [idProp, nameProp, ageProp]);

		expect(diff.added).toHaveLength(1);
		expect(diff.added[0]).toEqual(ageProp);
		expect(diff.removed).toHaveLength(0);
		expect(diff.modified).toHaveLength(0);
	});

	test("detects a single removed property with its full descriptor", () => {
		const diff = entitySchemaDiff([idProp, nameProp, ageProp], [idProp, nameProp]);

		expect(diff.added).toHaveLength(0);
		expect(diff.removed).toHaveLength(1);
		expect(diff.removed[0]).toEqual(ageProp);
		expect(diff.modified).toHaveLength(0);
	});

	test("detects a type change in modified[].from and modified[].to", () => {
		const ageAsInteger: IEntitySchemaProperty<ITestEntity> = {
			...ageProp,
			type: EntitySchemaPropertyType.Integer
		};

		const diff = entitySchemaDiff([idProp, ageProp], [idProp, ageAsInteger]);

		expect(diff.added).toHaveLength(0);
		expect(diff.removed).toHaveLength(0);
		expect(diff.modified).toHaveLength(1);
		expect(diff.modified[0].from).toEqual(ageProp);
		expect(diff.modified[0].to).toEqual(ageAsInteger);
		expect(diff.modified[0].from.type).toBe(EntitySchemaPropertyType.Number);
		expect(diff.modified[0].to.type).toBe(EntitySchemaPropertyType.Integer);
	});

	test("detects a format change in modified[]", () => {
		const nameWithFormat: IEntitySchemaProperty<ITestEntity> = {
			...nameProp,
			format: EntitySchemaPropertyFormat.Email
		};

		const diff = entitySchemaDiff([idProp, nameProp], [idProp, nameWithFormat]);

		expect(diff.modified).toHaveLength(1);
		expect(diff.modified[0].from.format).toBeUndefined();
		expect(diff.modified[0].to.format).toBe(EntitySchemaPropertyFormat.Email);
	});

	test("detects an isSecondary change (index added) in modified[]", () => {
		const ageWithIndex: IEntitySchemaProperty<ITestEntity> = {
			...ageProp,
			isSecondary: true
		};

		const diff = entitySchemaDiff([idProp, ageProp], [idProp, ageWithIndex]);

		expect(diff.modified).toHaveLength(1);
		expect(diff.modified[0].from.isSecondary).toBeUndefined();
		expect(diff.modified[0].to.isSecondary).toBe(true);
	});

	test("detects a sortDirection change in modified[]", () => {
		const nameDescending: IEntitySchemaProperty<ITestEntity> = {
			...nameProp,
			sortDirection: SortDirection.Descending
		};

		const diff = entitySchemaDiff([idProp, nameProp], [idProp, nameDescending]);

		expect(diff.modified).toHaveLength(1);
		expect(diff.modified[0].from.sortDirection).toBe(SortDirection.Ascending);
		expect(diff.modified[0].to.sortDirection).toBe(SortDirection.Descending);
	});

	test("detects an optional flag change in modified[]", () => {
		const ageRequired: IEntitySchemaProperty<ITestEntity> = {
			...ageProp,
			optional: false
		};

		const diff = entitySchemaDiff([idProp, ageProp], [idProp, ageRequired]);

		expect(diff.modified).toHaveLength(1);
		expect(diff.modified[0].from.optional).toBe(true);
		expect(diff.modified[0].to.optional).toBe(false);
	});

	test("detects multiple simultaneous changes: added, removed, and modified", () => {
		const ageAsInteger: IEntitySchemaProperty<ITestEntity> = {
			...ageProp,
			type: EntitySchemaPropertyType.Integer
		};

		const diff = entitySchemaDiff([idProp, nameProp, ageProp], [idProp, ageAsInteger, activeProp]);

		expect(diff.added).toHaveLength(1);
		expect(diff.added[0]).toEqual(activeProp);

		expect(diff.removed).toHaveLength(1);
		expect(diff.removed[0]).toEqual(nameProp);

		expect(diff.modified).toHaveLength(1);
		expect(diff.modified[0].from).toEqual(ageProp);
		expect(diff.modified[0].to).toEqual(ageAsInteger);
	});

	test("handles empty old properties (all new properties are added)", () => {
		const diff = entitySchemaDiff<ITestEntity>([], [idProp, nameProp]);

		expect(diff.added).toHaveLength(2);
		expect(diff.removed).toHaveLength(0);
		expect(diff.modified).toHaveLength(0);
	});

	test("handles empty new properties (all old properties are removed)", () => {
		const diff = entitySchemaDiff([idProp, nameProp], []);

		expect(diff.added).toHaveLength(0);
		expect(diff.removed).toHaveLength(2);
		expect(diff.modified).toHaveLength(0);
	});

	test("does not report a diff when only description or examples differ", () => {
		const nameWithDocs: IEntitySchemaProperty<ITestEntity> = {
			...nameProp,
			description: "The display name",
			examples: ["Alice", "Bob"]
		};

		const diff = entitySchemaDiff([idProp, nameProp], [idProp, nameWithDocs]);

		expect(isEmptyDiff(diff)).toBe(true);
	});
});

describe("isEmptyDiff", () => {
	test("returns true for a diff with no changes", () => {
		const props: IEntitySchemaProperty<ITestEntity>[] = [idProp, nameProp];
		const diff = entitySchemaDiff(props, props);

		expect(isEmptyDiff(diff)).toBe(true);
	});

	test("returns false when there are added properties", () => {
		const diff = entitySchemaDiff([idProp], [idProp, nameProp]);

		expect(isEmptyDiff(diff)).toBe(false);
	});

	test("returns false when there are removed properties", () => {
		const diff = entitySchemaDiff([idProp, nameProp], [idProp]);

		expect(isEmptyDiff(diff)).toBe(false);
	});

	test("returns false when there are modified properties", () => {
		const ageAsInteger: IEntitySchemaProperty<ITestEntity> = {
			...ageProp,
			type: EntitySchemaPropertyType.Integer
		};
		const diff = entitySchemaDiff([idProp, ageProp], [idProp, ageAsInteger]);

		expect(isEmptyDiff(diff)).toBe(false);
	});
});
