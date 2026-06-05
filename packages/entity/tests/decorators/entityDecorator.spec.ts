// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { entity } from "../../src/decorators/entityDecorator.js";
import { DecoratorHelper } from "../../src/utils/decoratorHelper.js";

/**
 * Test entity without a version.
 */
@entity()
export class TestEntity {}

/**
 * Test entity with a description.
 */
@entity({ description: "This is a test entity with a description." })
export class TestEntityWithDescription {}

/**
 * Test entity with an explicit version.
 */
@entity({ version: 3 })
export class TestEntityVersioned {}

describe("EntityDecorator", () => {
	test("Can set entity metadata on an entity", () => {
		expect(DecoratorHelper.getSchema(TestEntity)).toEqual({ type: "TestEntity" });
	});

	test("Can set description on the schema when provided via options", () => {
		expect(DecoratorHelper.getSchema(TestEntityWithDescription)).toEqual({
			type: "TestEntityWithDescription",
			description: "This is a test entity with a description."
		});
	});

	test("Can set version on the schema when provided via options", () => {
		expect(DecoratorHelper.getSchema(TestEntityVersioned)).toEqual({
			type: "TestEntityVersioned",
			version: 3
		});
	});

	test("Can leave version undefined on the schema when not provided", () => {
		expect(DecoratorHelper.getSchema(TestEntity)?.version).toBeUndefined();
	});
});
