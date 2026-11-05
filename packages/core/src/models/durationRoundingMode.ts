// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Duration rounding modes.
 */
export const DurationRoundingMode = {
	/**
	 * Round towards positive infinity.
	 */
	Ceil: "ceil",

	/**
	 * Round towards negative infinity.
	 */
	Floor: "floor",

	/**
	 * Round away from zero.
	 */
	Expand: "expand",

	/**
	 * Round towards zero.
	 */
	Trunc: "trunc",

	/**
	 * Round to the nearest value, ties towards positive infinity.
	 */
	HalfCeil: "halfCeil",

	/**
	 * Round to the nearest value, ties towards negative infinity.
	 */
	HalfFloor: "halfFloor",

	/**
	 * Round to the nearest value, ties away from zero.
	 */
	HalfExpand: "halfExpand",

	/**
	 * Round to the nearest value, ties towards zero.
	 */
	HalfTrunc: "halfTrunc",

	/**
	 * Round to the nearest value, ties towards the even value.
	 */
	HalfEven: "halfEven"
} as const;

/**
 * Duration rounding modes.
 */
export type DurationRoundingMode = (typeof DurationRoundingMode)[keyof typeof DurationRoundingMode];
