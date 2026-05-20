// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { nameof } from "@twin.org/nameof";
import { Guards } from "../utils/guards.js";
import { Is } from "../utils/is.js";

/**
 * Class to help with numbers.
 */
export class NumberHelper {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<NumberHelper>();

	/**
	 * Clamps a number between a minimum and maximum value.
	 * @param value The value to clamp.
	 * @param minValue The minimum value.
	 * @param maxValue The maximum value.
	 * @returns The clamped value.
	 */
	public static clamp(value: number, minValue?: number, maxValue?: number): number {
		Guards.number(NumberHelper.CLASS_NAME, nameof(value), value);

		let output = value;
		if (Is.number(minValue) && output < minValue) {
			output = minValue;
		}
		if (Is.number(maxValue) && output > maxValue) {
			output = maxValue;
		}

		return output;
	}
}
