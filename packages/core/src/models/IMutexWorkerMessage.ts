// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { MessagePort } from "node:worker_threads";
import type { MutexMessageTypes } from "./mutexMessageTypes.js";

/**
 * Message sent from a worker thread to the main thread to request a SharedArrayBuffer for a given mutex key.
 */
export interface IMutexWorkerMessage {
	/**
	 * The message type.
	 */
	type: typeof MutexMessageTypes.GetBuffer;

	/**
	 * The mutex key for which the buffer is requested.
	 */
	key: string;

	/**
	 * The SharedArrayBuffer for the mutex, sent from the worker to the main thread.
	 */
	signal: SharedArrayBuffer;

	/**
	 * The MessagePort for the main thread to respond with the buffer, sent from the worker to the main thread.
	 */
	port: MessagePort;
}
