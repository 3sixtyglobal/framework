// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { EntitySchemaPropertyFormat } from "../../src/models/entitySchemaPropertyFormat.js";
import { EntitySchemaPropertyType } from "../../src/models/entitySchemaPropertyType.js";
import type { IEntitySchemaProperty } from "../../src/models/IEntitySchemaProperty.js";
import type { IEntitySchemaPropertyIndex } from "../../src/models/IEntitySchemaPropertyIndex.js";
import { SortDirection } from "../../src/models/sortDirection.js";
import { EntitySchemaDiffHelper } from "../../src/utils/entitySchemaDiffHelper.js";

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

const tagsProp: IEntitySchemaProperty<ITestEntity> = {
	property: "tags",
	type: EntitySchemaPropertyType.Array,
	itemType: EntitySchemaPropertyType.String,
	optional: true
};

describe("entitySchemaDiffHelper", () => {
	test("returns an empty diff when both property arrays are identical", () => {
		const props: IEntitySchemaProperty<ITestEntity>[] = [idProp, nameProp, ageProp];

		const diff = EntitySchemaDiffHelper.diff(props, props);

		expect(diff.added).toHaveLength(0);
		expect(diff.removed).toHaveLength(0);
		expect(diff.modified).toHaveLength(0);
		expect(diff.unchanged).toHaveLength(3);
	});

	test("returns an empty diff for two empty arrays", () => {
		const diff = EntitySchemaDiffHelper.diff([], []);

		expect(diff.added).toHaveLength(0);
		expect(diff.removed).toHaveLength(0);
		expect(diff.modified).toHaveLength(0);
		expect(diff.unchanged).toHaveLength(0);
	});

	test("detects a single added property with its full descriptor", () => {
		const diff = EntitySchemaDiffHelper.diff([idProp, nameProp], [idProp, nameProp, ageProp]);

		expect(diff.added).toHaveLength(1);
		expect(diff.added[0]).toEqual(ageProp);
		expect(diff.removed).toHaveLength(0);
		expect(diff.modified).toHaveLength(0);
		expect(diff.unchanged).toHaveLength(2);
	});

	test("detects a single removed property with its full descriptor", () => {
		const diff = EntitySchemaDiffHelper.diff([idProp, nameProp, ageProp], [idProp, nameProp]);

		expect(diff.added).toHaveLength(0);
		expect(diff.removed).toHaveLength(1);
		expect(diff.removed[0]).toEqual(ageProp);
		expect(diff.modified).toHaveLength(0);
		expect(diff.unchanged).toHaveLength(2);
	});

	test("detects a type change in modified[].from and modified[].to", () => {
		const ageAsInteger: IEntitySchemaProperty<ITestEntity> = {
			...ageProp,
			type: EntitySchemaPropertyType.Integer
		};

		const diff = EntitySchemaDiffHelper.diff([idProp, ageProp], [idProp, ageAsInteger]);

		expect(diff.added).toHaveLength(0);
		expect(diff.removed).toHaveLength(0);
		expect(diff.modified).toHaveLength(1);
		expect(diff.modified[0].from).toEqual(ageProp);
		expect(diff.modified[0].to).toEqual(ageAsInteger);
		expect(diff.modified[0].from.type).toBe(EntitySchemaPropertyType.Number);
		expect(diff.modified[0].to.type).toBe(EntitySchemaPropertyType.Integer);
		expect(diff.unchanged).toHaveLength(1);
	});

	test("detects a format change in modified[]", () => {
		const nameWithFormat: IEntitySchemaProperty<ITestEntity> = {
			...nameProp,
			format: EntitySchemaPropertyFormat.Email
		};

		const diff = EntitySchemaDiffHelper.diff([idProp, nameProp], [idProp, nameWithFormat]);

		expect(diff.modified).toHaveLength(1);
		expect(diff.modified[0].from.format).toBeUndefined();
		expect(diff.modified[0].to.format).toBe(EntitySchemaPropertyFormat.Email);
	});

	test("detects an isVersion change in modified[]", () => {
		const ageWithVersion: IEntitySchemaProperty<ITestEntity> = {
			...ageProp,
			isVersion: true
		};

		const diff = EntitySchemaDiffHelper.diff([idProp, ageProp], [idProp, ageWithVersion]);

		expect(diff.modified).toHaveLength(1);
		expect(diff.modified[0].from.isVersion).toBeUndefined();
		expect(diff.modified[0].to.isVersion).toBe(true);
	});

	test("detects an isSecondary change (index added) in modified[]", () => {
		const ageWithIndex: IEntitySchemaProperty<ITestEntity> = {
			...ageProp,
			isSecondary: true
		};

		const diff = EntitySchemaDiffHelper.diff([idProp, ageProp], [idProp, ageWithIndex]);

		expect(diff.modified).toHaveLength(1);
		expect(diff.modified[0].from.isSecondary).toBeUndefined();
		expect(diff.modified[0].to.isSecondary).toBe(true);
	});

	test("detects a sortDirection change in modified[]", () => {
		const nameDescending: IEntitySchemaProperty<ITestEntity> = {
			...nameProp,
			sortDirection: SortDirection.Descending
		};

		const diff = EntitySchemaDiffHelper.diff([idProp, nameProp], [idProp, nameDescending]);

		expect(diff.modified).toHaveLength(1);
		expect(diff.modified[0].from.sortDirection).toBe(SortDirection.Ascending);
		expect(diff.modified[0].to.sortDirection).toBe(SortDirection.Descending);
	});

	test("detects an optional flag change in modified[]", () => {
		const ageRequired: IEntitySchemaProperty<ITestEntity> = {
			...ageProp,
			optional: false
		};

		const diff = EntitySchemaDiffHelper.diff([idProp, ageProp], [idProp, ageRequired]);

		expect(diff.modified).toHaveLength(1);
		expect(diff.modified[0].from.optional).toBe(true);
		expect(diff.modified[0].to.optional).toBe(false);
	});

	test("detects an itemType change in modified[]", () => {
		const tagsAsNumber: IEntitySchemaProperty<ITestEntity> = {
			...tagsProp,
			itemType: EntitySchemaPropertyType.Number
		};

		const diff = EntitySchemaDiffHelper.diff([idProp, tagsProp], [idProp, tagsAsNumber]);

		expect(diff.modified).toHaveLength(1);
		expect(diff.modified[0].from.itemType).toBe(EntitySchemaPropertyType.String);
		expect(diff.modified[0].to.itemType).toBe(EntitySchemaPropertyType.Number);
	});

	test("detects an itemTypeRef change in modified[]", () => {
		const tagsWithRef: IEntitySchemaProperty<ITestEntity> = {
			...tagsProp,
			itemTypeRef: "SomeEntity"
		};
		const tagsWithOtherRef: IEntitySchemaProperty<ITestEntity> = {
			...tagsProp,
			itemTypeRef: "OtherEntity"
		};

		const diff = EntitySchemaDiffHelper.diff([idProp, tagsWithRef], [idProp, tagsWithOtherRef]);

		expect(diff.modified).toHaveLength(1);
		expect(diff.modified[0].from.itemTypeRef).toBe("SomeEntity");
		expect(diff.modified[0].to.itemTypeRef).toBe("OtherEntity");
	});

	test("detects multiple simultaneous changes: added, removed, and modified", () => {
		const ageAsInteger: IEntitySchemaProperty<ITestEntity> = {
			...ageProp,
			type: EntitySchemaPropertyType.Integer
		};

		const diff = EntitySchemaDiffHelper.diff(
			[idProp, nameProp, ageProp],
			[idProp, ageAsInteger, activeProp]
		);

		expect(diff.added).toHaveLength(1);
		expect(diff.added[0]).toEqual(activeProp);

		expect(diff.removed).toHaveLength(1);
		expect(diff.removed[0]).toEqual(nameProp);

		expect(diff.modified).toHaveLength(1);
		expect(diff.modified[0].from).toEqual(ageProp);
		expect(diff.modified[0].to).toEqual(ageAsInteger);

		expect(diff.unchanged).toHaveLength(1);
		expect(diff.unchanged[0]).toEqual(idProp);
	});

	test("handles empty old properties (all new properties are added)", () => {
		const diff = EntitySchemaDiffHelper.diff([], [idProp, nameProp]);

		expect(diff.added).toHaveLength(2);
		expect(diff.removed).toHaveLength(0);
		expect(diff.modified).toHaveLength(0);
		expect(diff.unchanged).toHaveLength(0);
	});

	test("handles empty new properties (all old properties are removed)", () => {
		const diff = EntitySchemaDiffHelper.diff([idProp, nameProp], []);

		expect(diff.added).toHaveLength(0);
		expect(diff.removed).toHaveLength(2);
		expect(diff.modified).toHaveLength(0);
		expect(diff.unchanged).toHaveLength(0);
	});

	test("does not report a structural diff when only description or examples differ", () => {
		const nameWithDocs: IEntitySchemaProperty<ITestEntity> = {
			...nameProp,
			description: "The display name",
			examples: ["Alice", "Bob"]
		};

		const diff = EntitySchemaDiffHelper.diff([idProp, nameProp], [idProp, nameWithDocs]);

		expect(EntitySchemaDiffHelper.hasChanges(diff)).toBe(false);
		expect(diff.unchanged).toHaveLength(2);
	});
});

