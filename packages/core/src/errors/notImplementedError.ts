// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { nameof } from "@3sixty/nameof";
import { BaseError } from "./baseError.js";

/**
 * Class to handle errors raised when a method has not been implemented.
 */
export class NotImplementedError extends BaseError {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<NotImplementedError>();

	/**
	 * Create a new instance of NotImplementedError.
	 * @param source The source of the error.
	 * @param method The method for the error.
	 * @param properties Any additional information for the error.
	 * @param cause The cause of the error if we have wrapped another error.
	 */
	constructor(
		source: string,
		method: string,
		properties?: { [id: string]: unknown },
		cause?: unknown
	) {
		super(
			NotImplementedError.CLASS_NAME,
			source,
			"common.notImplementedMethod",
			{
				method,
				...properties
			},
			cause
		);
	}
}
