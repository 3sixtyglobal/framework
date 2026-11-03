// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Duration units.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const DurationUnit = {
	/**
	 * Years.
	 */
	Years: "years",

	/**
	 * Months.
	 */
	Months: "months",

	/**
	 * Weeks.
	 */
	Weeks: "weeks",

	/**
	 * Days.
	 */
	Days: "days",

	/**
	 * Hours.
	 */
	Hours: "hours",

	/**
	 * Minutes.
	 */
	Minutes: "minutes",

	/**
	 * Seconds.
	 */
	Seconds: "seconds",

	/**
	 * Milliseconds.
	 */
	Milliseconds: "milliseconds",

	/**
	 * Microseconds.
	 */
	Microseconds: "microseconds",

	/**
	 * Nanoseconds.
	 */
	Nanoseconds: "nanoseconds"
} as const;

/**
 * Duration units.
 */
export type DurationUnit = (typeof DurationUnit)[keyof typeof DurationUnit];