describe("diff with renames", () => {
	test("a renamed property appears in modified, not added or removed", () => {
		const scoreProp: IEntitySchemaProperty<ITestEntity> = {
			property: "score",
			type: EntitySchemaPropertyType.Number,
			optional: true
		};

		// "age" renamed to "score" - same type and flags
		const diff = EntitySchemaDiffHelper.diff(
			[idProp, ageProp],
			[idProp, scoreProp],
			[{ from: "age", to: "score" }]
		);

		expect(diff.added).toHaveLength(0);
		expect(diff.removed).toHaveLength(0);
		expect(diff.modified).toHaveLength(1);
		expect(diff.modified[0].from).toEqual(ageProp);
		expect(diff.modified[0].to).toEqual(scoreProp);
		expect(diff.unchanged).toHaveLength(1);
	});

	test("a renamed property that also changes type appears in modified with both changes", () => {
		const scoreAsInteger: IEntitySchemaProperty<ITestEntity> = {
			property: "score",
			type: EntitySchemaPropertyType.Integer,
			optional: true
		};

		const diff = EntitySchemaDiffHelper.diff(
			[idProp, ageProp],
			[idProp, scoreAsInteger],
			[{ from: "age", to: "score" }]
		);

		expect(diff.added).toHaveLength(0);
		expect(diff.removed).toHaveLength(0);
		expect(diff.modified).toHaveLength(1);
		expect(diff.modified[0].from.property).toBe("age");
		expect(diff.modified[0].to.property).toBe("score");
		expect(diff.modified[0].from.type).toBe(EntitySchemaPropertyType.Number);
		expect(diff.modified[0].to.type).toBe(EntitySchemaPropertyType.Integer);
	});

	test("handles multiple renames in a single diff", () => {
		const scoreProp: IEntitySchemaProperty<ITestEntity> = {
			property: "score",
			type: EntitySchemaPropertyType.Number,
			optional: true
		};
		const refProp: IEntitySchemaProperty<ITestEntity> = {
			property: "ref",
			type: EntitySchemaPropertyType.String,
			isSecondary: true,
			sortDirection: SortDirection.Ascending
		};

		// "age" → "score", "name" → "ref"
		const diff = EntitySchemaDiffHelper.diff(
			[idProp, nameProp, ageProp],
			[idProp, refProp, scoreProp],
			[
				{ from: "age", to: "score" },
				{ from: "name", to: "ref" }
			]
		);

		expect(diff.added).toHaveLength(0);
		expect(diff.removed).toHaveLength(0);
		expect(diff.modified).toHaveLength(2);
		expect(diff.modified.map(m => m.from.property)).toEqual(
			expect.arrayContaining(["age", "name"])
		);
		expect(diff.modified.map(m => m.to.property)).toEqual(expect.arrayContaining(["score", "ref"]));
		expect(diff.unchanged).toHaveLength(1);
	});

	test("falls back to added when the rename source is absent from old properties", () => {
		const scoreProp: IEntitySchemaProperty<ITestEntity> = {
			property: "score",
			type: EntitySchemaPropertyType.Number,
			optional: true
		};

		// "active" doesn't exist in old schema - "score" is treated as added
		const diff = EntitySchemaDiffHelper.diff(
			[idProp],
			[idProp, scoreProp],
			[{ from: "active", to: "score" }]
		);

		expect(diff.added).toHaveLength(1);
		expect(diff.added[0]).toEqual(scoreProp);
		expect(diff.removed).toHaveLength(0);
		expect(diff.modified).toHaveLength(0);
	});

	test("falls back to removed when the rename target is absent from new properties", () => {
		// Rename declared but "score" never appears in new schema - "age" is treated as removed
		const diff = EntitySchemaDiffHelper.diff(
			[idProp, ageProp],
			[idProp],
			[{ from: "age", to: "score" }]
		);

		expect(diff.added).toHaveLength(0);
		expect(diff.removed).toHaveLength(1);
		expect(diff.removed[0]).toEqual(ageProp);
		expect(diff.modified).toHaveLength(0);
	});

	test("renames do not interfere with unrelated added and removed properties", () => {
		const scoreProp: IEntitySchemaProperty<ITestEntity> = {
			property: "score",
			type: EntitySchemaPropertyType.Number,
			optional: true
		};

		// "age" → "score" (rename), "name" removed, "active" added
		const diff = EntitySchemaDiffHelper.diff(
			[idProp, nameProp, ageProp],
			[idProp, scoreProp, activeProp],
			[{ from: "age", to: "score" }]
		);

		expect(diff.added).toHaveLength(1);
		expect(diff.added[0]).toEqual(activeProp);

		expect(diff.removed).toHaveLength(1);
		expect(diff.removed[0]).toEqual(nameProp);

		expect(diff.modified).toHaveLength(1);
		expect(diff.modified[0].from).toEqual(ageProp);
		expect(diff.modified[0].to).toEqual(scoreProp);

		expect(diff.unchanged).toHaveLength(1);
		expect(diff.unchanged[0]).toEqual(idProp);
	});

	test("rename takes priority when target name already exists in old schema - source modified, old same-named removed", () => {
		// old has "age" and "score"; rename says age→score
		// new only has "score" - the intent is: old "age" becomes new "score", old "score" is gone
		const oldScoreProp: IEntitySchemaProperty<ITestEntity> = {
			property: "score",
			type: EntitySchemaPropertyType.Number,
			optional: true
		};
		const newScoreProp: IEntitySchemaProperty<ITestEntity> = {
			property: "score",
			type: EntitySchemaPropertyType.Number,
			optional: true,
			isSecondary: true
		};

		const diff = EntitySchemaDiffHelper.diff(
			[idProp, ageProp, oldScoreProp],
			[idProp, newScoreProp],
			[{ from: "age", to: "score" }]
		);

		expect(diff.added).toHaveLength(0);
		expect(diff.removed).toHaveLength(1);
		expect(diff.removed[0]).toEqual(oldScoreProp);
		expect(diff.modified).toHaveLength(1);
		expect(diff.modified[0].from).toEqual(ageProp);
		expect(diff.modified[0].to).toEqual(newScoreProp);
		expect(diff.unchanged).toHaveLength(1);
		expect(diff.unchanged[0]).toEqual(idProp);
	});

	test("swap renames - both properties appear in modified with their sources swapped", () => {
		// old "age" (Number) and "active" (Boolean) swap names in the new schema
		const ageSwapped: IEntitySchemaProperty<ITestEntity> = {
			property: "active",
			type: EntitySchemaPropertyType.Number,
			optional: true
		};
		const activeSwapped: IEntitySchemaProperty<ITestEntity> = {
			property: "age",
			type: EntitySchemaPropertyType.Boolean,
			optional: true
		};

		const diff = EntitySchemaDiffHelper.diff(
			[idProp, ageProp, activeProp],
			[idProp, ageSwapped, activeSwapped],
			[
				{ from: "age", to: "active" },
				{ from: "active", to: "age" }
			]
		);

		expect(diff.added).toHaveLength(0);
		expect(diff.removed).toHaveLength(0);
		expect(diff.modified).toHaveLength(2);
		expect(diff.modified.map(m => m.from.property)).toEqual(
			expect.arrayContaining(["age", "active"])
		);
		expect(diff.modified.map(m => m.to.property)).toEqual(
			expect.arrayContaining(["active", "age"])
		);
		expect(diff.unchanged).toHaveLength(1);
		expect(diff.unchanged[0]).toEqual(idProp);
	});

	test("duplicate rename targets - last entry wins, first source treated as removed", () => {
		// Both "age" and "active" claim to rename to "score"; last entry ("active" → "score") wins
		const scoreProp: IEntitySchemaProperty<ITestEntity> = {
			property: "score",
			type: EntitySchemaPropertyType.Boolean,
			optional: true
		};

		const diff = EntitySchemaDiffHelper.diff(
			[idProp, ageProp, activeProp],
			[idProp, scoreProp],
			[
				{ from: "age", to: "score" },
				{ from: "active", to: "score" }
			]
		);

		expect(diff.modified).toHaveLength(1);
		expect(diff.modified[0].from).toEqual(activeProp);
		expect(diff.modified[0].to).toEqual(scoreProp);
		expect(diff.removed).toHaveLength(1);
		expect(diff.removed[0]).toEqual(ageProp);
		expect(diff.added).toHaveLength(0);
	});

	test("duplicate rename sources - first target wins, second target treated as added", () => {
		// "age" claims to rename to both "score" and "active"; first target ("score") wins
		const scoreProp: IEntitySchemaProperty<ITestEntity> = {
			property: "score",
			type: EntitySchemaPropertyType.Number,
			optional: true
		};

		const diff = EntitySchemaDiffHelper.diff(
			[idProp, ageProp],
			[idProp, scoreProp, activeProp],
			[
				{ from: "age", to: "score" },
				{ from: "age", to: "active" }
			]
		);

		expect(diff.modified).toHaveLength(1);
		expect(diff.modified[0].from).toEqual(ageProp);
		expect(diff.modified[0].to).toEqual(scoreProp);
		expect(diff.added).toHaveLength(1);
		expect(diff.added[0]).toEqual(activeProp);
		expect(diff.removed).toHaveLength(0);
	});

	test("self-rename with identical structure is classified as unchanged, not modified", () => {
		const diff = EntitySchemaDiffHelper.diff(
			[idProp, ageProp],
			[idProp, ageProp],
			[{ from: "age", to: "age" }]
		);

		expect(diff.modified).toHaveLength(0);
		expect(diff.unchanged).toHaveLength(2);
		expect(diff.added).toHaveLength(0);
		expect(diff.removed).toHaveLength(0);
	});

	test("self-rename with a structural change is classified as modified", () => {
		const ageRequired: IEntitySchemaProperty<ITestEntity> = { ...ageProp, optional: false };

		const diff = EntitySchemaDiffHelper.diff(
			[idProp, ageProp],
			[idProp, ageRequired],
			[{ from: "age", to: "age" }]
		);

		expect(diff.modified).toHaveLength(1);
		expect(diff.modified[0].from).toEqual(ageProp);
		expect(diff.modified[0].to).toEqual(ageRequired);
		expect(diff.unchanged).toHaveLength(1);
	});
});

