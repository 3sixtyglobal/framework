// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { nameof } from "@3sixty/nameof";
import { DURATION_REG_EXP } from "./durationRegExp.js";
import { GeneralError } from "../errors/generalError.js";
import { DurationFormatStyle } from "../models/durationFormatStyle.js";
import { DurationRoundingMode } from "../models/durationRoundingMode.js";
import { DurationUnit } from "../models/durationUnit.js";
import type { IDuration } from "../models/IDuration.js";
import type { IDurationRoundOptions } from "../models/IDurationRoundOptions.js";
import { Guards } from "../utils/guards.js";
import { I18n } from "../utils/i18n.js";
import { Is } from "../utils/is.js";

/**
 * Helper methods for working with ISO 8601 durations.
 */
export class Duration {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<Duration>();

	/**
	 * The number of nanoseconds in each unit.
	 * @internal
	 */
	private static readonly _NANOSECONDS_PER_UNIT: { [unit in DurationUnit]: bigint } = {
		[DurationUnit.Years]: 31_557_600_000_000_000n,
		[DurationUnit.Months]: 2_629_800_000_000_000n,
		[DurationUnit.Weeks]: 604_800_000_000_000n,
		[DurationUnit.Days]: 86_400_000_000_000n,
		[DurationUnit.Hours]: 3_600_000_000_000n,
		[DurationUnit.Minutes]: 60_000_000_000n,
		[DurationUnit.Seconds]: 1_000_000_000n,
		[DurationUnit.Milliseconds]: 1_000_000n,
		[DurationUnit.Microseconds]: 1_000n,
		[DurationUnit.Nanoseconds]: 1n
	};

	/**
	 * The maximum safe integer as a bigint.
	 * @internal
	 */
	private static readonly _MAX_SAFE_INTEGER: bigint = BigInt(Number.MAX_SAFE_INTEGER);

	/**
	 * The maximum number of milliseconds from the epoch that a Date can represent.
	 * @internal
	 */
	private static readonly _MAX_DATE_TIME: bigint = 8_640_000_000_000_000n;

	/**
	 * The limit for years, months and weeks when formatting for a locale, as per Intl.DurationFormat.
	 * @internal
	 */
	private static readonly _LOCALE_CALENDAR_LIMIT: number = 2 ** 32;

	/**
	 * The limit for the remaining components in nanoseconds when formatting for a locale, as per
	 * Intl.DurationFormat which limits them to less than 2^53 seconds.
	 * @internal
	 */
	private static readonly _LOCALE_TIME_LIMIT: bigint = 9_007_199_254_740_992_000_000_000n;

	/**
	 * The time separator for each locale, populated on first use.
	 * @internal
	 */
	private static readonly _TIME_SEPARATORS: Map<string, string> = new Map<string, string>();

	/**
	 * Parse an ISO 8601 duration string into its component parts.
	 * @param value The string to parse.
	 * @returns The parsed duration, or undefined if the string is not a valid ISO 8601 duration.
	 */
	public static parse(value: string): IDuration | undefined {
		const match = DURATION_REG_EXP.exec(value);
		if (!match?.slice(2).some(Boolean)) {
			return undefined;
		}

		const sign = match[1] === "-" ? -1 : 1;
		const secondsValue = match[8] ?? "0";
		const [secondsIntegerPart, secondsFractionPart] = secondsValue.split(".");
		const fractionPadded = `${secondsFractionPart ?? ""}000000000`.slice(0, 9);
		const milliseconds = Number.parseInt(fractionPadded.slice(0, 3), 10);
		const microseconds = Number.parseInt(fractionPadded.slice(3, 6), 10);
		const nanoseconds = Number.parseInt(fractionPadded.slice(6, 9), 10);

		const duration: IDuration = {
			years: Duration.applySign(Number(match[2] ?? 0), sign),
			months: Duration.applySign(Number(match[3] ?? 0), sign),
			weeks: Duration.applySign(Number(match[4] ?? 0), sign),
			days: Duration.applySign(Number(match[5] ?? 0), sign),
			hours: Duration.applySign(Number(match[6] ?? 0), sign),
			minutes: Duration.applySign(Number(match[7] ?? 0), sign),
			seconds: Duration.applySign(Number(secondsIntegerPart ?? 0), sign)
		};

		if (milliseconds !== 0) {
			duration.milliseconds = milliseconds * sign;
		}
		if (microseconds !== 0) {
			duration.microseconds = microseconds * sign;
		}
		if (nanoseconds !== 0) {
			duration.nanoseconds = nanoseconds * sign;
		}

		return duration;
	}

