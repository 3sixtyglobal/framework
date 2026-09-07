// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Is } from "../utils/is.js";

/**
 * Helper for bounding operations which can fail to settle.
 */
export class TimeoutHelper {
	/**
	 * Stop waiting for an operation which has not settled within the given time.
	 * The operation itself cannot be cancelled, so a timed out operation is abandoned, which is
	 * the only option available when the code being called can leave the promise it returned
	 * pending forever.
	 * @param operation The operation to bound.
	 * @param timeoutMs The maximum time to wait in milliseconds, 0 or less waits indefinitely.
	 * @param onTimeout Called when the wait expires, throw from it to fail the operation, or
	 * return a value to complete it with that value instead.
	 * @returns The result of the operation, or the value returned by onTimeout.
	 */
	public static async withTimeout<T>(
		operation: Promise<T>,
		timeoutMs: number,
		onTimeout: () => T
	): Promise<T> {
		if (timeoutMs <= 0) {
			return operation;
		}

		let timer: ReturnType<typeof setTimeout> | undefined;

		try {
			return await Promise.race([
				operation,
				new Promise<T>((resolve, reject) => {
					timer = setTimeout(() => {
						try {
							resolve(onTimeout());
						} catch (error) {
							reject(error);
						}
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
