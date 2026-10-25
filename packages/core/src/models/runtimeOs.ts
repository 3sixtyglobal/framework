// Copyright 2026 3Sixty Trade Ltd.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The operating systems that can be detected.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const RuntimeOs = {
	/**
	 * Windows.
	 */
	Windows: "windows",

	/**
	 * macOS.
	 */
	Mac: "mac",

	/**
	 * Linux.
	 */
	Linux: "linux",

	/**
	 * An operating system that could not be identified.
	 */
	Unknown: "unknown"
} as const;

/**
 * The operating systems that can be detected.
 */
export type RuntimeOs = (typeof RuntimeOs)[keyof typeof RuntimeOs];
