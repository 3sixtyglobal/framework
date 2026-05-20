// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { ObjectOrArray } from "../../src/types/objectOrArray.js";

interface ITestObject {
	id: string;
}

describe("ObjectOrArray", () => {
	test("can represent a single value or array of values", () => {
		expectTypeOf<ObjectOrArray<ITestObject>>().toEqualTypeOf<ITestObject | ITestObject[]>();
	});

	test("can assign a single object", () => {
		const value: ObjectOrArray<ITestObject> = { id: "abc" };

		expect(Array.isArray(value)).toEqual(false);
	});

	test("can assign an array of objects", () => {
		const value: ObjectOrArray<ITestObject> = [{ id: "abc" }, { id: "def" }];

		expect(Array.isArray(value)).toEqual(true);
	});

	test("can fail assignment for wrong type", () => {
		// @ts-expect-error number is not assignable to ObjectOrArray<{ id: string }>
		const value: ObjectOrArray<ITestObject> = 123;

		expect(value).toBeDefined();
	});
});
