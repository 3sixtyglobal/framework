// Copyright 2026 3Sixty Trade Ltd.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Common duration conversion constants.
 * Years and months use the average values 365.25 days and 30.4375 days.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const DurationConstants = {
	/**
	 * Nanoseconds per microsecond.
	 */
	NsPerUs: 1_000,

	/**
	 * Nanoseconds per millisecond.
	 */
	NsPerMs: 1_000_000,

	/**
	 * Nanoseconds per second.
	 */
	NsPerSecond: 1_000_000_000,

	/**
	 * Microseconds per millisecond.
	 */
	UsPerMs: 1_000,

	/**
	 * Microseconds per second.
	 */
	UsPerSecond: 1_000_000,

	/**
	 * Milliseconds per second.
	 */
	MsPerSecond: 1_000,

	/**
	 * Milliseconds per minute.
	 */
	MsPerMinute: 60_000,

	/**
	 * Milliseconds per hour.
	 */
	MsPerHour: 3_600_000,

	/**
	 * Milliseconds per day.
	 */
	MsPerDay: 86_400_000,

	/**
	 * Milliseconds per week.
	 */
	MsPerWeek: 604_800_000,

	/**
	 * Milliseconds per average month.
	 */
	MsPerMonth: 2_629_800_000,

	/**
	 * Milliseconds per average year.
	 */
	MsPerYear: 31_557_600_000,

	/**
	 * Seconds per minute.
	 */
	SecondsPerMinute: 60,

	/**
	 * Seconds per hour.
	 */
	SecondsPerHour: 3_600,

	/**
	 * Seconds per day.
	 */
	SecondsPerDay: 86_400,

	/**
	 * Seconds per week.
	 */
	SecondsPerWeek: 604_800,

	/**
	 * Seconds per average month.
	 */
	SecondsPerMonth: 2_629_800,

	/**
	 * Seconds per average year.
	 */
	SecondsPerYear: 31_557_600,

	/**
	 * Minutes per hour.
	 */
	MinutesPerHour: 60,

	/**
	 * Minutes per day.
	 */
	MinutesPerDay: 1_440,

	/**
	 * Minutes per week.
	 */
	MinutesPerWeek: 10_080,

	/**
	 * Hours per day.
	 */
	HoursPerDay: 24,

	/**
	 * Hours per week.
	 */
	HoursPerWeek: 168,

	/**
	 * Days per week.
	 */
	DaysPerWeek: 7,

	/**
	 * Days per average month.
	 */
	DaysPerMonth: 30.4375,

	/**
	 * Days per average year.
	 */
	DaysPerYear: 365.25,

	/**
	 * Months per year.
	 */
	MonthsPerYear: 12
} as const;

/**
 * Common duration conversion constants.
 */
export type DurationConstants = (typeof DurationConstants)[keyof typeof DurationConstants];