	/**
	 * Convert a duration object to an ISO 8601 duration string.
	 * @param duration The duration to convert.
	 * @returns The ISO 8601 duration string (e.g. "P1Y2M3DT4H5M6S").
	 */
	public static toString(duration: IDuration): string {
		Guards.object<IDuration>(Duration.CLASS_NAME, nameof(duration), duration);
		const sign = Duration.resolveSign(duration);
		const dateParts: string[] = [];
		const absYears = Duration.absolute(duration.years);
		if (absYears !== 0) {
			dateParts.push(`${absYears}Y`);
		}
		const absMonths = Duration.absolute(duration.months);
		if (absMonths !== 0) {
			dateParts.push(`${absMonths}M`);
		}
		const absWeeks = Duration.absolute(duration.weeks);
		if (absWeeks !== 0) {
			dateParts.push(`${absWeeks}W`);
		}
		const absDays = Duration.absolute(duration.days);
		if (absDays !== 0) {
			dateParts.push(`${absDays}D`);
		}

		const timeParts: string[] = [];
		const absHours = Duration.absolute(duration.hours);
		if (absHours !== 0) {
			timeParts.push(`${absHours}H`);
		}
		const absMinutes = Duration.absolute(duration.minutes);
		if (absMinutes !== 0) {
			timeParts.push(`${absMinutes}M`);
		}
		const secondFraction = Duration.formatSecondFraction(
			Duration.absolute(duration.milliseconds),
			Duration.absolute(duration.microseconds),
			Duration.absolute(duration.nanoseconds)
		);
		const absSeconds = Duration.absolute(duration.seconds);
		if (absSeconds !== 0 || secondFraction !== undefined) {
			timeParts.push(
				secondFraction === undefined ? `${absSeconds}S` : `${absSeconds}.${secondFraction}S`
			);
		}

		if (dateParts.length === 0 && timeParts.length === 0) {
			return "PT0S";
		}

		const timeSection = timeParts.length > 0 ? `T${timeParts.join("")}` : "";
		const prefix = sign < 0 ? "-" : "";
		return `${prefix}P${dateParts.join("")}${timeSection}`;
	}

	/**
	 * Format a duration as a human readable string for a locale, e.g. "1 hr, 30 min".
	 * Zero components are omitted, so a zero duration is formatted as an empty string, except for the
	 * digital style which formats it as zero time, e.g. "0:00:00", matching Temporal.
	 * @param duration The duration to format.
	 * @param style The format style, defaults to short.
	 * @param locale The locale to format for, defaults to the current I18n locale.
	 * @returns The formatted duration.
	 * @throws GeneralError if any component is not an integer or the components have mixed signs.
	 * @throws GeneralError if the duration exceeds the limits of Intl.DurationFormat, years, months
	 * and weeks must be less than 2^32 and the remaining components less than 2^53 seconds.
	 */
	public static toLocaleString(
		duration: IDuration,
		style?: DurationFormatStyle,
		locale?: string
	): string {
		Guards.object<IDuration>(Duration.CLASS_NAME, nameof(duration), duration);
		const formatStyle = style ?? DurationFormatStyle.Short;
		Guards.arrayOneOf<DurationFormatStyle>(
			Duration.CLASS_NAME,
			nameof(style),
			formatStyle,
			Object.values(DurationFormatStyle)
		);

		const sign = Duration.resolveSign(duration);
		for (const unit of Object.values(DurationUnit)) {
			const value = duration[unit] ?? 0;
			if (!Number.isInteger(value) || (value !== 0 && Math.sign(value) !== sign)) {
				throw new GeneralError(Duration.CLASS_NAME, "invalidLocaleValue", { unit, value });
			}
		}
		const timeNanoseconds = Duration.toNanoseconds({
			...duration,
			years: 0,
			months: 0,
			weeks: 0
		});
		if (
			Math.abs(duration.years) >= Duration._LOCALE_CALENDAR_LIMIT ||
			Math.abs(duration.months) >= Duration._LOCALE_CALENDAR_LIMIT ||
			Math.abs(duration.weeks) >= Duration._LOCALE_CALENDAR_LIMIT ||
			timeNanoseconds >= Duration._LOCALE_TIME_LIMIT ||
			timeNanoseconds <= -Duration._LOCALE_TIME_LIMIT
		) {
			throw new GeneralError(Duration.CLASS_NAME, "localeValueTooLarge", {
				duration: Duration.toString(duration)
			});
		}

		const formatLocale = locale ?? I18n.getLocale();

		// Intl.DurationFormat is not in the es2022 lib typings, so describe the parts we use.
		const intl = Intl as unknown as {
			DurationFormat?: new (
				locale: string,
				options: { style: DurationFormatStyle }
			) => { format: (duration: IDuration) => string };
		};
		if (Is.function(intl.DurationFormat)) {
			const durationFormat = new intl.DurationFormat(formatLocale, { style: formatStyle });
			return durationFormat.format(duration);
		}

		return Duration.formatLocaleFallback(duration, formatStyle, formatLocale);
	}

