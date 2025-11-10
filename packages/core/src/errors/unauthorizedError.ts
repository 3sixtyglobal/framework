// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { nameof } from "@twin.org/nameof";
import { BaseError } from "./baseError.js";

/**
 * Class to handle errors which are triggered by access not being unauthorized.
 */
export class UnauthorizedError extends BaseError {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<UnauthorizedError>();

	/**
	 * Create a new instance of UnauthorizedError.
	 * @param source The source of the error.
	 * @param message The message as a code.
	 * @param properties Any additional information for the error.
	 * @param cause The cause of the error if we have wrapped another error.
	 */
	constructor(
		source: string,
		message: string,
		properties?: { [id: string]: unknown },
		cause?: unknown
	) {
		super(UnauthorizedError.CLASS_NAME, source, message, properties, cause);
	}
}
