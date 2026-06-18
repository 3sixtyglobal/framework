// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { nameof } from "@twin.org/nameof";
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
		const match =
			/^P(?:(\d+(?:\.\d+)?)Y)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)W)?(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/.exec(
				value
			);
		if (!match?.slice(1).some(Boolean)) {
			return undefined;
		}
		return {
			years: Number(match[1] ?? 0),
			months: Number(match[2] ?? 0),
			weeks: Number(match[3] ?? 0),
			days: Number(match[4] ?? 0),
			hours: Number(match[5] ?? 0),
			minutes: Number(match[6] ?? 0),
			seconds: Number(match[7] ?? 0)
		};
	}

	/**
	 * Convert a duration object to an ISO 8601 duration string.
	 * @param duration The duration to convert.
	 * @returns The ISO 8601 duration string (e.g. "P1Y2M3DT4H5M6S").
	 */
	public static toString(duration: IDuration): string {
		Guards.object<IDuration>(Duration.CLASS_NAME, nameof(duration), duration);
		const dateParts: string[] = [];
		if (duration.years !== 0) {
			dateParts.push(`${duration.years}Y`);
		}
		if (duration.months !== 0) {
			dateParts.push(`${duration.months}M`);
		}
		if (duration.weeks !== 0) {
			dateParts.push(`${duration.weeks}W`);
		}
		if (duration.days !== 0) {
			dateParts.push(`${duration.days}D`);
		}

		const timeParts: string[] = [];
		if (duration.hours !== 0) {
			timeParts.push(`${duration.hours}H`);
		}
		if (duration.minutes !== 0) {
			timeParts.push(`${duration.minutes}M`);
		}
		if (duration.seconds !== 0) {
			timeParts.push(`${duration.seconds}S`);
		}

		if (dateParts.length === 0 && timeParts.length === 0) {
			return "PT0S";
		}

		const timeSection = timeParts.length > 0 ? `T${timeParts.join("")}` : "";
		return `P${dateParts.join("")}${timeSection}`;
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
		return years + months + weeks + days + hours + minutes + duration.seconds;
	}
}
