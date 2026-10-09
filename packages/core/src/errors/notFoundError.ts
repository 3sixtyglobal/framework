// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { nameof } from "@3sixty/nameof";
import { BaseError } from "./baseError.js";

/**
 * Class to handle errors which are triggered by data not being found.
 */
export class NotFoundError extends BaseError {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<NotFoundError>();

	/**
	 * Create a new instance of NotFoundError.
	 * @param source The source of the error.
	 * @param message The message as an i18n key.
	 * @param notFoundId The id for the item.
	 * @param properties Any additional information for the error.
	 * @param cause The cause of the error if we have wrapped another error.
	 */
	constructor(
		source: string,
		message: string,
		notFoundId?: string,
		properties?: { [id: string]: unknown },
		cause?: unknown
	) {
		super(NotFoundError.CLASS_NAME, source, message, { notFoundId, ...properties }, cause);
	}
}
