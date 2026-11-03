// Copyright 2026 3Sixty Trade Ltd.
// SPDX-License-Identifier: Apache-2.0.
import { DurationConstants } from "../../src/models/durationConstants.js";
import { DurationUnit } from "../../src/models/durationUnit.js";
import { Duration } from "../../src/types/duration.js";

describe("DurationConstants", () => {
	const empty = {
		years: 0,
		months: 0,
		weeks: 0,
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0
	};

	test.each([
		["NsPerUs", { ...empty, microseconds: 1 }, DurationUnit.Nanoseconds],
		["NsPerMs", { ...empty, milliseconds: 1 }, DurationUnit.Nanoseconds],
		["NsPerSecond", { ...empty, seconds: 1 }, DurationUnit.Nanoseconds],
		["UsPerMs", { ...empty, milliseconds: 1 }, DurationUnit.Microseconds],
		["UsPerSecond", { ...empty, seconds: 1 }, DurationUnit.Microseconds],
		["MsPerSecond", { ...empty, seconds: 1 }, DurationUnit.Milliseconds],
		["MsPerMinute", { ...empty, minutes: 1 }, DurationUnit.Milliseconds],
		["MsPerHour", { ...empty, hours: 1 }, DurationUnit.Milliseconds],
		["MsPerDay", { ...empty, days: 1 }, DurationUnit.Milliseconds],
		["MsPerWeek", { ...empty, weeks: 1 }, DurationUnit.Milliseconds],
		["MsPerMonth", { ...empty, months: 1 }, DurationUnit.Milliseconds],
		["MsPerYear", { ...empty, years: 1 }, DurationUnit.Milliseconds],
		["SecondsPerMinute", { ...empty, minutes: 1 }, DurationUnit.Seconds],
		["SecondsPerHour", { ...empty, hours: 1 }, DurationUnit.Seconds],
		["SecondsPerDay", { ...empty, days: 1 }, DurationUnit.Seconds],
		["SecondsPerWeek", { ...empty, weeks: 1 }, DurationUnit.Seconds],
		["SecondsPerMonth", { ...empty, months: 1 }, DurationUnit.Seconds],
		["SecondsPerYear", { ...empty, years: 1 }, DurationUnit.Seconds],
		["MinutesPerHour", { ...empty, hours: 1 }, DurationUnit.Minutes],
		["MinutesPerDay", { ...empty, days: 1 }, DurationUnit.Minutes],
		["MinutesPerWeek", { ...empty, weeks: 1 }, DurationUnit.Minutes],
		["HoursPerDay", { ...empty, days: 1 }, DurationUnit.Hours],
		["HoursPerWeek", { ...empty, weeks: 1 }, DurationUnit.Hours],
		["DaysPerWeek", { ...empty, weeks: 1 }, DurationUnit.Days],
		["DaysPerMonth", { ...empty, months: 1 }, DurationUnit.Days],
		["DaysPerYear", { ...empty, years: 1 }, DurationUnit.Days],
		["MonthsPerYear", { ...empty, years: 1 }, DurationUnit.Months]
	] as const)("%s matches the Duration conversion", (name, duration, units) => {
		expect(DurationConstants[name]).toEqual(Duration.toNumber(duration, units));
	});

	test("covers every constant", () => {
		expect(Object.keys(DurationConstants)).toHaveLength(27);
	});
});