	/**
	 * Convert a duration object to a total value in the requested units.
	 * Year and month components use the average values 365.25 days and 30.4375 days.
	 * @param duration The duration to convert.
	 * @param units The units to convert the duration to.
	 * @returns The total value in the requested units.
	 * @throws GeneralError if the whole part of the value exceeds the maximum safe integer.
	 */
	public static toNumber(duration: IDuration, units: DurationUnit): number {
		Guards.object<IDuration>(Duration.CLASS_NAME, nameof(duration), duration);
		Guards.arrayOneOf<DurationUnit>(
			Duration.CLASS_NAME,
			nameof(units),
			units,
			Object.values(DurationUnit)
		);

		const totalNanoseconds = Duration.toNanoseconds(duration);
		const factor = Duration._NANOSECONDS_PER_UNIT[units];
		const whole = totalNanoseconds / factor;
		if (whole > Duration._MAX_SAFE_INTEGER || whole < -Duration._MAX_SAFE_INTEGER) {
			throw new GeneralError(Duration.CLASS_NAME, "valueTooLarge", {
				value: whole.toString(),
				units
			});
		}
		const fraction = Number(totalNanoseconds % factor) / Number(factor);
		return Number(whole) + fraction;
	}

	/**
	 * Convert a duration object to a total value in the requested units without precision loss.
	 * Year and month components use the average values 365.25 days and 30.4375 days.
	 * The result is truncated towards zero to a whole number of units.
	 * @param duration The duration to convert.
	 * @param units The units to convert the duration to.
	 * @returns The total value in the requested units.
	 */
	public static toBigInt(duration: IDuration, units: DurationUnit): bigint {
		Guards.object<IDuration>(Duration.CLASS_NAME, nameof(duration), duration);
		Guards.arrayOneOf<DurationUnit>(
			Duration.CLASS_NAME,
			nameof(units),
			units,
			Object.values(DurationUnit)
		);

		return Duration.toNanoseconds(duration) / Duration._NANOSECONDS_PER_UNIT[units];
	}

	/**
	 * Create a duration from a total value in the given units.
	 * The value is balanced into the given units and smaller, e.g. 1.5 hours becomes 1 hour 30 minutes.
	 * Fractional values are rounded to the nearest nanosecond.
	 * @param value The total value.
	 * @param units The units of the value.
	 * @returns The duration.
	 * @throws GeneralError if a component of the duration exceeds the maximum safe integer.
	 */
	public static from(value: number | bigint, units: DurationUnit): IDuration {
		if (!Is.bigint(value)) {
			Guards.number(Duration.CLASS_NAME, nameof(value), value);
		}
		Guards.arrayOneOf<DurationUnit>(
			Duration.CLASS_NAME,
			nameof(units),
			units,
			Object.values(DurationUnit)
		);

		return Duration.fromNanoseconds(
			Duration.unitToNanoseconds(value, units),
			units,
			DurationUnit.Nanoseconds
		);
	}

