// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Message type constants for the SharedObjectBuffer worker-to-main-thread protocol.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const SharedObjectBufferMessageTypes = {
	/**
	 * Worker requests the SharedArrayBuffer for a named object from the main thread.
	 */
	GetBuffer: "twin:sharedObjectBuffer:getBuffer"
} as const;

/**
 * Union of all SharedObjectBuffer message type strings.
 */
export type SharedObjectBufferMessageTypes =
	(typeof SharedObjectBufferMessageTypes)[keyof typeof SharedObjectBufferMessageTypes];
