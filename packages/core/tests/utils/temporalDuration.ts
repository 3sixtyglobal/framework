// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { DurationFormatStyle } from "../../src/models/durationFormatStyle.js";
import { DurationUnit } from "../../src/models/durationUnit.js";
import type { IDuration } from "../../src/models/IDuration.js";
import type { IDurationRoundOptions } from "../../src/models/IDurationRoundOptions.js";
import { I18n } from "../../src/utils/i18n.js";
import { Is } from "../../src/utils/is.js";

/**
 * Reference implementation of the Duration methods using Temporal, used to compare behaviour.
 * Temporal is only available in some runtimes, use isAvailable before calling the methods.
 */
export class TemporalDuration {
	/**
	 * Is Temporal available in the current runtime.
	 * @returns True if Temporal is available.
	 */
	public static isAvailable(): boolean {
		return !Is.undefined(globalThis.Temporal);
	}

	/**
	 * Parse an ISO 8601 duration string into its component parts.
	 * @param value The string to parse.
	 * @returns The parsed duration, or undefined if the string is not a valid ISO 8601 duration.
	 */
	public static parse(value: string): IDuration | undefined {
		try {
			return TemporalDuration.fromTemporal(Temporal.Duration.from(value));
		} catch {
			return undefined;
		}
	}

	/**
	 * Convert a duration object to an ISO 8601 duration string.
	 * @param duration The duration to convert.
	 * @returns The ISO 8601 duration string.
	 */
	public static toString(duration: IDuration): string {
		return TemporalDuration.toTemporal(duration).toString();
	}

	/**
	 * Format a duration as a human readable string for a locale.
	 * @param duration The duration to format.
	 * @param style The format style, defaults to short.
	 * @param locale The locale to format for, defaults to the current I18n locale.
	 * @returns The formatted duration.
	 */
	public static toLocaleString(
		duration: IDuration,
		style?: DurationFormatStyle,
		locale?: string
	): string {
		return TemporalDuration.toTemporal(duration).toLocaleString(locale ?? I18n.getLocale(), {
			style: style ?? DurationFormatStyle.Short
		});
	}

	/**
	 * Convert a duration object to a total value in the requested units.
	 * @param duration The duration to convert.
	 * @param units The units to convert the duration to.
	 * @returns The total value in the requested units.
	 */
	public static toNumber(duration: IDuration, units: DurationUnit): number {
		return TemporalDuration.toTemporal(duration).total({ unit: units });
	}

	/**
	 * Convert a duration object to a total value in the requested units, truncated towards zero.
	 * @param duration The duration to convert.
	 * @param units The units to convert the duration to.
	 * @returns The total value in the requested units.
	 */
	public static toBigInt(duration: IDuration, units: DurationUnit): bigint {
		return BigInt(Math.trunc(TemporalDuration.toNumber(duration, units)));
	}

	/**
	 * Create a duration from a total value in the given units.
	 * @param value The total value.
	 * @param units The units of the value.
	 * @returns The duration.
	 */
	public static from(value: number | bigint, units: DurationUnit): IDuration {
		return TemporalDuration.fromTemporal(
			Temporal.Duration.from({ [units]: Number(value) }).round({
				largestUnit: units,
				smallestUnit: DurationUnit.Nanoseconds
			})
		);
	}

	/**
	 * Compare two durations.
	 * @param duration1 The first duration.
	 * @param duration2 The second duration.
	 * @returns -1 if the first duration is shorter, 1 if it is longer, 0 if they are equal.
	 */
	public static compare(duration1: IDuration, duration2: IDuration): -1 | 0 | 1 {
		return Temporal.Duration.compare(
			TemporalDuration.toTemporal(duration1),
			TemporalDuration.toTemporal(duration2)
		) as -1 | 0 | 1;
	}

	/**
	 * Round a duration and balance it between the largest and smallest units.
	 * @param duration The duration to round.
	 * @param options The rounding options.
	 * @returns The rounded duration.
	 */
	public static round(duration: IDuration, options?: IDurationRoundOptions): IDuration {
		return TemporalDuration.fromTemporal(
			TemporalDuration.toTemporal(duration).round({
				largestUnit: options?.largestUnit,
				smallestUnit: options?.smallestUnit ?? DurationUnit.Nanoseconds,
				roundingMode: options?.roundingMode
			})
		);
	}

	/**
	 * Add a duration to a date, using the ISO calendar in UTC.
	 * @param date The date to add the duration to.
	 * @param duration The duration to add.
	 * @returns A new date with the duration added.
	 */
	public static addToDate(date: Date, duration: IDuration): Date {
		const result = Temporal.Instant.fromEpochMilliseconds(date.getTime())
			.toZonedDateTimeISO("UTC")
			.add(TemporalDuration.toTemporal(duration));
		return new Date(result.epochMilliseconds);
	}

	/**
	 * Convert a duration object to a Temporal duration.
	 * @param duration The duration to convert.
	 * @returns The Temporal duration.
	 */
	private static toTemporal(duration: IDuration): Temporal.Duration {
		return Temporal.Duration.from({
			years: duration.years,
			months: duration.months,
			weeks: duration.weeks,
			days: duration.days,
			hours: duration.hours,
			minutes: duration.minutes,
			seconds: duration.seconds,
			milliseconds: duration.milliseconds ?? 0,
			microseconds: duration.microseconds ?? 0,
			nanoseconds: duration.nanoseconds ?? 0
		});
	}

	/**
	 * Convert a Temporal duration to a duration object, omitting zero sub-second components.
	 * @param duration The Temporal duration to convert.
	 * @returns The duration object.
	 */
	private static fromTemporal(duration: Temporal.Duration): IDuration {
		const result: IDuration = {
			years: duration.years,
			months: duration.months,
			weeks: duration.weeks,
			days: duration.days,
			hours: duration.hours,
			minutes: duration.minutes,
			seconds: duration.seconds
		};
		for (const unit of [
			DurationUnit.Milliseconds,
			DurationUnit.Microseconds,
			DurationUnit.Nanoseconds
		] as const) {
			if (duration[unit] !== 0) {
				result[unit] = duration[unit];
			}
		}
		// Temporal returns -0 for zero components of negative durations, normalise to match.
		for (const key of Object.keys(result) as (keyof IDuration)[]) {
			if (Object.is(result[key], -0)) {
				result[key] = 0;
			}
		}
		return result;
	}
}