	/**
	 * Compare two durations.
	 * Year and month components use the average values 365.25 days and 30.4375 days.
	 * @param duration1 The first duration.
	 * @param duration2 The second duration.
	 * @returns -1 if the first duration is shorter, 1 if it is longer, 0 if they are equal.
	 */
	public static compare(duration1: IDuration, duration2: IDuration): -1 | 0 | 1 {
		Guards.object<IDuration>(Duration.CLASS_NAME, nameof(duration1), duration1);
		Guards.object<IDuration>(Duration.CLASS_NAME, nameof(duration2), duration2);

		const totalNanoseconds1 = Duration.toNanoseconds(duration1);
		const totalNanoseconds2 = Duration.toNanoseconds(duration2);
		if (totalNanoseconds1 < totalNanoseconds2) {
			return -1;
		}
		return totalNanoseconds1 > totalNanoseconds2 ? 1 : 0;
	}

	/**
	 * Round a duration and balance it between the largest and smallest units.
	 * Year and month components use the average values 365.25 days and 30.4375 days.
	 * Weeks are only included in the result when they are the largest or smallest unit.
	 * @param duration The duration to round.
	 * @param options The rounding options.
	 * @returns The rounded duration.
	 * @throws GeneralError if a component of the result exceeds the maximum safe integer.
	 * @throws GeneralError if the largest unit is smaller than the smallest unit.
	 */
	public static round(duration: IDuration, options?: IDurationRoundOptions): IDuration {
		Guards.object<IDuration>(Duration.CLASS_NAME, nameof(duration), duration);
		const units = Object.values(DurationUnit);
		const smallestUnit = options?.smallestUnit ?? DurationUnit.Nanoseconds;
		Guards.arrayOneOf<DurationUnit>(
			Duration.CLASS_NAME,
			nameof(options?.smallestUnit),
			smallestUnit,
			units
		);
		const roundingMode = options?.roundingMode ?? DurationRoundingMode.HalfExpand;
		Guards.arrayOneOf<DurationRoundingMode>(
			Duration.CLASS_NAME,
			nameof(options?.roundingMode),
			roundingMode,
			Object.values(DurationRoundingMode)
		);

		let largestUnit = options?.largestUnit;
		if (Is.undefined(largestUnit)) {
			const largestNonZeroUnit = units.find(unit => (duration[unit] ?? 0) !== 0) ?? smallestUnit;
			largestUnit =
				units.indexOf(largestNonZeroUnit) < units.indexOf(smallestUnit)
					? largestNonZeroUnit
					: smallestUnit;
		}
		Guards.arrayOneOf<DurationUnit>(
			Duration.CLASS_NAME,
			nameof(options?.largestUnit),
			largestUnit,
			units
		);
		if (units.indexOf(largestUnit) > units.indexOf(smallestUnit)) {
			throw new GeneralError(Duration.CLASS_NAME, "largestUnitTooSmall", {
				largestUnit,
				smallestUnit
			});
		}

		const roundedNanoseconds = Duration.roundNanoseconds(
			Duration.toNanoseconds(duration),
			Duration._NANOSECONDS_PER_UNIT[smallestUnit],
			roundingMode
		);
		return Duration.fromNanoseconds(roundedNanoseconds, largestUnit, smallestUnit);
	}

