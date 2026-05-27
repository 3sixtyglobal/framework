// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Mutex message types.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const MutexMessageTypes = {
	/**
	 * Get buffer.
	 */
	GetBuffer: "twin:mutex:getBuffer"
} as const;

/**
 * Mutex message types.
 */
export type MutexMessageTypes = (typeof MutexMessageTypes)[keyof typeof MutexMessageTypes];
