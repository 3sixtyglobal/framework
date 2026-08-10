// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Coerce } from "../../src/utils/coerce.js";

describe("Coerce", () => {
	test("string can coerce if value is undefined", () => {
		expect(Coerce.string(undefined)).toEqual(undefined);
	});

	test("string can coerce if value is a string", () => {
		expect(Coerce.string("foo")).toEqual("foo");
	});

	test("string can coerce if value is a number", () => {
		expect(Coerce.string(123.45)).toEqual("123.45");
	});

	test("string can coerce if value is a false boolean", () => {
		expect(Coerce.string(false)).toEqual("false");
	});

	test("string can coerce if value is a true boolean", () => {
		expect(Coerce.string(true)).toEqual("true");
	});

	test("string can coerce if value is a date", () => {
		expect(Coerce.string(new Date(0))).toEqual("1970-01-01T00:00:00.000Z");
	});

	test("string can fail if value is an object", () => {
		expect(Coerce.string({})).toEqual(undefined);
	});

	test("number can coerce if value is undefined", () => {
		expect(Coerce.number(undefined)).toEqual(undefined);
	});

	test("number can coerce if value is a string", () => {
		expect(Coerce.number("123.45")).toEqual(123.45);
	});

	test("number can fail if value is an invalid string", () => {
		expect(Coerce.number("foo")).toEqual(undefined);
	});

	test("number can fail if value is a partial numeric string", () => {
		expect(Coerce.number("1111a")).toEqual(undefined);
	});

	test("number can coerce if value is a number", () => {
		expect(Coerce.number(123.45)).toEqual(123.45);
	});

	test("number can coerce if value is a false boolean", () => {
		expect(Coerce.number(false)).toEqual(0);
	});

	test("number can coerce if value is a true boolean", () => {
		expect(Coerce.number(true)).toEqual(1);
	});

	test("number can coerce if value is a date", () => {
		expect(Coerce.number(new Date("1970-01-01T00:00:00.000Z"))).toEqual(0);
	});

	test("number can fail if value is an object", () => {
		expect(Coerce.number({})).toEqual(undefined);
	});

	test("number can fail if value is a hex string", () => {
		expect(Coerce.number("0xFF")).toEqual(undefined);
	});

	test("number can fail if value is a binary string", () => {
		expect(Coerce.number("0b1010")).toEqual(undefined);
	});

	test("number can fail if value is an octal string", () => {
		expect(Coerce.number("0o17")).toEqual(undefined);
	});

	test("integer can coerce if value is undefined", () => {
		expect(Coerce.integer(undefined)).toEqual(undefined);
	});

	test("integer can coerce if value is a string", () => {
		expect(Coerce.integer("123.45")).toEqual(123);
	});

	test("integer can fail if value is an invalid string", () => {
		expect(Coerce.integer("foo")).toEqual(undefined);
	});

	test("integer can coerce if value is a number", () => {
		expect(Coerce.integer(123.45)).toEqual(123);
	});

	test("integer can coerce if value is a true boolean", () => {
		expect(Coerce.integer(true)).toEqual(1);
	});

	test("integer can coerce if value is a false boolean", () => {
		expect(Coerce.integer(false)).toEqual(0);
	});

	test("bigint can coerce if value is undefined", () => {
		expect(Coerce.bigint(undefined)).toEqual(undefined);
	});

	test("bigint can coerce if value is a string", () => {
		expect(Coerce.bigint("123")).toEqual(123n);
	});

	test("bigint can fail if value is an invalid string", () => {
		expect(Coerce.bigint("123.45")).toEqual(undefined);
	});

	test("bigint can coerce if value is a bigint", () => {
		expect(Coerce.bigint(123n)).toEqual(123n);
	});

	test("bigint can coerce if value is a false boolean", () => {
		expect(Coerce.bigint(false)).toEqual(0n);
	});

	test("bigint can coerce if value is a true boolean", () => {
		expect(Coerce.bigint(true)).toEqual(1n);
	});

	test("bigint can fail if value is an object", () => {
		expect(Coerce.bigint({})).toEqual(undefined);
	});

	test("bigint can coerce an integer number", () => {
		expect(Coerce.bigint(42)).toEqual(42n);
	});

	test("bigint returns undefined for a non-integer number", () => {
		expect(Coerce.bigint(1.9)).toEqual(undefined);
	});

	test("bigint converts large integer string exactly without precision loss", () => {
		expect(Coerce.bigint("9007199254740993")).toEqual(9007199254740993n);
	});

	test("bigint returns undefined for a string with trailing non-digit characters", () => {
		expect(Coerce.bigint("12abc")).toEqual(undefined);
	});

	test("bigint returns undefined for a hex string", () => {
		expect(Coerce.bigint("0x10")).toEqual(undefined);
	});

	test("boolean can coerce if value is undefined", () => {
		expect(Coerce.boolean(undefined)).toEqual(undefined);
	});

	test("boolean can coerce if value is boolean", () => {
		expect(Coerce.boolean(true)).toEqual(true);
	});

	test("boolean can coerce if value is a true string", () => {
		expect(Coerce.boolean("True")).toEqual(true);
	});

	test("boolean can coerce if value is a false string", () => {
		expect(Coerce.boolean("False")).toEqual(false);
	});

	test("boolean can fail if value is an invalid string", () => {
		expect(Coerce.boolean("foo")).toEqual(undefined);
	});

	test("boolean can fail if value is a string containing true as a substring", () => {
		expect(Coerce.boolean("trueish")).toEqual(undefined);
	});

	test("boolean can fail if value is a string containing false as a substring", () => {
		expect(Coerce.boolean("false alarm")).toEqual(undefined);
	});

	test("boolean can coerce if value is a number", () => {
		expect(Coerce.boolean(123.45)).toEqual(true);
	});

	test("boolean can coerce if value is a 0 boolean", () => {
		expect(Coerce.boolean(0)).toEqual(false);
	});

	test("boolean can fail if value is an object", () => {
		expect(Coerce.boolean({})).toEqual(undefined);
	});

	test("date can coerce if value is undefined", () => {
		expect(Coerce.date(undefined)).toEqual(undefined);
	});

	test("date can coerce if value is Date", () => {
		expect(Coerce.date(new Date(0))?.getTime()).toEqual(0);
	});

	test("date can coerce if value is an ISO date string", () => {
		expect(Coerce.date("2021-09-28T13:25:09.249Z")?.getTime()).toEqual(1632787200000);
	});

	test("date can coerce if value is an ISO time string", () => {
		expect(Coerce.time("2021-09-28T13:25:09.249Z")?.getTime()).toEqual(48309249);
	});

	test("date can coerce if value is an ISO date/time string", () => {
		expect(Coerce.dateTime("2021-09-28T13:25:09.249Z")?.getTime()).toEqual(1632835509249);
	});

	test("date can fail if value is null", () => {
		expect(Coerce.date(null)).toEqual(undefined);
	});

	test("date can coerce if value is a date-only string", () => {
		expect(Coerce.date("2021-09-28")?.getTime()).toEqual(1632787200000);
	});

	test("date can fail if value is an invalid string", () => {
		expect(Coerce.date("foo")).toEqual(undefined);
	});

	test("date can coerce if value is a number", () => {
		expect(Coerce.date(123.45)?.getTime()).toEqual(123);
	});

	test("date can coerce if value is an ISO date/time string with timezone offset", () => {
		// "2021-09-28T13:25:09.249+02:00" = "2021-09-28T11:25:09.249Z" - date portion is still 2021-09-28
		expect(Coerce.date("2021-09-28T13:25:09.249+02:00")?.getTime()).toEqual(1632787200000);
	});

	test("date can fail if value is an object", () => {
		expect(Coerce.date({})).toEqual(undefined);
	});

	test("dateTime can coerce if value is undefined", () => {
		expect(Coerce.dateTime(undefined)).toEqual(undefined);
	});

	test("dateTime can coerce if value is a Date", () => {
		expect(Coerce.dateTime(new Date(0))?.getTime()).toEqual(0);
	});

	test("dateTime can coerce if value is a number", () => {
		expect(Coerce.dateTime(1632835509249)?.getTime()).toEqual(1632835509249);
	});

	test("dateTime can coerce if value is an ISO date-only string", () => {
		// Date-only strings are treated as UTC midnight by new Date()
		expect(Coerce.dateTime("2021-09-28")?.getTime()).toEqual(1632787200000);
	});

	test("dateTime can coerce if value is an ISO date/time string", () => {
		expect(Coerce.dateTime("2021-09-28T13:25:09.249Z")?.getTime()).toEqual(1632835509249);
	});

	test("dateTime can coerce if value is an ISO date/time string with timezone offset", () => {
		// "2021-09-28T13:25:09.249+02:00" = "2021-09-28T11:25:09.249Z"
		expect(Coerce.dateTime("2021-09-28T13:25:09.249+02:00")?.getTime()).toEqual(1632828309249);
	});

	test("dateTime can fail if value is an invalid string", () => {
		expect(Coerce.dateTime("foo")).toEqual(undefined);
	});

	test("dateTime can fail if value is an object", () => {
		expect(Coerce.dateTime({})).toEqual(undefined);
	});

	test("time can coerce if value is undefined", () => {
		expect(Coerce.time(undefined)).toEqual(undefined);
	});

	test("time can coerce if value is a Date", () => {
		expect(Coerce.time(new Date(0))?.getTime()).toEqual(0);
	});

	test("time can coerce if value is a number", () => {
		// Mirror the implementation (setFullYear is local-time based) to keep the assertion timezone-safe
		const ref = new Date(1632835509249);
		ref.setFullYear(1970, 0, 1);
		expect(Coerce.time(1632835509249)?.getTime()).toEqual(ref.getTime());
	});

	test("time can coerce if value is an ISO date/time string", () => {
		expect(Coerce.time("2021-09-28T13:25:09.249Z")?.getTime()).toEqual(48309249);
	});

	test("time can coerce if value is an ISO date/time string with timezone offset", () => {
		// "2021-09-28T13:25:09.249+02:00" = "2021-09-28T11:25:09.249Z" - time portion is 11:25:09.249 UTC
		expect(Coerce.time("2021-09-28T13:25:09.249+02:00")?.getTime()).toEqual(41109249);
	});

	test("time can fail if value is an invalid string", () => {
		expect(Coerce.time("foo")).toEqual(undefined);
	});

	test("time can fail if value is an object", () => {
		expect(Coerce.time({})).toEqual(undefined);
	});

	test("time can coerce if value is a bare HH:MM:SS string", () => {
		// No timezone suffix - implementation prepends epoch date and parses as local time.
		// Derive expected UTC components the same way so the assertion is exact but timezone-safe.
		const ref = new Date("1970-01-01T09:30:00");
		const result = Coerce.time("09:30:00");
		expect(result?.getUTCFullYear()).toEqual(1970);
		expect(result?.getUTCMonth()).toEqual(0);
		expect(result?.getUTCDate()).toEqual(1);
		expect(result?.getUTCHours()).toEqual(ref.getUTCHours());
		expect(result?.getUTCMinutes()).toEqual(ref.getUTCMinutes());
		expect(result?.getUTCSeconds()).toEqual(ref.getUTCSeconds());
	});

	test("time can coerce if value is a bare HH:MM:SS string with Z suffix", () => {
		expect(Coerce.time("09:30:00Z")?.getTime()).toEqual(34200000);
	});

	test("time can coerce if value is a bare HH:MM:SS.mmm string", () => {
		// 09:30:00.123Z UTC = 34200000 + 123 ms
		expect(Coerce.time("09:30:00.123Z")?.getTime()).toEqual(34200123);
	});

	test("time can coerce if value is a bare HH:MM:SS string with timezone offset", () => {
		// 14:00:00+05:30 = 08:30:00 UTC = 8*3600000 + 30*60000 = 30600000 ms
		expect(Coerce.time("14:00:00+05:30")?.getTime()).toEqual(30600000);
	});

	test("uint8array can coerce if value is undefined", () => {
		expect(Coerce.uint8Array(undefined)).toEqual(undefined);
	});

	test("uint8array can coerce if value is already a Uint8Array", () => {
		const arr = new Uint8Array([1, 2, 3]);
		expect(Coerce.uint8Array(arr)).toBe(arr);
	});

	test("uint8array can coerce if value is base64", () => {
		expect(Coerce.uint8Array("MTIz")).toEqual(new Uint8Array([49, 50, 51]));
	});

	test("uint8array can coerce if value is hex", () => {
		expect(Coerce.uint8Array("0x000102")).toEqual(new Uint8Array([0, 1, 2]));
	});

	test("uint8array can coerce if value is hex upper", () => {
		expect(Coerce.uint8Array("0x0A0B0C")).toEqual(new Uint8Array([10, 11, 12]));
	});

	test("uint8array can fail if value is an invalid string", () => {
		expect(Coerce.uint8Array("not-hex-or-base64!")).toEqual(undefined);
	});

	test("uint8array can fail if value is an object", () => {
		expect(Coerce.uint8Array({})).toEqual(undefined);
	});

	test("duration can coerce if value is undefined", () => {
		expect(Coerce.duration(undefined)).toEqual(undefined);
	});

	test("duration can coerce if value is a number", () => {
		expect(Coerce.duration(3600)).toEqual({
			years: 0,
			months: 0,
			weeks: 0,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 3600
		});
	});

	test("duration can coerce if value is an ISO 8601 hour string", () => {
		expect(Coerce.duration("PT1H")).toEqual({
			years: 0,
			months: 0,
			weeks: 0,
			days: 0,
			hours: 1,
			minutes: 0,
			seconds: 0
		});
	});

	test("duration can coerce if value is an ISO 8601 minute string", () => {
		expect(Coerce.duration("PT30M")).toEqual({
			years: 0,
			months: 0,
			weeks: 0,
			days: 0,
			hours: 0,
			minutes: 30,
			seconds: 0
		});
	});

	test("duration can coerce if value is an ISO 8601 day string", () => {
		expect(Coerce.duration("P1D")).toEqual({
			years: 0,
			months: 0,
			weeks: 0,
			days: 1,
			hours: 0,
			minutes: 0,
			seconds: 0
		});
	});

	test("duration can coerce if value is a composite ISO 8601 string", () => {
		expect(Coerce.duration("P1DT2H30M")).toEqual({
			years: 0,
			months: 0,
			weeks: 0,
			days: 1,
			hours: 2,
			minutes: 30,
			seconds: 0
		});
	});

	test("duration can coerce if value is an ISO 8601 week string", () => {
		expect(Coerce.duration("P1W")).toEqual({
			years: 0,
			months: 0,
			weeks: 1,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0
		});
	});

	test("duration can coerce if value is a full ISO 8601 string", () => {
		expect(Coerce.duration("P1Y2M3DT4H5M6S")).toEqual({
			years: 1,
			months: 2,
			weeks: 0,
			days: 3,
			hours: 4,
			minutes: 5,
			seconds: 6
		});
	});

	test("duration can coerce if value is a negative ISO 8601 string", () => {
		expect(Coerce.duration("-P1DT2H3M4S")).toEqual({
			years: 0,
			months: 0,
			weeks: 0,
			days: -1,
			hours: -2,
			minutes: -3,
			seconds: -4
		});
	});

	test("duration can coerce if value has fractional seconds", () => {
		expect(Coerce.duration("PT1.23456789S")).toEqual({
			years: 0,
			months: 0,
			weeks: 0,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 1,
			milliseconds: 234,
			microseconds: 567,
			nanoseconds: 890
		});
	});

	test("duration can fail if value is an invalid string", () => {
		expect(Coerce.duration("foo")).toEqual(undefined);
	});

	test("duration can fail if value is a bare P string", () => {
		expect(Coerce.duration("P")).toEqual(undefined);
	});

	test("duration can fail if value is an object", () => {
		expect(Coerce.duration({})).toEqual(undefined);
	});

	test("duration can coerce if value is an IDuration object", () => {
		const input = { years: 0, months: 0, weeks: 0, days: 1, hours: 2, minutes: 30, seconds: 0 };
		expect(Coerce.duration(input)).toEqual(input);
	});

	test("duration can coerce if value is an IDuration object with sub-second fields", () => {
		const input = {
			years: 0,
			months: 0,
			weeks: 0,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 1,
			milliseconds: 250,
			microseconds: 500,
			nanoseconds: 250
		};
		expect(Coerce.duration(input)).toEqual(input);
	});

	test("object can coerce if value is undefined", () => {
		expect(Coerce.object(undefined)).toEqual(undefined);
	});

	test("object can coerce if value is an object", () => {
		const input = { a: 1 };
		expect(Coerce.object(input)).toEqual(input);
	});

	test("object can coerce if value is a valid JSON string", () => {
		expect(Coerce.object('{"a":1}')).toEqual({ a: 1 });
	});

	test("object can fail if value is an invalid JSON string", () => {
		expect(Coerce.object("not-json")).toEqual(undefined);
	});

	test("object can fail if value is a number", () => {
		expect(Coerce.object(42)).toEqual(undefined);
	});

	test("byType can coerce a string value", () => {
		expect(Coerce.byType(123, "string")).toEqual("123");
	});

	test("byType can coerce a number value", () => {
		expect(Coerce.byType("123.45", "number")).toEqual(123.45);
	});

	test("byType can coerce an integer value", () => {
		expect(Coerce.byType("123.45", "integer")).toEqual(123);
	});

	test("byType can coerce a bigint value", () => {
		expect(Coerce.byType("123", "bigint")).toEqual(123n);
	});

	test("byType can coerce a boolean value", () => {
		expect(Coerce.byType("true", "boolean")).toEqual(true);
	});

	test("byType can coerce a date value", () => {
		expect(Coerce.byType("2021-09-28T13:25:09.249Z", "date")).toEqual(new Date(1632787200000));
	});

	test("byType can coerce a dateTime value", () => {
		expect((Coerce.byType("2021-09-28T13:25:09.249Z", "datetime") as Date)?.getTime()).toEqual(
			1632835509249
		);
	});

	test("byType can coerce a time value", () => {
		expect((Coerce.byType("2021-09-28T13:25:09.249Z", "time") as Date)?.getTime()).toEqual(
			48309249
		);
	});

	test("byType can coerce an object value", () => {
		expect(Coerce.byType('{"a":1}', "object")).toEqual({ a: 1 });
	});

	test("byType can coerce a uint8array value", () => {
		expect(Coerce.byType("MTIz", "uint8array")).toEqual(new Uint8Array([49, 50, 51]));
	});

	test("byType can coerce a duration value", () => {
		expect(Coerce.byType("PT1H", "duration")).toEqual({
			years: 0,
			months: 0,
			weeks: 0,
			days: 0,
			hours: 1,
			minutes: 0,
			seconds: 0
		});
	});

	test("byType returns value unchanged when type is undefined", () => {
		expect(Coerce.byType("unchanged")).toEqual("unchanged");
	});
});
