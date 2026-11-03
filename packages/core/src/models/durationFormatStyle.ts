// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Duration locale format styles.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const DurationFormatStyle = {
	/**
	 * Long, e.g. 1 hour, 30 minutes.
	 */
	Long: "long",

	/**
	 * Short, e.g. 1 hr, 30 min.
	 */
	Short: "short",

	/**
	 * Narrow, e.g. 1h 30m.
	 */
	Narrow: "narrow",

	/**
	 * Digital, e.g. 1:30:00.
	 */
	Digital: "digital"
} as const;

/**
 * Duration locale format styles.
 */
export type DurationFormatStyle = (typeof DurationFormatStyle)[keyof typeof DurationFormatStyle];