	/**
	 * Add a duration to a date.
	 * Years and months are added to the calendar date in UTC, clamping the day to the end of the
	 * resulting month, e.g. 31 January plus 1 month is 28 or 29 February.
	 * The remaining components are added as exact time, days are always 24 hours.
	 * The result is truncated to millisecond precision.
	 * @param date The date to add the duration to.
	 * @param duration The duration to add, negative durations subtract.
	 * @returns A new date with the duration added.
	 * @throws GeneralError if the resulting date is outside the range supported by Date.
	 */
	public static addToDate(date: Date, duration: IDuration): Date {
		Guards.date(Duration.CLASS_NAME, nameof(date), date);
		Guards.object<IDuration>(Duration.CLASS_NAME, nameof(duration), duration);
		Guards.integer(Duration.CLASS_NAME, nameof(duration.years), duration.years);
		Guards.integer(Duration.CLASS_NAME, nameof(duration.months), duration.months);

		const result = new Date(date.getTime());
		if (duration.years !== 0 || duration.months !== 0) {
			const day = result.getUTCDate();
			result.setUTCDate(1);
			result.setUTCFullYear(
				result.getUTCFullYear() + duration.years,
				result.getUTCMonth() + duration.months
			);
			const lastDayOfMonth = new Date(0);
			lastDayOfMonth.setUTCFullYear(result.getUTCFullYear(), result.getUTCMonth() + 1, 0);
			result.setUTCDate(Math.min(day, lastDayOfMonth.getUTCDate()));
		}

		const outOfRange = (): GeneralError =>
			new GeneralError(Duration.CLASS_NAME, "dateOutOfRange", {
				date: date.toISOString(),
				duration: Duration.toString(duration)
			});
		if (Number.isNaN(result.getTime())) {
			throw outOfRange();
		}

		// Add the time in bigint milliseconds, offsets larger than the safe integer range can still
		// produce a valid date, so a number addition could lose precision.
		const timeNanoseconds = Duration.toNanoseconds({ ...duration, years: 0, months: 0 });
		const timeMilliseconds = timeNanoseconds / 1_000_000n;
		const time = BigInt(result.getTime()) + timeMilliseconds;
		if (time > Duration._MAX_DATE_TIME || time < -Duration._MAX_DATE_TIME) {
			throw outOfRange();
		}
		result.setTime(Number(time));
		return result;
	}

	/**
	 * Format a duration for a locale without Intl.DurationFormat, for runtimes which do not support it.
	 * Each component is formatted with Intl.NumberFormat and the parts are joined with Intl.ListFormat.
	 * @param duration The duration to format.
	 * @param style The format style.
	 * @param locale The locale to format for.
	 * @returns The formatted duration.
	 * @internal
	 */
	private static formatLocaleFallback(
		duration: IDuration,
		style: DurationFormatStyle,
		locale: string
	): string {
		const units = Object.values(DurationUnit);
		const sign = Duration.resolveSign(duration);
		const isDigital = style === DurationFormatStyle.Digital;
		const unitDisplay = isDigital ? DurationFormatStyle.Short : style;
		const lastUnitIndex = units.indexOf(isDigital ? DurationUnit.Days : DurationUnit.Nanoseconds);
		const parts: string[] = [];
		for (const unit of units.slice(0, lastUnitIndex + 1)) {
			const value = duration[unit] ?? 0;
			if (value !== 0) {
				parts.push(
					new Intl.NumberFormat(locale, {
						style: "unit",
						unit: unit.slice(0, -1),
						unitDisplay
					}).format(parts.length === 0 ? value : Math.abs(value))
				);
			}
		}

		if (isDigital) {
			const integerFormat = (minimumIntegerDigits: number): Intl.NumberFormat =>
				new Intl.NumberFormat(locale, { minimumIntegerDigits, useGrouping: false });
			const fraction =
				Duration.formatSecondFraction(
					Duration.absolute(duration.milliseconds),
					Duration.absolute(duration.microseconds),
					Duration.absolute(duration.nanoseconds)
				) ?? "";
			const seconds = new Intl.NumberFormat(locale, {
				minimumIntegerDigits: 2,
				minimumFractionDigits: fraction.length,
				maximumFractionDigits: fraction.length,
				useGrouping: false
			}).format(Number(`${Duration.absolute(duration.seconds)}.${fraction}`));
			const hours = integerFormat(1).format(Duration.absolute(duration.hours));
			const minutes = integerFormat(2).format(Duration.absolute(duration.minutes));
			const prefix = parts.length === 0 && sign < 0 ? "-" : "";
			const separator = Duration.timeSeparator(locale);
			parts.push(`${prefix}${hours}${separator}${minutes}${separator}${seconds}`);
		}

		return new Intl.ListFormat(locale, { type: "unit", style: unitDisplay }).format(parts);
	}

