// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Duration } from "../../src/types/duration.js";

describe("Duration", () => {
	describe("parse", () => {
		test("returns undefined for an invalid string", () => {
			expect(Duration.parse("foo")).toBeUndefined();
		});

		test("returns undefined for a bare P string", () => {
			expect(Duration.parse("P")).toBeUndefined();
		});

		test("parses years", () => {
			expect(Duration.parse("P1Y")).toEqual({
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
			expect(Duration.parse("P2M")).toEqual({
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
			expect(Duration.parse("P1W")).toEqual({
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
			expect(Duration.parse("P3D")).toEqual({
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
			expect(Duration.parse("PT4H")).toEqual({
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
			expect(Duration.parse("PT5M")).toEqual({
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
			expect(Duration.parse("PT6S")).toEqual({
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
			expect(Duration.parse("P1Y2M3DT4H5M6S")).toEqual({
				years: 1,
				months: 2,
				weeks: 0,
				days: 3,
				hours: 4,
				minutes: 5,
				seconds: 6
			});
		});
	});

	describe("toSeconds", () => {
		test("returns 0 for an empty duration", () => {
			expect(
				Duration.toSeconds({
					years: 0,
					months: 0,
					weeks: 0,
					days: 0,
					hours: 0,
					minutes: 0,
					seconds: 0
				})
			).toEqual(0);
		});

		test("converts years to seconds", () => {
			expect(
				Duration.toSeconds({
					years: 1,
					months: 0,
					weeks: 0,
					days: 0,
					hours: 0,
					minutes: 0,
					seconds: 0
				})
			).toEqual(31_557_600);
		});

		test("converts months to seconds", () => {
			expect(
				Duration.toSeconds({
					years: 0,
					months: 1,
					weeks: 0,
					days: 0,
					hours: 0,
					minutes: 0,
					seconds: 0
				})
			).toEqual(2_629_800);
		});

		test("converts weeks to seconds", () => {
			expect(
				Duration.toSeconds({
					years: 0,
					months: 0,
					weeks: 1,
					days: 0,
					hours: 0,
					minutes: 0,
					seconds: 0
				})
			).toEqual(604_800);
		});

		test("converts days to seconds", () => {
			expect(
				Duration.toSeconds({
					years: 0,
					months: 0,
					weeks: 0,
					days: 1,
					hours: 0,
					minutes: 0,
					seconds: 0
				})
			).toEqual(86_400);
		});

		test("converts hours to seconds", () => {
			expect(
				Duration.toSeconds({
					years: 0,
					months: 0,
					weeks: 0,
					days: 0,
					hours: 1,
					minutes: 0,
					seconds: 0
				})
			).toEqual(3_600);
		});

		test("converts minutes to seconds", () => {
			expect(
				Duration.toSeconds({
					years: 0,
					months: 0,
					weeks: 0,
					days: 0,
					hours: 0,
					minutes: 1,
					seconds: 0
				})
			).toEqual(60);
		});

		test("returns seconds unchanged", () => {
			expect(
				Duration.toSeconds({
					years: 0,
					months: 0,
					weeks: 0,
					days: 0,
					hours: 0,
					minutes: 0,
					seconds: 42
				})
			).toEqual(42);
		});

		test("sums all components", () => {
			const twoMonths = 2 * 2_629_800;
			const threeDays = 3 * 86_400;
			const fourHours = 4 * 3_600;
			const fiveMinutes = 5 * 60;
			expect(
				Duration.toSeconds({
					years: 1,
					months: 2,
					weeks: 0,
					days: 3,
					hours: 4,
					minutes: 5,
					seconds: 6
				})
			).toEqual(31_557_600 + twoMonths + threeDays + fourHours + fiveMinutes + 6);
		});
	});

	describe("toString", () => {
		test("returns PT0S for a zero duration", () => {
			expect(
				Duration.toString({
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
				Duration.toString({
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
				Duration.toString({
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
				Duration.toString({
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
				Duration.toString({
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
				Duration.toString({
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
				Duration.toString({
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
				Duration.toString({
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
				Duration.toString({
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
				Duration.toString({
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
				Duration.toString({
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
			const parsed = Duration.parse(original);
			if (parsed === undefined) {
				throw new Error("Expected parse to succeed");
			}
			expect(Duration.toString(parsed)).toEqual(original);
		});
	});
});
