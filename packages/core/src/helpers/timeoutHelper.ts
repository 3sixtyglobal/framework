// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { GeneralError } from "../errors/generalError.js";
import { Is } from "../utils/is.js";

/**
 * Helper for bounding operations which can fail to settle.
 */
export class TimeoutHelper {
	/**
	 * Reject an operation which has not settled within the given time.
	 * The operation itself cannot be cancelled, so a timed out operation is abandoned, which is
	 * the only option available when the identity wasm bindings panic instead of rejecting and
	 * leave the promise they returned pending forever.
	 * @param operation The operation to bound.
	 * @param timeoutMs The maximum time to wait in milliseconds, 0 or less waits indefinitely.
	 * @param source The source to use for the timeout error.
	 * @param message The message key to use for the timeout error.
	 * @param properties Additional properties to include in the timeout error.
	 * @returns The result of the operation.
	 * @throws GeneralError if the operation has not settled within timeoutMs.
	 */
	public static async withTimeout<T>(
		operation: Promise<T>,
		timeoutMs: number,
		source: string,
		message: string,
		properties?: { [id: string]: unknown }
	): Promise<T> {
		if (timeoutMs <= 0) {
			return operation;
		}

		let timer: ReturnType<typeof setTimeout> | undefined;

		try {
			return await Promise.race([
				operation,
				new Promise<never>((resolve, reject) => {
					timer = setTimeout(() => {
						reject(new GeneralError(source, message, { ...properties, timeoutMs }));
					}, timeoutMs);
				})
			]);
		} finally {
			if (!Is.undefined(timer)) {
				clearTimeout(timer);
			}
		}
	}
}