describe("diff input validation", () => {
	test("throws when oldProperties contains duplicate property keys", () => {
		expect(() => EntitySchemaDiffHelper.diff([idProp, ageProp, ageProp], [idProp])).toThrow(
			"duplicateOldProperty"
		);
	});

	test("throws when newProperties contains duplicate property keys", () => {
		expect(() => EntitySchemaDiffHelper.diff([idProp], [idProp, ageProp, ageProp])).toThrow(
			"duplicateNewProperty"
		);
	});
});

describe("hasChanges", () => {
	test("returns false for a diff with no changes", () => {
		const props: IEntitySchemaProperty<ITestEntity>[] = [idProp, nameProp];
		const diff = EntitySchemaDiffHelper.diff(props, props);

		expect(EntitySchemaDiffHelper.hasChanges(diff)).toBe(false);
	});

	test("returns true when there are added properties", () => {
		const diff = EntitySchemaDiffHelper.diff([idProp], [idProp, nameProp]);

		expect(EntitySchemaDiffHelper.hasChanges(diff)).toBe(true);
	});

	test("returns true when there are removed properties", () => {
		const diff = EntitySchemaDiffHelper.diff([idProp, nameProp], [idProp]);

		expect(EntitySchemaDiffHelper.hasChanges(diff)).toBe(true);
	});

	test("returns true when there are modified properties", () => {
		const ageAsInteger: IEntitySchemaProperty<ITestEntity> = {
			...ageProp,
			type: EntitySchemaPropertyType.Integer
		};
		const diff = EntitySchemaDiffHelper.diff([idProp, ageProp], [idProp, ageAsInteger]);

		expect(EntitySchemaDiffHelper.hasChanges(diff)).toBe(true);
	});
});

