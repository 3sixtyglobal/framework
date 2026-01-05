// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Guards } from "../../src/utils/guards.js";

describe("Guards", () => {
	beforeAll(async () => {});

	test("string can fail if value is undefined", () => {
		expect(() => Guards.string("source", "propName", undefined)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.string" })
		);
	});

	test("string can fail if value is null", () => {
		expect(() => Guards.string("source", "propName", null)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.string" })
		);
	});

	test("string can fail if value is a number", () => {
		expect(() => Guards.string("source", "propName", 10)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.string" })
		);
	});

	test("string can fail if value is a boolean", () => {
		expect(() => Guards.string("source", "propName", true)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.string" })
		);
	});

	test("string can succeed if value is a string", () => {
		expect(Guards.string("source", "propName", "")).toBeUndefined();
	});

	test("stringValue can fail if value is undefined", () => {
		expect(() => Guards.stringValue("source", "propName", undefined)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.string" })
		);
	});

	test("stringValue can fail if value is null", () => {
		expect(() => Guards.stringValue("source", "propName", null)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.string" })
		);
	});

	test("stringValue can fail if value is a number", () => {
		expect(() => Guards.stringValue("source", "propName", 10)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.string" })
		);
	});

	test("stringValue can fail if value is a boolean", () => {
		expect(() => Guards.stringValue("source", "propName", true)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.string" })
		);
	});

	test("stringValue can fail if value is an empty string", () => {
		expect(() => Guards.stringValue("source", "propName", "")).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.stringEmpty" })
		);
	});

	test("stringValue can succeed if value is a string", () => {
		expect(Guards.stringValue("source", "propName", "a")).toBeUndefined();
	});

	test("json can fail if value is an empty string", () => {
		expect(() => Guards.json("source", "propName", "")).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.stringJson" })
		);
	});

	test("json can succeed if value is a json string", () => {
		expect(Guards.json("source", "propName", '"aaa"')).toBeUndefined();
	});

	test("json can succeed if value is a json object", () => {
		expect(Guards.json("source", "propName", "{}")).toBeUndefined();
	});

	test("json can succeed if value is a json object", () => {
		expect(Guards.json("source", "propName", "{}")).toBeUndefined();
	});

	test("number can fail if value is not a number", () => {
		expect(() => Guards.number("source", "propName", undefined)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.number" })
		);
	});

	test("number can fail if value is a boolean", () => {
		expect(() => Guards.number("source", "propName", true)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.number" })
		);
	});

	test("number can fail if value is not a finite number", () => {
		expect(() => Guards.number("source", "propName", Number.POSITIVE_INFINITY)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.number" })
		);
	});

	test("number can fail if value is not a number", () => {
		expect(() => Guards.number("source", "propName", Number.NaN)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.number" })
		);
	});

	test("number can succeed if value is a number", () => {
		expect(Guards.number("source", "propName", 1.2345)).toBeUndefined();
	});

	test("boolean can fail if value is a falsy value", () => {
		expect(() => Guards.boolean("source", "propName", 0)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.boolean" })
		);
	});

	test("boolean can fail if value is a truthy value", () => {
		expect(() => Guards.boolean("source", "propName", 1)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.boolean" })
		);
	});

	test("boolean can succeed if value is a true boolean", () => {
		expect(Guards.boolean("source", "propName", true)).toBeUndefined();
	});

	test("boolean can succeed if value is a false boolean", () => {
		expect(Guards.boolean("source", "propName", false)).toBeUndefined();
	});

	test("date can fail if value is a undefined value", () => {
		expect(() => Guards.date("source", "propName", undefined)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.date" })
		);
	});

	test("date can fail if value is a null value", () => {
		expect(() => Guards.date("source", "propName", null)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.date" })
		);
	});

	test("date can fail if value is an invalid ate", () => {
		expect(() => Guards.date("source", "propName", new Date("foo"))).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.date" })
		);
	});

	test("date can succeed if value is a valid date", () => {
		expect(Guards.date("source", "propName", new Date())).toBeUndefined();
	});

	test("object can fail if value is undefined", () => {
		expect(() => Guards.object("source", "propName", undefined)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.objectUndefined" })
		);
	});

	test("object can fail if value is null", () => {
		expect(() => Guards.object("source", "propName", null)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.object" })
		);
	});

	test("object can fail if value is not an object", () => {
		expect(() => Guards.object("source", "propName", 5)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.object" })
		);
	});

	test("object can succeed if value is an object", () => {
		expect(Guards.object("source", "propName", {})).toBeUndefined();
	});

	test("array can fail if value is undefined", () => {
		expect(() => Guards.array("source", "propName", undefined)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.array" })
		);
	});

	test("array can fail if value is null", () => {
		expect(() => Guards.array("source", "propName", null)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.array" })
		);
	});

	test("array can fail if value is not an array", () => {
		expect(() => Guards.array("source", "propName", 5)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.array" })
		);
	});

	test("array can succeed if value is an array", () => {
		expect(Guards.array("source", "propName", [])).toBeUndefined();
	});

	test("arrayValue can fail if value is undefined", () => {
		expect(() => Guards.arrayValue("source", "propName", undefined)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.array" })
		);
	});

	test("arrayValue can fail if value is an empty array", () => {
		expect(() => Guards.arrayValue("source", "propName", [])).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.arrayValue" })
		);
	});

	test("arrayValue can succeed if value is an array with at least one item", () => {
		expect(Guards.arrayValue("source", "propName", [1])).toBeUndefined();
	});

	test("arrayOneOf can fail if the options are undefined", () => {
		expect(() =>
			Guards.arrayOneOf("source", "propName", 1, undefined as unknown as number[])
		).toThrow(expect.objectContaining({ name: "GuardError", message: "guard.array" }));
	});

	test("arrayOneOf can fail if value is not in array", () => {
		expect(() => Guards.arrayOneOf<number>("source", "propName", 1, [2, 3])).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.arrayOneOf" })
		);
	});

	test("arrayOneOf can succeed if value is in options array", () => {
		expect(Guards.arrayOneOf("source", "propName", 1, [1, 2, 3])).toBeUndefined();
	});

	test("arrayStartsWith can fail if value is not an array", () => {
		expect(() => Guards.arrayStartsWith("source", "propName", 1, [4])).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.array" })
		);
	});

	test("arrayStartsWith can fail if value does not start with the specificied values", () => {
		expect(() => Guards.arrayStartsWith("source", "propName", [1, 2, 3], [4])).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.arrayStartsWith" })
		);
	});

	test("arrayStartsWith can succeed if value starts with provided values", () => {
		expect(Guards.arrayStartsWith("source", "propName", [1, 2, 3], [1])).toBeUndefined();
	});

	test("arrayStartsWith can succeed if value starts with multiple provided values", () => {
		expect(Guards.arrayStartsWith("source", "propName", [1, 2, 3], [1, 2])).toBeUndefined();
	});

	test("arrayStartsWith can fail if value is not an array", () => {
		expect(() => Guards.arrayStartsWith("source", "propName", 1, [4])).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.array" })
		);
	});

	test("arrayEndsWith can fail if value does not end with the specificied values", () => {
		expect(() => Guards.arrayEndsWith("source", "propName", [1, 2, 3], [4])).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.arrayEndsWith" })
		);
	});

	test("arrayEndsWith can succeed if value ends with provided values", () => {
		expect(Guards.arrayEndsWith("source", "propName", [1, 2, 3], [3])).toBeUndefined();
	});

	test("arrayEndsWith can succeed if value ends with multiple provided values", () => {
		expect(Guards.arrayEndsWith("source", "propName", [1, 2, 3], [2, 3])).toBeUndefined();
	});

	test("uint8Array can fail if value is not a Uint8Array", () => {
		expect(() => Guards.uint8Array("source", "propName", undefined)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.uint8Array" })
		);
	});

	test("uint8Array can succeed if value is a Uint8Array", () => {
		expect(Guards.uint8Array("source", "propName", new Uint8Array())).toBeUndefined();
	});

	test("function can fail if value is not a function", () => {
		expect(() => Guards.function("source", "propName", undefined)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.function" })
		);
	});

	test("function can succeed if value is a function", () => {
		// Guard should not throw and returns void (undefined) after successful assertion.
		expect(Guards.function("source", "propName", () => {})).toBeUndefined();
	});

	test("function generic assertion narrows unknown to typed function", () => {
		function addFn(a: number, b: number): number {
			return a + b;
		}

		const addUnknown: unknown = addFn;
		Guards.function<(a: number, b: number) => number>("source", "propName", addUnknown);
		expect((addUnknown as (a: number, b: number) => number)(2, 3)).toEqual(5);
	});

	test("function generic assertion works with async function", async () => {
		async function multiplyFn(x: number): Promise<number> {
			return x * 2;
		}

		const asyncUnknown: unknown = multiplyFn;
		Guards.function<(x: number) => Promise<number>>("source", "propName", asyncUnknown);
		const out = await (asyncUnknown as (x: number) => Promise<number>)(7);
		expect(out).toEqual(14);
	});

	test("function assertion supports higher-order function signature narrowing", () => {
		function hofFn(fn: (n: number) => number): number {
			return fn(4);
		}

		const hofUnknown: unknown = hofFn;
		Guards.function<(fn: (n: number) => number) => number>("source", "propName", hofUnknown);
		const value = (hofUnknown as (fn: (n: number) => number) => number)(n => n + 1);
		expect(value).toEqual(5);
	});

	test("function can fail if value is a plain object with call property but not a function", () => {
		const tricky = { call: () => 1 };
		expect(() => Guards.function("source", "propName", tricky)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.function" })
		);
	});

	test("function can fail if value is a class instance", () => {
		/**
		 * Simple worker class used to test non-function instance failure.
		 */
		class Worker {
			/**
			 * Returns constant value 1.
			 * @returns Number 1.
			 */
			public run(): number {
				return 1;
			}
		}
		const instance = new Worker();
		expect(() => Guards.function("source", "propName", instance)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.function" })
		);
	});

	test("uuidV7 can succeed if value is a UUIDv7 formatted string", () => {
		expect(
			Guards.uuidV7("source", "propName", "017f7f80-7e4b-7e4b-8e4b-7e4b8e4b7e4b")
		).toBeUndefined();
	});

	test("uuidv7 can fail if value is not in the correct format", () => {
		expect(() => Guards.uuidV7("source", "propName", 10)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.uuidV7" })
		);
	});

	test("uuidV7Compact can succeed if value is a UUIDv7 compact formatted string", () => {
		expect(
			Guards.uuidV7("source", "propName", "017f7f807e4b7e4b8e4b7e4b8e4b7e4b", "compact")
		).toBeUndefined();
	});

	test("uuidv7 can fail if value is not in the correct format for compact", () => {
		expect(() => Guards.uuidV7("source", "propName", 10, "compact")).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.uuidV7Compact" })
		);
	});
});
