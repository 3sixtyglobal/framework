// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { DurationRoundingMode } from "./durationRoundingMode.js";
import type { DurationUnit } from "./durationUnit.js";

/**
 * Options for rounding a duration.
 */
export interface IDurationRoundOptions {
	/**
	 * The largest unit to include in the result, defaults to the larger of the largest
	 * non-zero unit in the duration and the smallest unit.
	 */
	largestUnit?: DurationUnit;

	/**
	 * The smallest unit to include in the result, defaults to nanoseconds.
	 */
	smallestUnit?: DurationUnit;

	/**
	 * The rounding mode to use, defaults to half expand.
	 */
	roundingMode?: DurationRoundingMode;
}
