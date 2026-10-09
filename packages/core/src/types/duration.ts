// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { nameof } from "@3sixty/nameof";
import { DURATION_REG_EXP } from "./durationRegExp.js";
import type { IDuration } from "../models/IDuration.js";
import { Guards } from "../utils/guards.js";

/**
 * Helper methods for working with ISO 8601 durations.
 */
export class Duration {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<Duration>();

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
	 * Convert a duration object to total seconds.
	 * Year and month components use the average values 365.25 days and 30.4375 days.
	 * @param duration The duration to convert.
	 * @returns The total number of seconds.
	 */
	public static toSeconds(duration: IDuration): number {
		Guards.object<IDuration>(Duration.CLASS_NAME, nameof(duration), duration);
		const years = duration.years * 31_557_600;
		const months = duration.months * 2_629_800;
		const weeks = duration.weeks * 604_800;
		const days = duration.days * 86_400;
		const hours = duration.hours * 3_600;
		const minutes = duration.minutes * 60;
		const milliseconds = (duration.milliseconds ?? 0) / 1_000;
		const microseconds = (duration.microseconds ?? 0) / 1_000_000;
		const nanoseconds = (duration.nanoseconds ?? 0) / 1_000_000_000;
		return (
			years +
			months +
			weeks +
			days +
			hours +
			minutes +
			duration.seconds +
			milliseconds +
			microseconds +
			nanoseconds
		);
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
