// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { SingleOccurrenceArray } from "../../src/types/singleOccurrenceArray.js";

interface IFoo {
	foo: boolean;
}

interface IBar {
	bar: string;
}

describe("SingleOccurrenceArray", () => {
	test("can fail assignment with no number", () => {
		// @ts-expect-error one number is required in SingleOccurrenceArray<string, number>
		const value: SingleOccurrenceArray<string, number> = ["aaa", "bbb", "ccc"];

		expect(value).toBeDefined();
	});

	test("can allow strings with a single number", () => {
		const value: SingleOccurrenceArray<string, number> = ["aaa", 1, "bbb", "ccc"];

		expect(value).toEqual(["aaa", 1, "bbb", "ccc"]);
	});

	test("can allow only one number", () => {
		const value: SingleOccurrenceArray<string, number> = [1];

		expect(value).toEqual([1]);
	});

	test("can fail assignment with multiple numbers", () => {
		// @ts-expect-error only one number is allowed in SingleOccurrenceArray<string, number>
		const value: SingleOccurrenceArray<string, number> = ["aaa", 1, 2, "bbb", "ccc"];

		expect(value).toBeDefined();
	});

	test("can fail assignment for an empty array", () => {
		// @ts-expect-error empty arrays are not allowed in SingleOccurrenceArray<string, number>
		const value: SingleOccurrenceArray<string, number> = [];

		expect(value).toBeDefined();
	});

	test("can fail assignment with no object type U", () => {
		// @ts-expect-error one value of type IBar is required in SingleOccurrenceArray<IFoo, IBar>
		const value: SingleOccurrenceArray<IFoo, IBar> = [{ foo: true }, { foo: false }];

		expect(value).toBeDefined();
	});

	test("can allow one object type U mixed with object type T", () => {
		const value: SingleOccurrenceArray<IFoo, IBar> = [
			{ foo: true },
			{ bar: "hello" },
			{ foo: false }
		];

		expect(value).toEqual([{ foo: true }, { bar: "hello" }, { foo: false }]);
	});

	test("can allow a single object type U", () => {
		const value: SingleOccurrenceArray<IFoo, IBar> = [{ bar: "single" }];

		expect(value).toEqual([{ bar: "single" }]);
	});

	test("can fail assignment with multiple object type U values", () => {
		// @ts-expect-error only one value of type IBar is allowed in SingleOccurrenceArray<IFoo, IBar>
		const value: SingleOccurrenceArray<IFoo, IBar> = [
			{ foo: true },
			{ bar: "one" },
			{ bar: "two" }
		];

		expect(value).toBeDefined();
	});
});
