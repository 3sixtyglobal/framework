// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Represents a duration broken down into its component parts.
 */
export interface IDuration {
	/**
	 * The number of years.
	 */
	years: number;

	/**
	 * The number of months.
	 */
	months: number;

	/**
	 * The number of weeks.
	 */
	weeks: number;

	/**
	 * The number of days.
	 */
	days: number;

	/**
	 * The number of hours.
	 */
	hours: number;

	/**
	 * The number of minutes.
	 */
	minutes: number;

	/**
	 * The number of seconds.
	 */
	seconds: number;
}
