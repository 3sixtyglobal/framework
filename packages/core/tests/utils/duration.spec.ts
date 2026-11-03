// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { TemporalDuration } from "./temporalDuration.js";
import { DurationFormatStyle } from "../../src/models/durationFormatStyle.js";
import { DurationRoundingMode } from "../../src/models/durationRoundingMode.js";
import { DurationUnit } from "../../src/models/durationUnit.js";
import type { IDuration } from "../../src/models/IDuration.js";
import { Duration as DurationImplementation } from "../../src/types/duration.js";

const implementations: {
	name: string;
	durationClass: typeof DurationImplementation;
	isTemporal: boolean;
}[] = [
	{ name: "Duration", durationClass: DurationImplementation, isTemporal: false },
	...(TemporalDuration.isAvailable()
		? [
				{
					name: "Temporal",
					durationClass: TemporalDuration as unknown as typeof DurationImplementation,
					isTemporal: true
				}
			]
		: [])
];

describe.each(implementations)(
	"$name",
	({ durationClass, isTemporal }: (typeof implementations)[number]) => {
		/**
		 * Temporal throws its own error types, so only check the error details for our implementation.
		 * @param matcher The matcher for our implementation.
		 * @returns The matcher to use.
		 */
		const errorLike = (matcher: unknown): unknown => (isTemporal ? Error : matcher);

		/**
		 * Tests for behaviour which intentionally differs from Temporal, only run for our implementation.
		 */
		const ownTest = isTemporal ? test.skip : test;

		const empty = {
			years: 0,
			months: 0,
			weeks: 0,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0
		};

		describe("parse", () => {
			test("returns undefined for an invalid string", () => {
				expect(durationClass.parse("foo")).toBeUndefined();
			});

			test("returns undefined for a bare P string", () => {
				expect(durationClass.parse("P")).toBeUndefined();
			});

			test("parses years", () => {
				expect(durationClass.parse("P1Y")).toEqual({
					years: 1,
					months: 0,
					weeks: 0,
					days: 0,
					hours: 0,
					minutes: 0,
					seconds: 0
				});
			});

			test("parses months", () => {
				expect(durationClass.parse("P2M")).toEqual({
					years: 0,
					months: 2,
					weeks: 0,
					days: 0,
					hours: 0,
					minutes: 0,
					seconds: 0
				});
			});

			test("parses weeks", () => {
				expect(durationClass.parse("P1W")).toEqual({
					years: 0,
					months: 0,
					weeks: 1,
					days: 0,
					hours: 0,
					minutes: 0,
					seconds: 0
				});
			});

			test("parses days", () => {
				expect(durationClass.parse("P3D")).toEqual({
					years: 0,
					months: 0,
					weeks: 0,
					days: 3,
					hours: 0,
					minutes: 0,
					seconds: 0
				});
			});

			test("parses hours", () => {
				expect(durationClass.parse("PT4H")).toEqual({
					years: 0,
					months: 0,
					weeks: 0,
					days: 0,
					hours: 4,
					minutes: 0,
					seconds: 0
				});
			});

			test("parses minutes", () => {
				expect(durationClass.parse("PT5M")).toEqual({
					years: 0,
					months: 0,
					weeks: 0,
					days: 0,
					hours: 0,
					minutes: 5,
					seconds: 0
				});
			});

			test("parses seconds", () => {
				expect(durationClass.parse("PT6S")).toEqual({
					years: 0,
					months: 0,
					weeks: 0,
					days: 0,
					hours: 0,
					minutes: 0,
					seconds: 6
				});
			});

			test("parses a full ISO 8601 duration string", () => {
				expect(durationClass.parse("P1Y2M3DT4H5M6S")).toEqual({
					years: 1,
					months: 2,
					weeks: 0,
					days: 3,
					hours: 4,
					minutes: 5,
					seconds: 6
				});
			});

			test("parses a negative duration with a minus prefix", () => {
				expect(durationClass.parse("-P1DT2H3M4S")).toEqual({
					years: 0,
					months: 0,
					weeks: 0,
					days: -1,
					hours: -2,
					minutes: -3,
					seconds: -4
				});
			});

			test("parses fractional seconds into sub-second fields", () => {
				expect(durationClass.parse("PT1.23456789S")).toEqual({
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
		});

		describe("toNumber", () => {
			test("returns 0 for an empty duration", () => {
				expect(durationClass.toNumber(empty, DurationUnit.Seconds)).toEqual(0);
			});

			// Temporal requires relativeTo for years, months and weeks, we use average lengths.
			ownTest("converts years to seconds", () => {
				expect(durationClass.toNumber({ ...empty, years: 1 }, DurationUnit.Seconds)).toEqual(
					31_557_600
				);
			});

			// Temporal requires relativeTo for years, months and weeks, we use average lengths.
			ownTest("converts months to seconds", () => {
				expect(durationClass.toNumber({ ...empty, months: 1 }, DurationUnit.Seconds)).toEqual(
					2_629_800
				);
			});

			// Temporal requires relativeTo for years, months and weeks, we use average lengths.
			ownTest("converts weeks to seconds", () => {
				expect(durationClass.toNumber({ ...empty, weeks: 1 }, DurationUnit.Seconds)).toEqual(
					604_800
				);
			});

			test("converts days to seconds", () => {
				expect(durationClass.toNumber({ ...empty, days: 1 }, DurationUnit.Seconds)).toEqual(86_400);
			});

			test("converts hours to seconds", () => {
				expect(durationClass.toNumber({ ...empty, hours: 1 }, DurationUnit.Seconds)).toEqual(3_600);
			});

			test("converts minutes to seconds", () => {
				expect(durationClass.toNumber({ ...empty, minutes: 1 }, DurationUnit.Seconds)).toEqual(60);
			});

			test("returns seconds unchanged", () => {
				expect(durationClass.toNumber({ ...empty, seconds: 42 }, DurationUnit.Seconds)).toEqual(42);
			});

			// Temporal requires relativeTo for years, months and weeks, we use average lengths.
			ownTest("sums all components", () => {
				const twoMonths = 2 * 2_629_800;
				const threeDays = 3 * 86_400;
				const fourHours = 4 * 3_600;
				const fiveMinutes = 5 * 60;
				expect(
					durationClass.toNumber(
						{
							years: 1,
							months: 2,
							weeks: 0,
							days: 3,
							hours: 4,
							minutes: 5,
							seconds: 6
						},
						DurationUnit.Seconds
					)
				).toEqual(31_557_600 + twoMonths + threeDays + fourHours + fiveMinutes + 6);
			});

			test("includes milliseconds, microseconds and nanoseconds", () => {
				expect(
					durationClass.toNumber(
						{
							...empty,
							seconds: 1,
							milliseconds: 250,
							microseconds: 500,
							nanoseconds: 250
						},
						DurationUnit.Seconds
					)
				).toEqual(1.25050025);
			});

			// Temporal requires relativeTo for years, months and weeks, we use average lengths.
			ownTest("converts to years", () => {
				expect(durationClass.toNumber({ ...empty, months: 6 }, DurationUnit.Years)).toEqual(0.5);
			});

			// Temporal requires relativeTo for years, months and weeks, we use average lengths.
			ownTest("converts to months", () => {
				expect(durationClass.toNumber({ ...empty, years: 1 }, DurationUnit.Months)).toEqual(12);
			});

			// Temporal requires relativeTo for years, months and weeks, we use average lengths.
			ownTest("converts to weeks", () => {
				expect(durationClass.toNumber({ ...empty, days: 14 }, DurationUnit.Weeks)).toEqual(2);
			});

			// Temporal requires relativeTo for years, months and weeks, we use average lengths.
			ownTest("converts to days", () => {
				expect(
					durationClass.toNumber({ ...empty, weeks: 1, hours: 12 }, DurationUnit.Days)
				).toEqual(7.5);
			});

			test("converts to hours", () => {
				expect(
					durationClass.toNumber({ ...empty, days: 1, minutes: 30 }, DurationUnit.Hours)
				).toEqual(24.5);
			});

			test("converts to minutes", () => {
				expect(
					durationClass.toNumber({ ...empty, hours: 1, seconds: 30 }, DurationUnit.Minutes)
				).toEqual(60.5);
			});

			test("converts to milliseconds", () => {
				expect(
					durationClass.toNumber(
						{ ...empty, seconds: 1, milliseconds: 250, microseconds: 500 },
						DurationUnit.Milliseconds
					)
				).toEqual(1_250.5);
			});

			test("converts to microseconds", () => {
				expect(
					durationClass.toNumber(
						{ ...empty, minutes: 1, microseconds: 5, nanoseconds: 250 },
						DurationUnit.Microseconds
					)
				).toEqual(60_000_005.25);
			});

			test("converts to nanoseconds", () => {
				expect(
					durationClass.toNumber(
						{
							...empty,
							seconds: 1,
							milliseconds: 250,
							microseconds: 500,
							nanoseconds: 250
						},
						DurationUnit.Nanoseconds
					)
				).toEqual(1_250_500_250);
			});

			test("converts at the maximum safe integer", () => {
				expect(
					durationClass.toNumber(
						{ ...empty, nanoseconds: Number.MAX_SAFE_INTEGER },
						DurationUnit.Nanoseconds
					)
				).toEqual(Number.MAX_SAFE_INTEGER);
			});

			test("throws when the value exceeds the maximum safe integer", () => {
				expect(() =>
					durationClass.toNumber({ ...empty, years: 1_000_000 }, DurationUnit.Milliseconds)
				).toThrow(
					errorLike(
						expect.objectContaining({
							name: "GeneralError",
							message: "duration.valueTooLarge",
							properties: {
								value: "31557600000000000",
								units: "milliseconds"
							}
						})
					)
				);
			});

			// Temporal loses precision beyond the safe integer range, we throw instead.
			ownTest("throws when the value is below the minimum safe integer", () => {
				expect(() =>
					durationClass.toNumber({ ...empty, days: -105 }, DurationUnit.Nanoseconds)
				).toThrow(
					errorLike(
						expect.objectContaining({
							name: "GeneralError",
							message: "duration.valueTooLarge"
						})
					)
				);
			});

			test("throws for an invalid unit", () => {
				expect(() => durationClass.toNumber(empty, "foo" as DurationUnit)).toThrow();
			});
			test("converts a negative value with a fraction", () => {
				expect(
					durationClass.toNumber(
						{ ...empty, seconds: -1, milliseconds: -500 },
						DurationUnit.Seconds
					)
				).toEqual(-1.5);
			});

			// Temporal requires integer components, we support fractional components.
			ownTest("converts fractional components", () => {
				expect(durationClass.toNumber({ ...empty, hours: 1.5 }, DurationUnit.Minutes)).toEqual(90);
			});

			test("throws for a component which is not a number", () => {
				expect(() =>
					durationClass.toNumber({ ...empty, hours: Number.NaN }, DurationUnit.Seconds)
				).toThrow(
					errorLike(
						expect.objectContaining({
							name: "GuardError",
							message: "guard.number",
							properties: { property: "duration.hours", value: Number.NaN }
						})
					)
				);
				expect(() =>
					durationClass.toNumber(
						{ ...empty, milliseconds: Number.POSITIVE_INFINITY },
						DurationUnit.Seconds
					)
				).toThrow(
					errorLike(expect.objectContaining({ name: "GuardError", message: "guard.number" }))
				);
			});

			test("throws for an invalid duration", () => {
				expect(() =>
					durationClass.toNumber(undefined as unknown as IDuration, DurationUnit.Seconds)
				).toThrow(
					errorLike(
						expect.objectContaining({ name: "GuardError", message: "guard.objectUndefined" })
					)
				);
			});
			// Temporal loses precision beyond the safe integer range, we throw instead.
			ownTest.each([
				[DurationUnit.Milliseconds, { ...empty, years: 285_420 }, { ...empty, years: 285_421 }],
				[DurationUnit.Microseconds, { ...empty, years: 285 }, { ...empty, years: 286 }],
				[DurationUnit.Nanoseconds, { ...empty, days: 104 }, { ...empty, days: 105 }],
				[DurationUnit.Seconds, { ...empty, years: 285_420_000 }, { ...empty, years: 285_421_000 }]
			])("converts to %s up to the maximum safe integer", (units, below, above) => {
				expect(Number.isSafeInteger(durationClass.toNumber(below, units))).toEqual(true);
				expect(() => durationClass.toNumber(above, units)).toThrow(
					errorLike(
						expect.objectContaining({ name: "GeneralError", message: "duration.valueTooLarge" })
					)
				);
			});

			// Temporal loses precision beyond the safe integer range, we throw instead.
			ownTest("throws one past the maximum safe integer", () => {
				expect(() =>
					durationClass.toNumber(
						{ ...empty, nanoseconds: Number.MAX_SAFE_INTEGER + 1 },
						DurationUnit.Nanoseconds
					)
				).toThrow(
					errorLike(
						expect.objectContaining({
							name: "GeneralError",
							message: "duration.valueTooLarge",
							properties: { value: "9007199254740992", units: "nanoseconds" }
						})
					)
				);
			});

			// Temporal loses precision beyond the safe integer range, we throw instead.
			ownTest("converts at and throws past the minimum safe integer", () => {
				expect(
					durationClass.toNumber(
						{ ...empty, nanoseconds: Number.MIN_SAFE_INTEGER },
						DurationUnit.Nanoseconds
					)
				).toEqual(Number.MIN_SAFE_INTEGER);
				expect(() =>
					durationClass.toNumber(
						{ ...empty, nanoseconds: Number.MIN_SAFE_INTEGER - 1 },
						DurationUnit.Nanoseconds
					)
				).toThrow(
					errorLike(
						expect.objectContaining({
							name: "GeneralError",
							message: "duration.valueTooLarge",
							properties: { value: "-9007199254740992", units: "nanoseconds" }
						})
					)
				);
			});

			test("throws for the maximum number value", () => {
				expect(() =>
					durationClass.toNumber({ ...empty, years: Number.MAX_VALUE }, DurationUnit.Years)
				).toThrow(
					errorLike(
						expect.objectContaining({ name: "GeneralError", message: "duration.valueTooLarge" })
					)
				);
			});
		});

		describe("toBigInt", () => {
			test("returns 0n for an empty duration", () => {
				expect(durationClass.toBigInt(empty, DurationUnit.Nanoseconds)).toEqual(0n);
			});

			// Temporal requires relativeTo for years, months and weeks, we use average lengths.
			ownTest("converts to years", () => {
				expect(durationClass.toBigInt({ ...empty, months: 24 }, DurationUnit.Years)).toEqual(2n);
			});

			test("converts to seconds", () => {
				expect(
					durationClass.toBigInt({ ...empty, hours: 1, seconds: 5 }, DurationUnit.Seconds)
				).toEqual(3_605n);
			});

			test("truncates to whole units", () => {
				expect(
					durationClass.toBigInt(
						{ ...empty, seconds: 1, milliseconds: 250, microseconds: 999 },
						DurationUnit.Milliseconds
					)
				).toEqual(1_250n);
			});

			test("converts to nanoseconds", () => {
				expect(
					durationClass.toBigInt(
						{
							...empty,
							seconds: 1,
							milliseconds: 250,
							microseconds: 500,
							nanoseconds: 250
						},
						DurationUnit.Nanoseconds
					)
				).toEqual(1_250_500_250n);
			});

			// Temporal requires relativeTo for years, months and weeks, we use average lengths.
			ownTest("keeps precision beyond the safe integer range", () => {
				expect(
					durationClass.toBigInt(
						{ ...empty, years: 1_000_000, milliseconds: 1 },
						DurationUnit.Milliseconds
					)
				).toEqual(31_557_600_000_000_001n);
			});

			// Temporal requires integer components, we support fractional components.
			ownTest("converts fractional components to nanoseconds", () => {
				expect(
					durationClass.toBigInt({ ...empty, seconds: 1.5 }, DurationUnit.Nanoseconds)
				).toEqual(1_500_000_000n);
			});

			test("truncates negative values towards zero", () => {
				expect(
					durationClass.toBigInt(
						{ ...empty, seconds: -1, milliseconds: -250, microseconds: -999 },
						DurationUnit.Milliseconds
					)
				).toEqual(-1_250n);
			});

			test("throws for an invalid unit", () => {
				expect(() => durationClass.toBigInt(empty, "foo" as DurationUnit)).toThrow();
			});
			// Temporal requires integer components, we support fractional components.
			ownTest("converts fractional components", () => {
				expect(durationClass.toBigInt({ ...empty, hours: 1.5 }, DurationUnit.Minutes)).toEqual(90n);
			});

			test("throws for a component which is not a number", () => {
				expect(() =>
					durationClass.toBigInt({ ...empty, days: Number.NaN }, DurationUnit.Seconds)
				).toThrow(
					errorLike(
						expect.objectContaining({
							name: "GuardError",
							message: "guard.number",
							properties: { property: "duration.days", value: Number.NaN }
						})
					)
				);
			});

			test("throws for an invalid duration", () => {
				expect(() =>
					durationClass.toBigInt(undefined as unknown as IDuration, DurationUnit.Seconds)
				).toThrow(
					errorLike(
						expect.objectContaining({ name: "GuardError", message: "guard.objectUndefined" })
					)
				);
			});
			// Temporal limits durations to less than 2^53 seconds, we support larger durations.
			ownTest("converts the maximum number value without overflow", () => {
				expect(
					durationClass.toBigInt({ ...empty, years: Number.MAX_VALUE }, DurationUnit.Nanoseconds)
				).toEqual(BigInt(Number.MAX_VALUE) * 31_557_600_000_000_000n);
			});

			// Temporal requires integer components, we support fractional components.
			ownTest("keeps the whole part of a large fractional component exact", () => {
				expect(
					durationClass.toBigInt({ ...empty, years: 1_000_000.5 }, DurationUnit.Nanoseconds)
				).toEqual(31_557_615_778_800_000_000_000n);
			});

			// Temporal limits durations to less than 2^53 seconds, we support larger durations.
			ownTest("sums components beyond the safe integer range exactly", () => {
				expect(
					durationClass.toBigInt(
						{ ...empty, seconds: Number.MAX_SAFE_INTEGER, nanoseconds: Number.MAX_SAFE_INTEGER },
						DurationUnit.Nanoseconds
					)
				).toEqual(9_007_199_263_748_190_254_740_991n);
			});
		});

		describe("from", () => {
			test("creates a duration from a value in seconds", () => {
				expect(durationClass.from(90, DurationUnit.Seconds)).toEqual({ ...empty, seconds: 90 });
			});

			// Temporal requires integer components, we support fractional components.
			ownTest("balances a fractional value into smaller units", () => {
				expect(durationClass.from(1.5, DurationUnit.Hours)).toEqual({
					...empty,
					hours: 1,
					minutes: 30
				});
			});

			test("creates a duration from a bigint value", () => {
				expect(durationClass.from(1_500_000_001n, DurationUnit.Nanoseconds)).toEqual({
					...empty,
					nanoseconds: 1_500_000_001
				});
			});

			// Temporal requires integer components, we support fractional components.
			ownTest("creates a negative duration", () => {
				expect(durationClass.from(-1.25, DurationUnit.Seconds)).toEqual({
					...empty,
					seconds: -1,
					milliseconds: -250
				});
			});

			// Temporal requires integer components, we support fractional components.
			ownTest("roundtrips through toNumber", () => {
				expect(
					durationClass.toNumber(durationClass.from(12.345, DurationUnit.Days), DurationUnit.Days)
				).toEqual(12.345);
			});

			// Temporal coerces non-number values, we reject them.
			ownTest("throws for an invalid value", () => {
				expect(() => durationClass.from("1" as unknown as number, DurationUnit.Seconds)).toThrow();
			});

			test("throws for an invalid unit", () => {
				expect(() => durationClass.from(1, "foo" as DurationUnit)).toThrow();
			});
			// Temporal requires relativeTo for years, months and weeks, we use average lengths.
			ownTest("creates a duration from a bigint value in a large unit", () => {
				expect(durationClass.from(2n, DurationUnit.Years)).toEqual({ ...empty, years: 2 });
			});

			// Temporal requires integer components, we support fractional components.
			ownTest("balances a fractional value into sub-second units", () => {
				expect(durationClass.from(1.5, DurationUnit.Milliseconds)).toEqual({
					...empty,
					milliseconds: 1,
					microseconds: 500
				});
			});

			test("creates an empty duration from zero", () => {
				expect(durationClass.from(0, DurationUnit.Hours)).toEqual(empty);
			});

			// Temporal requires integer components, we support fractional components.
			ownTest("rounds values smaller than a nanosecond", () => {
				expect(durationClass.from(1e-10, DurationUnit.Seconds)).toEqual(empty);
			});

			test("throws for values which are not finite", () => {
				expect(() => durationClass.from(Number.NaN, DurationUnit.Seconds)).toThrow(
					errorLike(expect.objectContaining({ name: "GuardError", message: "guard.number" }))
				);
				expect(() => durationClass.from(Number.POSITIVE_INFINITY, DurationUnit.Seconds)).toThrow(
					errorLike(expect.objectContaining({ name: "GuardError", message: "guard.number" }))
				);
			});
			test("creates a duration at the maximum safe integer", () => {
				expect(
					durationClass.from(BigInt(Number.MAX_SAFE_INTEGER), DurationUnit.Nanoseconds)
				).toEqual({
					...empty,
					nanoseconds: Number.MAX_SAFE_INTEGER
				});
			});

			// Temporal loses precision beyond the safe integer range, we throw instead.
			ownTest("throws when a component would exceed the maximum safe integer", () => {
				expect(() =>
					durationClass.from(BigInt(Number.MAX_SAFE_INTEGER) + 1n, DurationUnit.Nanoseconds)
				).toThrow(
					errorLike(
						expect.objectContaining({
							name: "GeneralError",
							message: "duration.valueTooLarge",
							properties: { value: "9007199254740992", units: "nanoseconds" }
						})
					)
				);
				expect(() => durationClass.from(-(10n ** 400n), DurationUnit.Seconds)).toThrow(
					errorLike(
						expect.objectContaining({ name: "GeneralError", message: "duration.valueTooLarge" })
					)
				);
				expect(() => durationClass.from(Number.MAX_VALUE, DurationUnit.Years)).toThrow(
					errorLike(
						expect.objectContaining({ name: "GeneralError", message: "duration.valueTooLarge" })
					)
				);
			});
		});

		describe("compare", () => {
			test("returns 0 for equal durations with different components", () => {
				expect(
					durationClass.compare({ ...empty, hours: 1, minutes: 30 }, { ...empty, minutes: 90 })
				).toEqual(0);
			});

			test("returns -1 when the first duration is shorter", () => {
				expect(durationClass.compare({ ...empty, seconds: 59 }, { ...empty, minutes: 1 })).toEqual(
					-1
				);
			});

			test("returns 1 when the first duration is longer", () => {
				expect(
					durationClass.compare({ ...empty, seconds: 1, nanoseconds: 1 }, { ...empty, seconds: 1 })
				).toEqual(1);
			});

			test("compares negative durations", () => {
				expect(durationClass.compare({ ...empty, days: -2 }, { ...empty, days: -1 })).toEqual(-1);
			});

			test("sorts durations", () => {
				const durations = [
					{ ...empty, hours: 1 },
					{ ...empty, seconds: 1 },
					{ ...empty, minutes: 1 }
				];
				expect(durations.sort(durationClass.compare)).toEqual([
					{ ...empty, seconds: 1 },
					{ ...empty, minutes: 1 },
					{ ...empty, hours: 1 }
				]);
			});
			test("throws for an invalid first duration", () => {
				expect(() => durationClass.compare(undefined as unknown as IDuration, empty)).toThrow(
					errorLike(
						expect.objectContaining({ name: "GuardError", message: "guard.objectUndefined" })
					)
				);
			});

			test("throws for an invalid second duration", () => {
				expect(() => durationClass.compare(empty, undefined as unknown as IDuration)).toThrow(
					errorLike(
						expect.objectContaining({ name: "GuardError", message: "guard.objectUndefined" })
					)
				);
			});

			test("throws for a component which is not a number", () => {
				expect(() => durationClass.compare(empty, { ...empty, seconds: Number.NaN })).toThrow(
					errorLike(expect.objectContaining({ name: "GuardError", message: "guard.number" }))
				);
			});
			// Temporal requires relativeTo for years, months and weeks, we use average lengths.
			ownTest("compares durations beyond the safe integer range exactly", () => {
				expect(
					durationClass.compare(
						{ ...empty, years: 1_000, nanoseconds: 1 },
						{ ...empty, years: 1_000 }
					)
				).toEqual(1);
				expect(
					durationClass.compare(
						{ ...empty, years: Number.MAX_VALUE },
						{ ...empty, years: Number.MAX_VALUE }
					)
				).toEqual(0);
			});
		});

		describe("round", () => {
			test("balances to the largest non-zero unit by default", () => {
				expect(durationClass.round({ ...empty, minutes: 90, seconds: 3_600 })).toEqual({
					...empty,
					minutes: 150
				});
			});

			test("balances into a larger unit", () => {
				expect(
					durationClass.round({ ...empty, minutes: 90 }, { largestUnit: DurationUnit.Hours })
				).toEqual({ ...empty, hours: 1, minutes: 30 });
			});

			test("rounds to the smallest unit using half expand by default", () => {
				expect(
					durationClass.round(
						{ ...empty, minutes: 1, seconds: 30 },
						{ smallestUnit: DurationUnit.Minutes }
					)
				).toEqual({ ...empty, minutes: 2 });
			});

			test("removes components smaller than the smallest unit", () => {
				expect(
					durationClass.round(
						{ ...empty, seconds: 1, milliseconds: 499, nanoseconds: 1 },
						{ smallestUnit: DurationUnit.Seconds }
					)
				).toEqual({ ...empty, seconds: 1 });
			});

			test("balances from seconds to days", () => {
				expect(
					durationClass.round({ ...empty, seconds: 90_061 }, { largestUnit: DurationUnit.Days })
				).toEqual({ ...empty, days: 1, hours: 1, minutes: 1, seconds: 1 });
			});

			// Temporal requires relativeTo for years, months and weeks, we use average lengths.
			ownTest("only includes weeks when requested", () => {
				expect(
					durationClass.round({ ...empty, days: 15 }, { largestUnit: DurationUnit.Months })
				).toEqual({
					...empty,
					days: 15
				});
				expect(
					durationClass.round({ ...empty, days: 15 }, { largestUnit: DurationUnit.Weeks })
				).toEqual({
					...empty,
					weeks: 2,
					days: 1
				});
			});

			test.each([
				[DurationRoundingMode.Ceil, 16, 16, -15, -15],
				[DurationRoundingMode.Floor, 15, 15, -16, -16],
				[DurationRoundingMode.Expand, 16, 16, -16, -16],
				[DurationRoundingMode.Trunc, 15, 15, -15, -15],
				[DurationRoundingMode.HalfCeil, 16, 16, -15, -16],
				[DurationRoundingMode.HalfFloor, 15, 16, -16, -16],
				[DurationRoundingMode.HalfExpand, 16, 16, -16, -16],
				[DurationRoundingMode.HalfTrunc, 15, 16, -15, -16],
				[DurationRoundingMode.HalfEven, 16, 16, -16, -16]
			])(
				"rounds with %s",
				(roundingMode, positiveHalf, positiveAboveHalf, negativeHalf, negativeAboveHalf) => {
					const roundSeconds = (seconds: number, milliseconds: number): number =>
						durationClass.round(
							{ ...empty, seconds, milliseconds },
							{ smallestUnit: DurationUnit.Seconds, roundingMode }
						).seconds;
					expect(roundSeconds(15, 500)).toEqual(positiveHalf);
					expect(roundSeconds(15, 501)).toEqual(positiveAboveHalf);
					expect(roundSeconds(-15, -500)).toEqual(negativeHalf);
					expect(roundSeconds(-15, -501)).toEqual(negativeAboveHalf);
				}
			);

			test("rounds half even towards the even value", () => {
				expect(
					durationClass.round(
						{ ...empty, seconds: 14, milliseconds: 500 },
						{ smallestUnit: DurationUnit.Seconds, roundingMode: DurationRoundingMode.HalfEven }
					).seconds
				).toEqual(14);
			});

			test("does not change an already rounded duration", () => {
				expect(
					durationClass.round({ ...empty, hours: 2 }, { smallestUnit: DurationUnit.Hours })
				).toEqual({
					...empty,
					hours: 2
				});
			});

			test("throws when the largest unit is smaller than the smallest unit", () => {
				expect(() =>
					durationClass.round(empty, {
						largestUnit: DurationUnit.Minutes,
						smallestUnit: DurationUnit.Hours
					})
				).toThrow(
					errorLike(
						expect.objectContaining({
							name: "GeneralError",
							message: "duration.largestUnitTooSmall",
							properties: { largestUnit: "minutes", smallestUnit: "hours" }
						})
					)
				);
			});

			test("throws for an invalid rounding mode", () => {
				expect(() =>
					durationClass.round(empty, { roundingMode: "foo" as DurationRoundingMode })
				).toThrow();
			});
			test("balances a negative duration", () => {
				expect(
					durationClass.round({ ...empty, minutes: -90 }, { largestUnit: DurationUnit.Hours })
				).toEqual({ ...empty, hours: -1, minutes: -30 });
			});

			test("returns an empty duration for a zero duration", () => {
				expect(durationClass.round(empty)).toEqual(empty);
			});

			// Temporal requires relativeTo for years, months and weeks, we use average lengths.
			ownTest("rounds to weeks", () => {
				expect(
					durationClass.round({ ...empty, days: 10 }, { smallestUnit: DurationUnit.Weeks })
				).toEqual({
					...empty,
					weeks: 1
				});
			});

			test("rounds to milliseconds", () => {
				expect(
					durationClass.round(
						{ ...empty, seconds: 1, microseconds: 1_500 },
						{ smallestUnit: DurationUnit.Milliseconds }
					)
				).toEqual({ ...empty, seconds: 1, milliseconds: 2 });
			});

			// Temporal requires relativeTo for years, months and weeks, we use average lengths.
			ownTest("balances into months and years using average lengths", () => {
				expect(
					durationClass.round({ ...empty, days: 31 }, { largestUnit: DurationUnit.Years })
				).toEqual({
					...empty,
					months: 1,
					hours: 13,
					minutes: 30
				});
				expect(
					durationClass.round({ ...empty, months: 12 }, { largestUnit: DurationUnit.Years })
				).toEqual({ ...empty, years: 1 });
			});

			test("roundtrips through parse and toString", () => {
				const parsed = durationClass.parse("PT90M");
				expect(parsed).toBeDefined();
				if (parsed) {
					expect(
						durationClass.toString(durationClass.round(parsed, { largestUnit: DurationUnit.Hours }))
					).toEqual("PT1H30M");
				}
			});

			test("throws for an invalid largest unit", () => {
				expect(() => durationClass.round(empty, { largestUnit: "foo" as DurationUnit })).toThrow(
					errorLike(expect.objectContaining({ name: "GuardError", message: "guard.arrayOneOf" }))
				);
			});

			test("throws for an invalid smallest unit", () => {
				expect(() => durationClass.round(empty, { smallestUnit: "foo" as DurationUnit })).toThrow(
					errorLike(expect.objectContaining({ name: "GuardError", message: "guard.arrayOneOf" }))
				);
			});

			test("throws for a component which is not a number", () => {
				expect(() => durationClass.round({ ...empty, minutes: Number.NaN })).toThrow(
					errorLike(expect.objectContaining({ name: "GuardError", message: "guard.number" }))
				);
			});
			test("throws when a component of the result exceeds the maximum safe integer", () => {
				expect(() =>
					durationClass.round({ ...empty, years: 1 }, { largestUnit: DurationUnit.Nanoseconds })
				).toThrow(
					errorLike(
						expect.objectContaining({
							name: "GeneralError",
							message: "duration.valueTooLarge",
							properties: { value: "31557600000000000", units: "nanoseconds" }
						})
					)
				);
				expect(() => durationClass.round({ ...empty, years: Number.MAX_VALUE })).toThrow(
					errorLike(
						expect.objectContaining({ name: "GeneralError", message: "duration.valueTooLarge" })
					)
				);
			});

			test("balances a large duration into larger units without overflow", () => {
				expect(
					durationClass.round(
						{ ...empty, nanoseconds: Number.MAX_SAFE_INTEGER },
						{ largestUnit: DurationUnit.Days }
					)
				).toEqual({
					...empty,
					days: 104,
					hours: 5,
					minutes: 59,
					seconds: 59,
					milliseconds: 254,
					microseconds: 740,
					nanoseconds: 991
				});
			});
		});

		describe("addToDate", () => {
			test("adds time components", () => {
				expect(
					durationClass
						.addToDate(new Date("2026-01-01T00:00:00.000Z"), {
							...empty,
							days: 1,
							hours: 2,
							minutes: 3,
							seconds: 4,
							milliseconds: 5
						})
						.toISOString()
				).toEqual("2026-01-02T02:03:04.005Z");
			});

			test("adds years and months", () => {
				expect(
					durationClass
						.addToDate(new Date("2026-01-15T10:00:00.000Z"), {
							...empty,
							years: 1,
							months: 2
						})
						.toISOString()
				).toEqual("2027-03-15T10:00:00.000Z");
			});

			test("clamps the day to the end of the month", () => {
				expect(
					durationClass
						.addToDate(new Date("2026-01-31T00:00:00.000Z"), {
							...empty,
							months: 1
						})
						.toISOString()
				).toEqual("2026-02-28T00:00:00.000Z");
				expect(
					durationClass
						.addToDate(new Date("2028-01-31T00:00:00.000Z"), {
							...empty,
							months: 1
						})
						.toISOString()
				).toEqual("2028-02-29T00:00:00.000Z");
			});

			test("rolls months over into years", () => {
				expect(
					durationClass
						.addToDate(new Date("2026-11-30T00:00:00.000Z"), {
							...empty,
							months: 3
						})
						.toISOString()
				).toEqual("2027-02-28T00:00:00.000Z");
			});

			test("subtracts a negative duration", () => {
				expect(
					durationClass
						.addToDate(new Date("2026-03-31T12:00:00.000Z"), {
							...empty,
							months: -1,
							weeks: -1,
							hours: -12
						})
						.toISOString()
				).toEqual("2026-02-21T00:00:00.000Z");
			});

			test("truncates sub-millisecond components", () => {
				expect(
					durationClass
						.addToDate(new Date("2026-01-01T00:00:00.000Z"), {
							...empty,
							milliseconds: 1,
							microseconds: 999
						})
						.toISOString()
				).toEqual("2026-01-01T00:00:00.001Z");
			});

			test("does not modify the original date", () => {
				const date = new Date("2026-01-01T00:00:00.000Z");
				durationClass.addToDate(date, { ...empty, years: 1, days: 1 });
				expect(date.toISOString()).toEqual("2026-01-01T00:00:00.000Z");
			});

			test("throws for fractional years or months", () => {
				expect(() => durationClass.addToDate(new Date(), { ...empty, months: 1.5 })).toThrow();
			});

			test("throws for an invalid date", () => {
				expect(() => durationClass.addToDate("2026-01-01" as unknown as Date, empty)).toThrow();
			});
			test("clamps a leap day when adding a year", () => {
				expect(
					durationClass
						.addToDate(new Date("2028-02-29T00:00:00.000Z"), {
							...empty,
							years: 1
						})
						.toISOString()
				).toEqual("2029-02-28T00:00:00.000Z");
			});

			test("subtracts months across a year boundary", () => {
				expect(
					durationClass
						.addToDate(new Date("2026-01-31T00:00:00.000Z"), {
							...empty,
							months: -2
						})
						.toISOString()
				).toEqual("2025-11-30T00:00:00.000Z");
			});

			// Temporal requires integer components, we support fractional components.
			ownTest("adds fractional days as exact time", () => {
				expect(
					durationClass
						.addToDate(new Date("2026-01-01T00:00:00.000Z"), {
							...empty,
							days: 1.5
						})
						.toISOString()
				).toEqual("2026-01-02T12:00:00.000Z");
			});

			test("keeps years before 100 in the correct century", () => {
				const date = new Date(0);
				date.setUTCFullYear(50, 0, 31);
				const result = durationClass.addToDate(date, { ...empty, months: 1 });
				expect(result.getUTCFullYear()).toEqual(50);
				expect(result.getUTCMonth()).toEqual(1);
				expect(result.getUTCDate()).toEqual(28);
			});

			test("throws when the result is outside the supported date range", () => {
				expect(() => durationClass.addToDate(new Date(8.64e15), { ...empty, days: 1 })).toThrow(
					errorLike(
						expect.objectContaining({
							name: "GeneralError",
							message: "duration.dateOutOfRange",
							properties: { date: "+275760-09-13T00:00:00.000Z", duration: "P1D" }
						})
					)
				);
				expect(() => durationClass.addToDate(new Date(-8.64e15), { ...empty, years: -1 })).toThrow(
					errorLike(
						expect.objectContaining({ name: "GeneralError", message: "duration.dateOutOfRange" })
					)
				);
			});

			test("throws for a component which is not a number", () => {
				expect(() => durationClass.addToDate(new Date(), { ...empty, hours: Number.NaN })).toThrow(
					errorLike(expect.objectContaining({ name: "GuardError", message: "guard.number" }))
				);
			});

			test("throws for an invalid duration", () => {
				expect(() =>
					durationClass.addToDate(new Date(), undefined as unknown as IDuration)
				).toThrow(
					errorLike(
						expect.objectContaining({ name: "GuardError", message: "guard.objectUndefined" })
					)
				);
			});
			test("adds up to the maximum date", () => {
				expect(
					durationClass.addToDate(new Date(-8.64e15), { ...empty, days: 200_000_000 }).getTime()
				).toEqual(8.64e15);
				expect(
					durationClass.addToDate(new Date(8.64e15), { ...empty, days: -200_000_000 }).getTime()
				).toEqual(-8.64e15);
			});

			// Temporal limits durations to less than 2^53 seconds, we support larger durations.
			ownTest("adds an offset beyond the safe integer range exactly", () => {
				expect(
					durationClass
						.addToDate(new Date(-8.64e15), {
							...empty,
							days: 200_000_000,
							milliseconds: -1
						})
						.getTime()
				).toEqual(8.64e15 - 1);
			});

			test("throws one millisecond past the maximum date", () => {
				expect(() =>
					durationClass.addToDate(new Date(8.64e15 - 1), { ...empty, milliseconds: 2 })
				).toThrow(
					errorLike(
						expect.objectContaining({ name: "GeneralError", message: "duration.dateOutOfRange" })
					)
				);
			});

			test("throws for large calendar intervals", () => {
				expect(() => durationClass.addToDate(new Date(0), { ...empty, years: 300_000 })).toThrow(
					errorLike(
						expect.objectContaining({ name: "GeneralError", message: "duration.dateOutOfRange" })
					)
				);
				expect(() =>
					durationClass.addToDate(new Date(0), { ...empty, months: -3_300_000 })
				).toThrow(
					errorLike(
						expect.objectContaining({ name: "GeneralError", message: "duration.dateOutOfRange" })
					)
				);
				expect(() => durationClass.addToDate(new Date(0), { ...empty, years: 1e20 })).toThrow(
					errorLike(
						expect.objectContaining({ name: "GeneralError", message: "duration.dateOutOfRange" })
					)
				);
			});

			test("throws for large time intervals", () => {
				expect(() => durationClass.addToDate(new Date(0), { ...empty, days: 1e300 })).toThrow(
					errorLike(
						expect.objectContaining({ name: "GeneralError", message: "duration.dateOutOfRange" })
					)
				);
				expect(() =>
					durationClass.addToDate(new Date(0), { ...empty, nanoseconds: Number.MAX_VALUE })
				).toThrow(
					errorLike(
						expect.objectContaining({ name: "GeneralError", message: "duration.dateOutOfRange" })
					)
				);
			});

			test("throws when a calendar interval leaves the range before the time brings it back", () => {
				expect(() =>
					durationClass.addToDate(new Date(8.64e15), { ...empty, years: 1, days: -400 })
				).toThrow(
					errorLike(
						expect.objectContaining({ name: "GeneralError", message: "duration.dateOutOfRange" })
					)
				);
			});
		});

		describe("toString", () => {
			test("returns PT0S for a zero duration", () => {
				expect(
					durationClass.toString({
						years: 0,
						months: 0,
						weeks: 0,
						days: 0,
						hours: 0,
						minutes: 0,
						seconds: 0
					})
				).toEqual("PT0S");
			});

			test("formats years only", () => {
				expect(
					durationClass.toString({
						years: 1,
						months: 0,
						weeks: 0,
						days: 0,
						hours: 0,
						minutes: 0,
						seconds: 0
					})
				).toEqual("P1Y");
			});

			test("formats months only", () => {
				expect(
					durationClass.toString({
						years: 0,
						months: 2,
						weeks: 0,
						days: 0,
						hours: 0,
						minutes: 0,
						seconds: 0
					})
				).toEqual("P2M");
			});

			test("formats weeks only", () => {
				expect(
					durationClass.toString({
						years: 0,
						months: 0,
						weeks: 1,
						days: 0,
						hours: 0,
						minutes: 0,
						seconds: 0
					})
				).toEqual("P1W");
			});

			test("formats days only", () => {
				expect(
					durationClass.toString({
						years: 0,
						months: 0,
						weeks: 0,
						days: 3,
						hours: 0,
						minutes: 0,
						seconds: 0
					})
				).toEqual("P3D");
			});

			test("formats hours only", () => {
				expect(
					durationClass.toString({
						years: 0,
						months: 0,
						weeks: 0,
						days: 0,
						hours: 4,
						minutes: 0,
						seconds: 0
					})
				).toEqual("PT4H");
			});

			test("formats minutes only", () => {
				expect(
					durationClass.toString({
						years: 0,
						months: 0,
						weeks: 0,
						days: 0,
						hours: 0,
						minutes: 5,
						seconds: 0
					})
				).toEqual("PT5M");
			});

			test("formats seconds only", () => {
				expect(
					durationClass.toString({
						years: 0,
						months: 0,
						weeks: 0,
						days: 0,
						hours: 0,
						minutes: 0,
						seconds: 6
					})
				).toEqual("PT6S");
			});

			test("formats date components without T separator", () => {
				expect(
					durationClass.toString({
						years: 1,
						months: 2,
						weeks: 0,
						days: 3,
						hours: 0,
						minutes: 0,
						seconds: 0
					})
				).toEqual("P1Y2M3D");
			});

			test("formats time components with T separator", () => {
				expect(
					durationClass.toString({
						years: 0,
						months: 0,
						weeks: 0,
						days: 0,
						hours: 4,
						minutes: 5,
						seconds: 6
					})
				).toEqual("PT4H5M6S");
			});

			test("formats a full duration", () => {
				expect(
					durationClass.toString({
						years: 1,
						months: 2,
						weeks: 0,
						days: 3,
						hours: 4,
						minutes: 5,
						seconds: 6
					})
				).toEqual("P1Y2M3DT4H5M6S");
			});

			test("roundtrips through parse", () => {
				const original = "P1Y2M3DT4H5M6S";
				const parsed = durationClass.parse(original);
				if (parsed === undefined) {
					throw new Error("Expected parse to succeed");
				}
				expect(durationClass.toString(parsed)).toEqual(original);
			});

			test("formats milliseconds, microseconds and nanoseconds as fractional seconds", () => {
				expect(
					durationClass.toString({
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
					})
				).toEqual("PT1.23456789S");
			});

			test("formats negative values with a minus prefix", () => {
				expect(
					durationClass.toString({
						years: 0,
						months: 0,
						weeks: 0,
						days: -1,
						hours: -2,
						minutes: -3,
						seconds: -4
					})
				).toEqual("-P1DT2H3M4S");
			});
		});

		describe("toLocaleString", () => {
			test("formats using the short style by default", () => {
				expect(
					durationClass.toLocaleString({ ...empty, hours: 1, minutes: 30 }, undefined, "en")
				).toEqual("1 hr, 30 min");
			});

			test("formats using the long style", () => {
				expect(
					durationClass.toLocaleString(
						{ ...empty, years: 1, days: 2, seconds: 3 },
						DurationFormatStyle.Long,
						"en"
					)
				).toEqual("1 year, 2 days, 3 seconds");
			});

			test("formats using the narrow style", () => {
				expect(
					durationClass.toLocaleString(
						{ ...empty, hours: 1, minutes: 30 },
						DurationFormatStyle.Narrow,
						"en"
					)
				).toEqual("1h 30m");
			});

			test("formats using the digital style", () => {
				expect(
					durationClass.toLocaleString(
						{ ...empty, hours: 1, minutes: 2, seconds: 3, milliseconds: 4 },
						DurationFormatStyle.Digital,
						"en"
					)
				).toEqual("1:02:03.004");
			});

			test("formats a negative duration", () => {
				expect(
					durationClass.toLocaleString(
						{ ...empty, hours: -1, minutes: -30 },
						DurationFormatStyle.Long,
						"en"
					)
				).toEqual("-1 hour, 30 minutes");
			});

			test.each([
				[DurationFormatStyle.Long, ""],
				[DurationFormatStyle.Short, ""],
				[DurationFormatStyle.Narrow, ""],
				[DurationFormatStyle.Digital, "0:00:00"]
			])("formats a zero duration using the %s style", (style, expected) => {
				expect(durationClass.toLocaleString(empty, style, "en")).toEqual(expected);
			});

			test("formats for another locale", () => {
				expect(
					durationClass.toLocaleString({ ...empty, days: 2 }, DurationFormatStyle.Long, "de")
				).toEqual("2 Tage");
			});

			test("formats for the current locale by default", () => {
				expect(
					durationClass.toLocaleString({ ...empty, days: 2 }, DurationFormatStyle.Long)
				).toEqual("2 days");
			});

			test("throws for an invalid style", () => {
				expect(() =>
					durationClass.toLocaleString(empty, "foo" as DurationFormatStyle, "en")
				).toThrow();
			});

			test("throws for fractional components", () => {
				expect(() =>
					durationClass.toLocaleString({ ...empty, hours: 1.5 }, undefined, "en")
				).toThrow(
					errorLike(
						expect.objectContaining({
							name: "GeneralError",
							message: "duration.invalidLocaleValue",
							properties: { unit: "hours", value: 1.5 }
						})
					)
				);
			});

			test("throws for mixed signs", () => {
				expect(() =>
					durationClass.toLocaleString({ ...empty, hours: 1, minutes: -30 }, undefined, "en")
				).toThrow(
					errorLike(
						expect.objectContaining({
							name: "GeneralError",
							message: "duration.invalidLocaleValue",
							properties: { unit: "minutes", value: -30 }
						})
					)
				);
			});

			test("formats weeks and years in the digital style", () => {
				expect(
					durationClass.toLocaleString(
						{ ...empty, years: 1, weeks: 2, hours: 3, minutes: 4, seconds: 5 },
						DurationFormatStyle.Digital,
						"en"
					)
				).toEqual("1 yr, 2 wks, 3:04:05");
			});

			test("throws for an invalid duration", () => {
				expect(() => durationClass.toLocaleString(undefined as unknown as IDuration)).toThrow(
					errorLike(
						expect.objectContaining({ name: "GuardError", message: "guard.objectUndefined" })
					)
				);
			});

			test("formats up to the Intl.DurationFormat limits", () => {
				expect(
					durationClass.toLocaleString(
						{ ...empty, years: 4_294_967_295 },
						DurationFormatStyle.Long,
						"en"
					)
				).toEqual("4,294,967,295 years");
				expect(
					durationClass.toLocaleString(
						{ ...empty, seconds: Number.MAX_SAFE_INTEGER },
						DurationFormatStyle.Long,
						"en"
					)
				).toEqual("9,007,199,254,740,991 seconds");
			});

			test.each([
				{ ...empty, years: 2 ** 32 },
				{ ...empty, months: -(2 ** 32) },
				{ ...empty, weeks: 2 ** 32 },
				{ ...empty, seconds: 2 ** 53 },
				{ ...empty, days: -104_249_991_375 },
				{ ...empty, seconds: Number.MAX_SAFE_INTEGER, milliseconds: 1_000 }
			])("throws past the Intl.DurationFormat limits for %o", duration => {
				expect(() =>
					durationClass.toLocaleString(duration, DurationFormatStyle.Long, "en")
				).toThrow(
					errorLike(
						expect.objectContaining({
							name: "GeneralError",
							message: "duration.localeValueTooLarge"
						})
					)
				);
			});

			describe.skipIf(isTemporal)("without Intl.DurationFormat", () => {
				const intl = Intl as unknown as { DurationFormat?: unknown };
				const durationFormat = intl.DurationFormat;

				afterEach(() => {
					intl.DurationFormat = durationFormat;
				});

				test.each([
					["en", DurationFormatStyle.Long, { ...empty, hours: 1, minutes: 30 }],
					["en", DurationFormatStyle.Short, { ...empty, hours: 1, minutes: 30 }],
					["en", DurationFormatStyle.Narrow, { ...empty, hours: 1, minutes: 30 }],
					[
						"en",
						DurationFormatStyle.Long,
						{
							years: 1,
							months: 2,
							weeks: 1,
							days: 2,
							hours: 3,
							minutes: 4,
							seconds: 5,
							milliseconds: 6,
							microseconds: 7,
							nanoseconds: 8
						}
					],
					["en", DurationFormatStyle.Short, { ...empty, days: -2, hours: -1 }],
					["en", DurationFormatStyle.Long, empty],
					["en", DurationFormatStyle.Short, empty],
					["en", DurationFormatStyle.Digital, { ...empty, hours: 1, minutes: 2, seconds: 3 }],
					["en", DurationFormatStyle.Digital, { ...empty, minutes: 5 }],
					[
						"en",
						DurationFormatStyle.Digital,
						{ ...empty, days: 2, hours: 1, minutes: 2, seconds: 3 }
					],
					["en", DurationFormatStyle.Digital, { ...empty, hours: -1, minutes: -2, seconds: -3 }],
					["en", DurationFormatStyle.Digital, { ...empty, days: -2, hours: -1 }],
					[
						"en",
						DurationFormatStyle.Digital,
						{ ...empty, hours: 1, minutes: 2, seconds: 3, milliseconds: 4 }
					],
					["en", DurationFormatStyle.Digital, empty],
					[
						"de",
						DurationFormatStyle.Digital,
						{ ...empty, seconds: 3, milliseconds: 4, microseconds: 5 }
					],
					["de", DurationFormatStyle.Long, { ...empty, days: 2, hours: 1 }],
					["fr", DurationFormatStyle.Short, { ...empty, hours: 1, minutes: 30 }],
					["ja", DurationFormatStyle.Narrow, { ...empty, hours: 1, minutes: 30 }],
					["fi", DurationFormatStyle.Digital, { ...empty, hours: 1, minutes: 2, seconds: 3 }],
					[
						"da",
						DurationFormatStyle.Digital,
						{ ...empty, minutes: 2, seconds: 3, milliseconds: 4 }
					],
					["id", DurationFormatStyle.Digital, { ...empty, days: 1, hours: 1, minutes: 2 }],
					["fa", DurationFormatStyle.Digital, { ...empty, hours: 1, minutes: 2, seconds: 3 }]
				])("matches Intl.DurationFormat for %s %s %o", (locale, style, duration) => {
					const expected = durationClass.toLocaleString(duration, style, locale);
					delete intl.DurationFormat;
					expect(durationClass.toLocaleString(duration, style, locale)).toEqual(expected);
				});

				test("formats for the current locale by default", () => {
					delete intl.DurationFormat;
					expect(
						durationClass.toLocaleString({ ...empty, days: 2 }, DurationFormatStyle.Long)
					).toEqual("2 days");
				});

				test("formats weeks and years in the digital style", () => {
					const duration = { ...empty, years: 1, weeks: 2, hours: 3, minutes: 4, seconds: 5 };
					const expected = durationClass.toLocaleString(
						duration,
						DurationFormatStyle.Digital,
						"en"
					);
					delete intl.DurationFormat;
					expect(durationClass.toLocaleString(duration, DurationFormatStyle.Digital, "en")).toEqual(
						expected
					);
				});

				test("throws past the Intl.DurationFormat limits", () => {
					delete intl.DurationFormat;
					expect(() =>
						durationClass.toLocaleString(
							{ ...empty, years: 2 ** 32 },
							DurationFormatStyle.Long,
							"en"
						)
					).toThrow(
						errorLike(
							expect.objectContaining({
								name: "GeneralError",
								message: "duration.localeValueTooLarge"
							})
						)
					);
				});

				test("caches the time separator for each locale", () => {
					const dateTimeFormat = Intl.DateTimeFormat;
					let constructed = 0;
					Intl.DateTimeFormat = class extends dateTimeFormat {
						constructor(...args: ConstructorParameters<typeof Intl.DateTimeFormat>) {
							super(...args);
							constructed++;
						}
					} as typeof Intl.DateTimeFormat;
					delete intl.DurationFormat;
					try {
						const duration = { ...empty, hours: 1, minutes: 2, seconds: 3 };
						expect(
							durationClass.toLocaleString(duration, DurationFormatStyle.Digital, "nl")
						).toEqual("1:02:03");
						expect(
							durationClass.toLocaleString(duration, DurationFormatStyle.Digital, "nl")
						).toEqual("1:02:03");
						expect(constructed).toEqual(1);
					} finally {
						Intl.DateTimeFormat = dateTimeFormat;
					}
				});

				test("throws for fractional components", () => {
					delete intl.DurationFormat;
					expect(() =>
						durationClass.toLocaleString({ ...empty, hours: 1.5 }, undefined, "en")
					).toThrow(
						errorLike(
							expect.objectContaining({
								name: "GeneralError",
								message: "duration.invalidLocaleValue"
							})
						)
					);
				});
			});
		});
	}
);
