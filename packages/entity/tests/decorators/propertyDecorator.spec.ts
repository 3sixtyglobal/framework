// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
/* eslint-disable no-restricted-syntax */
import { property } from "../../src/decorators/propertyDecorator.js";
import type { IEntitySchemaPropertyIndex } from "../../src/models/IEntitySchemaPropertyIndex.js";
import { SortDirection } from "../../src/models/sortDirection.js";
import { DecoratorHelper } from "../../src/utils/decoratorHelper.js";

/**
 * Test entity.
 */
export class TestEntity {
	@property({ type: "integer" })
	public prop1: number = 0;
}

/**
 * Test entity2.
 */
export class TestEntity2 {
	@property({
		type: "string",
		optional: true,
		isPrimary: true,
		isSecondary: true,
		sortDirection: SortDirection.Ascending,
		defaultValue: "foo"
	})
	public prop1: number = 0;
}

/**
 * Test entity with index groups.
 */
export class TestEntity3 {
	@property({
		type: "string",
		indexGroup: [
			{ name: "aaa", direction: SortDirection.Ascending, index: 0 },
			{ name: "bbb", direction: SortDirection.Descending, index: 1 }
		]
	})
	public prop1: string = "";

	@property({
		type: "string",
		indexGroup: [{ name: "aaa", direction: SortDirection.Descending, index: 1 }]
	})
	public prop2: string = "";
}

describe("PropertyDecorator", () => {
	test("Can set property metadata on a property", () => {
		expect(DecoratorHelper.getSchema(TestEntity)).toEqual({
			properties: [
				{
					property: "prop1",
					type: "integer"
				}
			]
		});
	});

	test("Can set property metadata with options on a property", () => {
		expect(DecoratorHelper.getSchema(TestEntity2)).toEqual({
			properties: [
				{
					property: "prop1",
					type: "string",
					optional: true,
					isPrimary: true,
					isSecondary: true,
					sortDirection: SortDirection.Ascending,
					defaultValue: "foo"
				}
			]
		});
	});

	test("Can set index groups on a property", () => {
		expect(DecoratorHelper.getSchema(TestEntity3)).toEqual({
			properties: [
				{
					property: "prop1",
					type: "string",
					indexGroup: [
						{ name: "aaa", direction: SortDirection.Ascending, index: 0 },
						{ name: "bbb", direction: SortDirection.Descending, index: 1 }
					]
				},
				{
					property: "prop2",
					type: "string",
					indexGroup: [{ name: "aaa", direction: SortDirection.Descending, index: 1 }]
				}
			]
		});
	});

	test("Can set a property with an undefined index group entry", () => {
		expect(() => {
			class TestEntityUndefinedGroup {
				@property({
					type: "string",
					indexGroup: [undefined as unknown as IEntitySchemaPropertyIndex]
				})
				public prop1: string = "";
			}
			return TestEntityUndefinedGroup;
		}).not.toThrow();
	});

	test("Can fail to set an index group on an object property", () => {
		expect(() => {
			class TestEntityObjectGroup {
				@property({
					type: "object",
					indexGroup: [{ name: "aaa", direction: SortDirection.Ascending, index: 0 }]
				})
				public prop1: object = {};
			}
			return TestEntityObjectGroup;
		}).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "propertyDecorator.indexGroupTypeNotSupported",
				properties: { property: "prop1", type: "object" }
			})
		);
	});

	test("Can fail to set an index group on an array property", () => {
		expect(() => {
			class TestEntityArrayGroup {
				@property({
					type: "array",
					itemType: "string",
					indexGroup: [{ name: "aaa", direction: SortDirection.Ascending, index: 0 }]
				})
				public prop1: string[] = [];
			}
			return TestEntityArrayGroup;
		}).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "propertyDecorator.indexGroupTypeNotSupported",
				properties: { property: "prop1", type: "array" }
			})
		);
	});

	test("Can set an object property with no index group", () => {
		expect(() => {
			class TestEntityObjectNoGroup {
				@property({ type: "object" })
				public prop1: object = {};
			}
			return TestEntityObjectNoGroup;
		}).not.toThrow();
	});

	test("Can fail to set a property which repeats an index group name", () => {
		expect(() => {
			class TestEntityDuplicateGroup {
				@property({
					type: "string",
					indexGroup: [
						{ name: "aaa", direction: SortDirection.Ascending, index: 0 },
						{ name: "bbb", direction: SortDirection.Ascending, index: 1 },
						{ name: "aaa", direction: SortDirection.Descending, index: 2 }
					]
				})
				public prop1: string = "";
			}
			return TestEntityDuplicateGroup;
		}).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "propertyDecorator.duplicateIndexGroup",
				properties: { property: "prop1", group: "aaa" }
			})
		);
	});
});