	/**
	 * Get the separator a locale uses between hours, minutes and seconds, e.g. ":" or ".".
	 * @param locale The locale.
	 * @returns The time separator.
	 * @internal
	 */
	private static timeSeparator(locale: string): string {
		let separator = Duration._TIME_SEPARATORS.get(locale);
		if (Is.undefined(separator)) {
			const parts = new Intl.DateTimeFormat(locale, {
				hour: "numeric",
				minute: "2-digit",
				hourCycle: "h23",
				timeZone: "UTC"
			}).formatToParts(0);
			const hourIndex = parts.findIndex(part => part.type === "hour");
			const separatorPart = parts[hourIndex + 1];
			separator = separatorPart?.type === "literal" ? separatorPart.value : ":";
			Duration._TIME_SEPARATORS.set(locale, separator);
		}
		return separator;
	}

	/**
	 * Convert a duration object to total nanoseconds.
	 * Fractional components are rounded to the nearest nanosecond.
	 * @param duration The duration to convert.
	 * @returns The total number of nanoseconds.
	 * @internal
	 */
	private static toNanoseconds(duration: IDuration): bigint {
		let totalNanoseconds = 0n;
		for (const unit of Object.values(DurationUnit)) {
			const value = duration[unit] ?? 0;
			Guards.number(Duration.CLASS_NAME, `${nameof(duration)}.${unit}`, value);
			totalNanoseconds += Duration.unitToNanoseconds(value, unit);
		}
		return totalNanoseconds;
	}

	/**
	 * Convert a value in the given units to nanoseconds.
	 * Fractional values are rounded to the nearest nanosecond.
	 * @param value The value to convert.
	 * @param unit The units of the value.
	 * @returns The number of nanoseconds.
	 * @internal
	 */
	private static unitToNanoseconds(value: number | bigint, unit: DurationUnit): bigint {
		const factor = Duration._NANOSECONDS_PER_UNIT[unit];
		if (Is.bigint(value)) {
			return value * factor;
		}
		// Convert the whole part exactly so only the fraction is subject to floating point rounding.
		const whole = Math.trunc(value);
		const fractionNanoseconds = BigInt(Math.round((value - whole) * Number(factor)));
		const wholeNanoseconds = BigInt(whole) * factor;
		return wholeNanoseconds + fractionNanoseconds;
	}

	/**
	 * Balance total nanoseconds into duration components between the largest and smallest units.
	 * Weeks are only included when they are the largest or smallest unit.
	 * @param totalNanoseconds The total nanoseconds, must be a multiple of the smallest unit.
	 * @param largestUnit The largest unit to include.
	 * @param smallestUnit The smallest unit to include.
	 * @returns The balanced duration.
	 * @throws GeneralError if a component exceeds the maximum safe integer.
	 * @internal
	 */
	private static fromNanoseconds(
		totalNanoseconds: bigint,
		largestUnit: DurationUnit,
		smallestUnit: DurationUnit
	): IDuration {
		const sign = totalNanoseconds < 0n ? -1 : 1;
		let remaining = totalNanoseconds < 0n ? -totalNanoseconds : totalNanoseconds;
		const includeWeeks = largestUnit === DurationUnit.Weeks || smallestUnit === DurationUnit.Weeks;
		const units = Object.values(DurationUnit);

		const values: { [unit in DurationUnit]?: number } = {};
		for (let i = units.indexOf(largestUnit); i <= units.indexOf(smallestUnit); i++) {
			const unit = units[i];
			if (unit !== DurationUnit.Weeks || includeWeeks) {
				const factor = Duration._NANOSECONDS_PER_UNIT[unit];
				const unitValue = remaining / factor;
				if (unitValue > Duration._MAX_SAFE_INTEGER) {
					throw new GeneralError(Duration.CLASS_NAME, "valueTooLarge", {
						value: (sign < 0 ? -unitValue : unitValue).toString(),
						units: unit
					});
				}
				values[unit] = Duration.applySign(Number(unitValue), sign);
				remaining %= factor;
			}
		}

		const duration: IDuration = {
			years: values.years ?? 0,
			months: values.months ?? 0,
			weeks: values.weeks ?? 0,
			days: values.days ?? 0,
			hours: values.hours ?? 0,
			minutes: values.minutes ?? 0,
			seconds: values.seconds ?? 0
		};
		if ((values.milliseconds ?? 0) !== 0) {
			duration.milliseconds = values.milliseconds;
		}
		if ((values.microseconds ?? 0) !== 0) {
			duration.microseconds = values.microseconds;
		}
		if ((values.nanoseconds ?? 0) !== 0) {
			duration.nanoseconds = values.nanoseconds;
		}
		return duration;
	}

