// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { nameof } from "@twin.org/nameof";
import { BaseError } from "./baseError.js";

/**
 * Class to handle errors which are triggered by conflicting data.
 */
export class ConflictError extends BaseError {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<ConflictError>();

	/**
	 * Create a new instance of ConflictError.
	 * @param source The source of the error.
	 * @param message The message as an i18n key.
	 * @param conflictId The id that has conflicts.
	 * @param conflicts The conflicts that occurred.
	 * @param properties Any additional information for the error.
	 * @param cause The cause of the error if we have wrapped another error.
	 */
	constructor(
		source: string,
		message: string,
		conflictId?: string,
		conflicts?: string[],
		properties?: { [id: string]: unknown },
		cause?: unknown
	) {
		super(
			ConflictError.CLASS_NAME,
			source,
			message,
			{ conflictId, conflicts, ...properties },
			cause
		);
	}
}
