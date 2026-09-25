// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Options for module resolution.
 */
export interface IModuleHelperOptions {
	/**
	 * The directory used to resolve local and package modules.
	 */
	executionDirectory: string;

	/**
	 * The maximum size in MB for modules downloaded over https.
	 * @default 10
	 */
	maxSizeMb?: number;

	/**
	 * The cache directory for npm and https modules, relative to the execution directory.
	 * @default .tmp
	 */
	cacheDirectory?: string;

	/**
	 * The time to live in hours for cached https modules.
	 * @default 24
	 */
	cacheTtlHours?: number;

	/**
	 * Force https modules to be downloaded again even if they are cached.
	 * @default false
	 */
	forceRefresh?: boolean;

	/**
	 * Callback for progress and warning messages, the callback is responsible for formatting.
	 * @param level The level of the message.
	 * @param key The locale key of the message.
	 * @param properties The properties to format the message with.
	 */
	onMessage?: (
		level: "info" | "warning",
		key: string,
		properties?: { [id: string]: unknown }
	) => void;
}