	/**
	 * Round nanoseconds to a multiple of the increment.
	 * @param value The nanoseconds to round.
	 * @param increment The increment to round to.
	 * @param roundingMode The rounding mode.
	 * @returns The rounded nanoseconds.
	 * @internal
	 */
	private static roundNanoseconds(
		value: bigint,
		increment: bigint,
		roundingMode: DurationRoundingMode
	): bigint {
		const quotient = value / increment;
		const remainder = value % increment;
		if (remainder === 0n) {
			return value;
		}

		const isNegative = value < 0n;
		const truncated = quotient * increment;
		const expanded = (isNegative ? quotient - 1n : quotient + 1n) * increment;
		const ceil = isNegative ? truncated : expanded;
		const floor = isNegative ? expanded : truncated;
		const doubleRemainder = (remainder < 0n ? -remainder : remainder) * 2n;

		if (roundingMode === DurationRoundingMode.Ceil) {
			return ceil;
		} else if (roundingMode === DurationRoundingMode.Floor) {
			return floor;
		} else if (roundingMode === DurationRoundingMode.Expand) {
			return expanded;
		} else if (roundingMode === DurationRoundingMode.Trunc) {
			return truncated;
		} else if (doubleRemainder < increment) {
			return truncated;
		} else if (doubleRemainder > increment) {
			return expanded;
		} else if (roundingMode === DurationRoundingMode.HalfCeil) {
			return ceil;
		} else if (roundingMode === DurationRoundingMode.HalfFloor) {
			return floor;
		} else if (roundingMode === DurationRoundingMode.HalfTrunc) {
			return truncated;
		} else if (roundingMode === DurationRoundingMode.HalfEven) {
			return quotient % 2n === 0n ? truncated : expanded;
		}
		return expanded;
	}

	/**
	 * Resolve a common sign for all non-zero components.
	 * @param duration The duration.
	 * @returns -1 for negative, 1 for positive, 0 for zero.
	 * @internal
	 */
	private static resolveSign(duration: IDuration): number {
		const fields = [
			duration.years,
			duration.months,
			duration.weeks,
			duration.days,
			duration.hours,
			duration.minutes,
			duration.seconds,
			duration.milliseconds,
			duration.microseconds,
			duration.nanoseconds
		];
		for (const field of fields) {
			const v = field ?? 0;
			if (v !== 0) {
				return v < 0 ? -1 : 1;
			}
		}
		return 0;
	}

	/**
	 * Format the sub-second components as a 9-digit fractional second string.
	 * @param milliseconds The milliseconds component.
	 * @param microseconds The microseconds component.
	 * @param nanoseconds The nanoseconds component.
	 * @returns The formatted fraction without a leading dot.
	 * @internal
	 */
	private static formatSecondFraction(
		milliseconds: number,
		microseconds: number,
		nanoseconds: number
	): string | undefined {
		if (milliseconds === 0 && microseconds === 0 && nanoseconds === 0) {
			return undefined;
		}

		const fraction = `${(milliseconds % 1000).toString().padStart(3, "0")}${(microseconds % 1000).toString().padStart(3, "0")}${(nanoseconds % 1000).toString().padStart(3, "0")}`;
		return fraction.replace(/0+$/u, "");
	}

	/**
	 * Normalize a numeric value to its absolute magnitude.
	 * @param value The value.
	 * @returns The absolute value, defaulting undefined to 0.
	 * @internal
	 */
	private static absolute(value: number | undefined): number {
		return Math.abs(value ?? 0);
	}

	/**
	 * Apply a global sign while normalizing zero values.
	 * @param value The value.
	 * @param sign The sign.
	 * @returns The signed value with zero normalized to +0.
	 * @internal
	 */
	private static applySign(value: number, sign: number): number {
		return value === 0 ? 0 : value * sign;
	}
}
