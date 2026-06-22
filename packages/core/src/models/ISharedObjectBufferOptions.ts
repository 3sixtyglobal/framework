// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Options for configuring buffer capacity when creating a shared object buffer.
 */
export interface ISharedObjectBufferOptions {
	/**
	 * Initial payload capacity hint in bytes.
	 * Only honoured when the buffer does not yet exist; ignored on subsequent writes.
	 * @default 1 MiB.
	 */
	initialCapacityBytes?: number;

	/**
	 * Maximum allowed payload capacity in bytes. The buffer will never grow beyond this limit.
	 * Only honoured when the buffer does not yet exist; ignored on subsequent writes.
	 * @default 256 MiB.
	 */
	maxCapacityBytes?: number;
}
