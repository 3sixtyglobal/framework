// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * A caller queued on a mutex key, waiting to be handed the lock.
 */
export interface IMutexWaiter {
	/**
	 * Has the waiter already been granted the lock or given up waiting.
	 */
	settled: boolean;

	/**
	 * Resolves the queued caller, true when it now owns the lock.
	 */
	resolve?: (granted: boolean) => void;

	/**
	 * Timer which enforces the waiter's deadline.
	 */
	timer?: ReturnType<typeof setTimeout>;
}