describe("schemaPropertiesEqual", () => {
	test("returns true for identical properties", () => {
		expect(EntitySchemaDiffHelper.schemaPropertiesEqual(ageProp, { ...ageProp })).toBe(true);
	});

	test("returns false when type differs", () => {
		expect(
			EntitySchemaDiffHelper.schemaPropertiesEqual(ageProp, {
				...ageProp,
				type: EntitySchemaPropertyType.Integer
			})
		).toBe(false);
	});

	test("returns false when format differs", () => {
		expect(
			EntitySchemaDiffHelper.schemaPropertiesEqual(nameProp, {
				...nameProp,
				format: EntitySchemaPropertyFormat.Email
			})
		).toBe(false);
	});

	test("returns false when isPrimary differs", () => {
		expect(
			EntitySchemaDiffHelper.schemaPropertiesEqual(idProp, { ...idProp, isPrimary: false })
		).toBe(false);
	});

	test("returns false when isSecondary differs", () => {
		expect(
			EntitySchemaDiffHelper.schemaPropertiesEqual(ageProp, { ...ageProp, isSecondary: true })
		).toBe(false);
	});

	test("returns false when indexGroup is added", () => {
		expect(
			EntitySchemaDiffHelper.schemaPropertiesEqual(ageProp, {
				...ageProp,
				indexGroup: [{ name: "aaa", direction: SortDirection.Ascending, index: 0 }]
			})
		).toBe(false);
	});

	test("returns false when indexGroup names differ", () => {
		expect(
			EntitySchemaDiffHelper.schemaPropertiesEqual(
				{
					...ageProp,
					indexGroup: [{ name: "aaa", direction: SortDirection.Ascending, index: 0 }]
				},
				{
					...ageProp,
					indexGroup: [{ name: "bbb", direction: SortDirection.Ascending, index: 0 }]
				}
			)
		).toBe(false);
	});

	test("returns false when indexGroup directions differ", () => {
		expect(
			EntitySchemaDiffHelper.schemaPropertiesEqual(
				{
					...ageProp,
					indexGroup: [{ name: "aaa", direction: SortDirection.Ascending, index: 0 }]
				},
				{
					...ageProp,
					indexGroup: [{ name: "aaa", direction: SortDirection.Descending, index: 0 }]
				}
			)
		).toBe(false);
	});

	test("returns false when indexGroup index positions differ", () => {
		expect(
			EntitySchemaDiffHelper.schemaPropertiesEqual(
				{
					...ageProp,
					indexGroup: [{ name: "aaa", direction: SortDirection.Ascending, index: 0 }]
				},
				{
					...ageProp,
					indexGroup: [{ name: "aaa", direction: SortDirection.Ascending, index: 1 }]
				}
			)
		).toBe(false);
	});

	test("returns true when indexGroup contains the same indexes in a different order", () => {
		expect(
			EntitySchemaDiffHelper.schemaPropertiesEqual(
				{
					...ageProp,
					indexGroup: [
						{ name: "aaa", direction: SortDirection.Ascending, index: 0 },
						{ name: "bbb", direction: SortDirection.Descending, index: 1 }
					]
				},
				{
					...ageProp,
					indexGroup: [
						{ name: "bbb", direction: SortDirection.Descending, index: 1 },
						{ name: "aaa", direction: SortDirection.Ascending, index: 0 }
					]
				}
			)
		).toBe(true);
	});

	test("returns false when duplicate indexGroup entries do not match", () => {
		expect(
			EntitySchemaDiffHelper.schemaPropertiesEqual(
				{
					...ageProp,
					indexGroup: [
						{ name: "aaa", direction: SortDirection.Ascending, index: 0 },
						{ name: "aaa", direction: SortDirection.Ascending, index: 0 }
					]
				},
				{
					...ageProp,
					indexGroup: [
						{ name: "aaa", direction: SortDirection.Ascending, index: 0 },
						{ name: "bbb", direction: SortDirection.Ascending, index: 0 }
					]
				}
			)
		).toBe(false);
	});

	test("returns true when indexGroup is absent on both properties", () => {
		expect(EntitySchemaDiffHelper.schemaPropertiesEqual(ageProp, { ...ageProp })).toBe(true);
	});

	test("returns true when indexGroup contains matching undefined entries", () => {
		expect(
			EntitySchemaDiffHelper.schemaPropertiesEqual(
				{
					...ageProp,
					indexGroup: [undefined as unknown as IEntitySchemaPropertyIndex]
				},
				{
					...ageProp,
					indexGroup: [undefined as unknown as IEntitySchemaPropertyIndex]
				}
			)
		).toBe(true);
	});

	test("returns false when only one indexGroup contains an undefined entry", () => {
		expect(
			EntitySchemaDiffHelper.schemaPropertiesEqual(
				{
					...ageProp,
					indexGroup: [undefined as unknown as IEntitySchemaPropertyIndex]
				},
				{
					...ageProp,
					indexGroup: [{ name: "aaa", direction: SortDirection.Ascending, index: 0 }]
				}
			)
		).toBe(false);
	});

	test("returns false when isVersion differs", () => {
		expect(
			EntitySchemaDiffHelper.schemaPropertiesEqual(ageProp, { ...ageProp, isVersion: true })
		).toBe(false);
	});

	test("returns false when sortDirection differs", () => {
		expect(
			EntitySchemaDiffHelper.schemaPropertiesEqual(nameProp, {
				...nameProp,
				sortDirection: SortDirection.Descending
			})
		).toBe(false);
	});

	test("returns false when optional differs", () => {
		expect(
			EntitySchemaDiffHelper.schemaPropertiesEqual(ageProp, { ...ageProp, optional: false })
		).toBe(false);
	});

	test("returns false when itemType differs", () => {
		expect(
			EntitySchemaDiffHelper.schemaPropertiesEqual(tagsProp, {
				...tagsProp,
				itemType: EntitySchemaPropertyType.Number
			})
		).toBe(false);
	});

	test("returns false when itemTypeRef differs", () => {
		expect(
			EntitySchemaDiffHelper.schemaPropertiesEqual(
				{ ...tagsProp, itemTypeRef: "A" },
				{ ...tagsProp, itemTypeRef: "B" }
			)
		).toBe(false);
	});

	test("returns true when only description differs", () => {
		expect(
			EntitySchemaDiffHelper.schemaPropertiesEqual(nameProp, {
				...nameProp,
				description: "ignored"
			})
		).toBe(true);
	});

	test("returns true when only examples differ", () => {
		expect(
			EntitySchemaDiffHelper.schemaPropertiesEqual(nameProp, {
				...nameProp,
				examples: ["Alice"]
			})
		).toBe(true);
	});
});
