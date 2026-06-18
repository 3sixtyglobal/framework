// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { RandomHelper } from "../../src/helpers/randomHelper.js";
import { Is } from "../../src/utils/is.js";

describe("Is", () => {
	test("undefined can succeed if value is undefined", () => {
		expect(Is.undefined(undefined)).toEqual(true);
	});

	test("undefined can fail if value is null", () => {
		expect(Is.undefined(null)).toEqual(false);
	});

	test("null can succeed if value is null", () => {
		expect(Is.null(null)).toEqual(true);
	});

	test("null can fail if value is undefined", () => {
		expect(Is.null(undefined)).toEqual(false);
	});

	test("empty can succeed if value is undefined", () => {
		expect(Is.empty(undefined)).toEqual(true);
	});

	test("empty can succeed if value is null", () => {
		expect(Is.empty(null)).toEqual(true);
	});

	test("empty can fail if value is undefined", () => {
		expect(Is.notEmpty(undefined)).toEqual(false);
	});

	test("empty can fail if value is null", () => {
		expect(Is.notEmpty(null)).toEqual(false);
	});

	test("string can fail if value is undefined", () => {
		expect(Is.string(undefined)).toEqual(false);
	});

	test("string can fail if value is null", () => {
		expect(Is.string(null)).toEqual(false);
	});

	test("string can fail if value is a number", () => {
		expect(Is.string(10)).toEqual(false);
	});

	test("string can fail if value is a boolean", () => {
		expect(Is.string(true)).toEqual(false);
	});

	test("string can succeed if value is a string", () => {
		expect(Is.string("")).toEqual(true);
	});

	test("stringValue can fail if value is undefined", () => {
		expect(Is.stringValue(undefined)).toEqual(false);
	});

	test("stringValue can fail if value is null", () => {
		expect(Is.stringValue(null)).toEqual(false);
	});

	test("stringValue can fail if value is a number", () => {
		expect(Is.stringValue(10)).toEqual(false);
	});

	test("stringValue can fail if value is a boolean", () => {
		expect(Is.stringValue(true)).toEqual(false);
	});

	test("stringValue can fail if value is an empty string", () => {
		expect(Is.stringValue("")).toEqual(false);
	});

	test("stringValue can fail if value is whitespace", () => {
		expect(Is.stringValue("  ")).toEqual(false);
	});

	test("stringValue can succeed if value is a string", () => {
		expect(Is.stringValue("a")).toEqual(true);
	});

	test("json can fail if value is an empty string", () => {
		expect(Is.json("")).toEqual(false);
	});

	test("json can fail if value is not valid JSON", () => {
		expect(Is.json("!")).toEqual(false);
	});

	test("json can succeed with valid JSON object", () => {
		expect(Is.json("{}")).toEqual(true);
	});

	test("json can succeed with valid JSON array", () => {
		expect(Is.json("[]")).toEqual(true);
	});

	test("json can succeed with valid JSON string", () => {
		expect(Is.json('""')).toEqual(true);
	});

	test("json can succeed with valid JSON boolean", () => {
		expect(Is.json("false")).toEqual(true);
	});

	test("json can succeed with valid JSON number", () => {
		expect(Is.json("1")).toEqual(true);
	});

	test("json can succeed with valid JSON null", () => {
		expect(Is.json("null")).toEqual(true);
	});

	test("stringBase64 can fail if value is an empty string", () => {
		expect(Is.stringBase64("")).toEqual(false);
	});

	test("stringBase64 can fail if value is an invalid base64 string", () => {
		expect(Is.stringBase64("!")).toEqual(false);
	});

	test("stringBase64 can fail with base64 url string", () => {
		expect(Is.stringBase64("Pio6bkd2KmQpc3I-VUc6IGE2bnI_MWlfXFw=")).toEqual(false);
	});

	test("stringBase64 can succeed with base64 string", () => {
		expect(Is.stringBase64("Pio6bkd2KmQpc3I+VUc6IGE2bnI/MWlfXFw=")).toEqual(true);
	});

	test("stringBase64Url can fail if value is an empty string", () => {
		expect(Is.stringBase64Url("")).toEqual(false);
	});

	test("stringBase64Url can fail if value is an invalid base64 url string", () => {
		expect(Is.stringBase64Url("!")).toEqual(false);
	});

	test("stringBase64Url can fail with base64 string", () => {
		expect(Is.stringBase64Url("Pio6bkd2KmQpc3I+VUc6IGE2bnI/MWlfXFw=")).toEqual(false);
	});

	test("stringBase64Url can fail with base64 url string ending with =", () => {
		expect(Is.stringBase64Url("Pio6bkd2KmQpc3I-VUc6IGE2bnI_MWlfXFw=")).toEqual(false);
	});

	test("stringBase64Url can succeed with base64 url string", () => {
		expect(Is.stringBase64Url("Pio6bkd2KmQpc3I-VUc6IGE2bnI_MWlfXFw")).toEqual(true);
	});

	test("stringHex can fail if value is an empty string", () => {
		expect(Is.stringHex("")).toEqual(false);
	});

	test("stringHex can fail if value contains non hex characters", () => {
		expect(Is.stringHex("zz")).toEqual(false);
	});

	test("stringHex can fail if value contains hex characters but not in pairs", () => {
		expect(Is.stringHex("aaa")).toEqual(false);
	});

	test("stringHex can fail if value contains hex characters with a prefix", () => {
		expect(Is.stringHex("0xaa")).toEqual(false);
	});

	test("stringHex can succeed if value contains hex characters", () => {
		expect(Is.stringHex("aa")).toEqual(true);
	});

	test("stringHexLength can fail if value contains hex characters but is the wrong length", () => {
		expect(Is.stringHexLength("aaaa", 2)).toEqual(false);
	});

	test("stringHexLength can succeed if value contains hex characters and matches the length", () => {
		expect(Is.stringHexLength("aa", 2)).toEqual(true);
	});

	test("number can fail if value is not a number", () => {
		expect(Is.number(undefined)).toEqual(false);
	});

	test("number can fail if value is a boolean", () => {
		expect(Is.number(true)).toEqual(false);
	});

	test("number can fail if value is not a finite number", () => {
		expect(Is.number(Number.POSITIVE_INFINITY)).toEqual(false);
	});

	test("number can fail if value is not a number", () => {
		expect(Is.number(Number.NaN)).toEqual(false);
	});

	test("number can succeed if value is a number", () => {
		expect(Is.number(1.2345)).toEqual(true);
	});

	test("integer can fail if value is not an integer", () => {
		expect(Is.integer(1.23)).toEqual(false);
	});

	test("integer can succeed if value is a integer", () => {
		expect(Is.integer(1)).toEqual(true);
	});

	test("bigint can fail if value is not a bigint", () => {
		expect(Is.bigint(1)).toEqual(false);
	});

	test("bigint can succeed if value is a bigint", () => {
		expect(Is.bigint(1n)).toEqual(true);
	});

	test("boolean can fail if value is a falsy value", () => {
		expect(Is.boolean(0)).toEqual(false);
	});

	test("boolean can fail if value is a truthy value", () => {
		expect(Is.boolean(1)).toEqual(false);
	});

	test("boolean can succeed if value is a true boolean", () => {
		expect(Is.boolean(true)).toEqual(true);
	});

	test("boolean can succeed if value is a false boolean", () => {
		expect(Is.boolean(false)).toEqual(true);
	});

	test("date can fail if value is an undefined value", () => {
		expect(Is.date(undefined)).toEqual(false);
	});

	test("date can fail if value is a null value", () => {
		expect(Is.date(null)).toEqual(false);
	});

	test("date can fail if value is an invalid date", () => {
		expect(Is.date(new Date("random_string"))).toEqual(false);
	});

	test("date can succeed if value is a date", () => {
		expect(Is.date(new Date())).toEqual(true);
	});

	test("dateEmpty can fail if value is not an empty date", () => {
		expect(Is.dateEmpty(new Date())).toEqual(false);
	});

	test("date can succeed if value is an empty date", () => {
		expect(Is.dateEmpty(new Date(""))).toEqual(true);
	});

	test("dateString can fail if value is not a date string", () => {
		expect(Is.dateString("jhkh")).toEqual(false);
	});

	test("dateString can fail if value contains a time", () => {
		expect(Is.dateString("2021-09-28T13:25:09.249Z")).toEqual(false);
	});

	test("dateString can succeed if value is a date string", () => {
		expect(Is.dateString("2021-09-28")).toEqual(true);
	});

	test("dateTimeString can fail if value is not a time string", () => {
		expect(Is.dateTimeString("jhkh")).toEqual(false);
	});

	test("dateTimeString can succeed if value is a date string", () => {
		expect(Is.dateTimeString("2021-09-28T13:25:09.249Z")).toEqual(true);
	});

	test("timeString can fail if value is not a time string", () => {
		expect(Is.timeString("jhkh")).toEqual(false);
	});

	test("timeString can fail if value contains a date", () => {
		expect(Is.timeString("2021-09-28T13:25:09.249Z")).toEqual(false);
	});

	test("timeString can succeed if value is a time string", () => {
		expect(Is.timeString("13:25:09.249Z")).toEqual(true);
	});

	test("seconds timestamp can fail if value is not a number", () => {
		expect(Is.timestampSeconds("100")).toEqual(false);
	});

	test("seconds timestamp can fail if value contains a number with 12 or more digits", () => {
		expect(Is.timestampSeconds(100000000000)).toEqual(false);
	});

	test("seconds timestamp can succeed if value contains a number with less than 12 digits", () => {
		expect(Is.timestampSeconds(0)).toEqual(true);
	});

	test("milliseconds timestamp can fail if value is not a number", () => {
		expect(Is.timestampMilliseconds("100")).toEqual(false);
	});

	test("milliseconds timestamp can fail if value contains a number with less than or equal to 12", () => {
		expect(Is.timestampMilliseconds(10000000000)).toEqual(false);
	});

	test("milliseconds timestamp can succeed if value contains a number with greater than or equal to 12 digits", () => {
		expect(Is.timestampMilliseconds(100000000000)).toEqual(true);
	});

	test("object can fail if value is undefined", () => {
		expect(Is.object(undefined)).toEqual(false);
	});

	test("object can fail if value is null", () => {
		expect(Is.object(null)).toEqual(false);
	});

	test("object can fail if value is not an object", () => {
		expect(Is.object(5)).toEqual(false);
	});

	test("object can fail if value is an array", () => {
		expect(Is.object([])).toEqual(false);
	});

	test("object can succeed if value is an object", () => {
		expect(Is.object({})).toEqual(true);
	});

	test("objectValue can fail if value is an object with no keys", () => {
		expect(Is.objectValue({})).toEqual(false);
	});

	test("objectValue can succeed if value is an object with keys", () => {
		expect(Is.objectValue({ foo: "bar" })).toEqual(true);
	});

	test("array can fail if value is undefined", () => {
		expect(Is.array(undefined)).toEqual(false);
	});

	test("array can fail if value is a null value", () => {
		expect(Is.array(null)).toEqual(false);
	});

	test("array can succeed if value is an empty array", () => {
		expect(Is.array([])).toEqual(true);
	});

	test("array can succeed if value is a value array", () => {
		expect(Is.array([1, 2, 3])).toEqual(true);
	});

	test("arrayValue can fail if it is an array with no entries", () => {
		expect(Is.arrayValue([])).toEqual(false);
	});

	test("array can succeed if value is a value array", () => {
		expect(Is.arrayValue([1])).toEqual(true);
	});

	test("arrayOneOf can fail if the value is not in the array", () => {
		expect(Is.arrayOneOf(0, [1, 2, 3])).toEqual(false);
	});

	test("arrayOneOf can succeed if value is in the array with numbers", () => {
		expect(Is.arrayOneOf(1, [1, 2, 3])).toEqual(true);
	});

	test("arrayOneOf can succeed if value is in the array with strings", () => {
		expect(Is.arrayOneOf("1", ["1", "2", "3"])).toEqual(true);
	});

	test("uint8Array can fail if value is not a Uint8Array", () => {
		expect(Is.uint8Array(undefined)).toEqual(false);
	});

	test("uint8Array can succeed if value is a Uint8Array", () => {
		expect(Is.uint8Array(new Uint8Array())).toEqual(true);
	});

	test("function can fail if value is not a function", () => {
		expect(Is.function(undefined)).toEqual(false);
	});

	test("function can succeed if value is a function", () => {
		expect(Is.function(() => {})).toEqual(true);
	});

	test("function can succeed when the signature matches", () => {
		const fn: (a: number, b: string) => number = (a: number, b: string) => a;
		expect(Is.function(fn)).toEqual(true);
		if (Is.function(fn)) {
			fn(1, "test");
		}
	});

	test("function can fail when the signature does not match", () => {
		const fn: (a: number, b: string) => number = (a: number, b: string) => a;
		expect(Is.function<(a: number, b: string) => number>(fn)).toEqual(true);
		if (Is.function<(a: number, b: string) => number>(fn)) {
			// @ts-expect-error The following call is expected to fail because the signature does not match.
			fn(1, 2);
		}
	});

	test("email can fail if value if the value is empty", () => {
		expect(Is.email("")).toEqual(false);
	});

	test("email can succeed if value is a valid email format", () => {
		expect(Is.email("a@localhost")).toEqual(true);
	});

	test("email can succeed if value is a valid email format with domain", () => {
		expect(Is.email("a@example.com")).toEqual(true);
	});

	test("promise can fail if the value is not a valid promise", () => {
		expect(Is.promise(() => {})).toEqual(false);
	});

	test("promise can succeed if value is a valid promise", () => {
		expect(Is.promise(new Promise(() => {}))).toEqual(true);
	});

	test("regexp can fail if the value is not a valid regexp", () => {
		expect(Is.regexp("//aaa")).toEqual(false);
	});

	test("regexp can succeed if value is a valid regexp string", () => {
		expect(Is.regexp(/a/g)).toEqual(true);
	});

	test("regexp can succeed if value is a valid regexp", () => {
		// eslint-disable-next-line prefer-regex-literals
		expect(Is.regexp(new RegExp(""))).toEqual(true);
	});

	test("should return true for ES6 classes", () => {
		/**
		 * MyClass is a simple ES6 class.
		 */
		class MyClass {}
		expect(Is.class(MyClass)).toBe(true);
	});

	test("should return false for regular functions", () => {
		/**
		 * MyFunc is a regular function.
		 */

		function MyFunc(): void {}
		expect(Is.class(MyFunc)).toBe(false);
	});

	test("should return false for arrow functions", () => {
		const arrow = (): void => {};
		expect(Is.class(arrow)).toBe(false);
	});

	test("should return false for objects", () => {
		expect(Is.class({})).toBe(false);
	});

	test("should return false for primitives", () => {
		expect(Is.class(123)).toBe(false);
		expect(Is.class("string")).toBe(false);
		expect(Is.class(null)).toBe(false);
		expect(Is.class(undefined)).toBe(false);
	});

	test("should allow instantiation with new when true", () => {
		/**
		 * TestClass is a test class for instantiation.
		 */
		class TestClass {
			// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility, no-restricted-syntax
			value = 42;
		}
		if (Is.class(TestClass)) {
			const instance = new TestClass();
			expect(instance.value).toBe(42);
		} else {
			throw new Error("Is.class failed to detect class");
		}
	});

	test("uuidV7 can fail if value is undefined", () => {
		expect(Is.uuidV7(undefined)).toEqual(false);
	});

	test("uuidV7 can fail if value is null", () => {
		expect(Is.uuidV7(null)).toEqual(false);
	});

	test("uuidV7 can fail if value is empty", () => {
		expect(Is.uuidV7("")).toEqual(false);
	});

	test("uuidV7 can succeed for a generated UUIDv7", () => {
		const uuid = RandomHelper.generateUuidV7();
		expect(Is.uuidV7(uuid)).toEqual(true);
	});

	test("uuidV7 can fail for a generated UUIDv7 in generated compact mode", () => {
		const uuid = RandomHelper.generateUuidV7("compact");
		expect(Is.uuidV7(uuid)).toEqual(false);
	});

	test("uuidV7 can fail for a generated UUIDv7 in test compact mode", () => {
		const uuid = RandomHelper.generateUuidV7();
		expect(Is.uuidV7(uuid, "compact")).toEqual(false);
	});

	test("uuidV7 can succeed for a generated UUIDv7 with both in compact mode", () => {
		const uuid = RandomHelper.generateUuidV7("compact");
		expect(Is.uuidV7(uuid, "compact")).toEqual(true);
	});

	test("uuidV7 can fail if the version is not 7", () => {
		const uuid = RandomHelper.generateUuidV7();
		// UUID format: xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx
		// The version is the first nibble of the 3rd group (index 14 in the string)
		const notV7 = `${uuid.slice(0, 14)}4${uuid.slice(15)}`;
		expect(Is.uuidV7(notV7)).toEqual(false);
	});

	test("uuidV7 can fail if the variant is not RFC 9562 v2 variant", () => {
		const uuid = RandomHelper.generateUuidV7();
		// The variant is the first nibble of the 4th group (index 19 in the string)
		const badVariant = `${uuid.slice(0, 19)}0${uuid.slice(20)}`;
		expect(Is.uuidV7(badVariant)).toEqual(false);
	});

	test("duration can fail if value is undefined", () => {
		expect(Is.duration(undefined)).toEqual(false);
	});

	test("duration can fail if value is a number", () => {
		expect(Is.duration(3600)).toEqual(false);
	});

	test("duration can fail if value is an invalid string", () => {
		expect(Is.duration("foo")).toEqual(false);
	});

	test("duration can fail if value is a bare P string", () => {
		expect(Is.duration("P")).toEqual(false);
	});

	test("duration can succeed for an ISO 8601 hours string", () => {
		expect(Is.duration("PT1H")).toEqual(true);
	});

	test("duration can succeed for a composite ISO 8601 string", () => {
		expect(Is.duration("P1Y2M3DT4H5M6S")).toEqual(true);
	});
});
