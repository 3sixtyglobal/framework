// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { MessagePort } from "node:worker_threads";
import type { ISharedObjectBufferOptions } from "./ISharedObjectBufferOptions.js";
import type { SharedObjectBufferMessageTypes } from "./sharedObjectBufferMessageTypes.js";

/**
 * Message sent from a worker thread to the main thread to request the SharedArrayBuffer for an object.
 */
export interface ISharedObjectBufferWorkerMessage {
	/**
	 * The message type discriminant.
	 */
	type: typeof SharedObjectBufferMessageTypes.GetBuffer;

	/**
	 * The object id name that identifies which buffer is being requested.
	 */
	objectId: string;

	/**
	 * One-shot SharedArrayBuffer used for the Atomics.wait/notify handshake so the
	 * worker can block synchronously until the main thread has posted the response.
	 */
	signal: SharedArrayBuffer;

	/**
	 * MessagePort through which the main thread returns the object buffer.
	 */
	port: MessagePort;

	/**
	 * Options for creating or fetching the buffer.
	 */
	options?: ISharedObjectBufferOptions;
}
