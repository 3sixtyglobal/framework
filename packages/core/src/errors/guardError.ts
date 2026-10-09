// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { nameof } from "@3sixty/nameof";
import { BaseError } from "./baseError.js";
import { Is } from "../utils/is.js";

/**
 * Class to handle errors which are triggered by data guards.
 */
export class GuardError extends BaseError {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<GuardError>();

	/**
	 * Create a new instance of GuardError.
	 * @param source The source of the error.
	 * @param message The message as an i18n key.
	 * @param propertyName The property which triggered the guard error for the item.
	 * @param propertyValue The property value which triggered the guard error for the item.
	 * @param propertyOptions The property options which might be allowed.
	 */
	constructor(
		source: string,
		message: string,
		propertyName: string,
		propertyValue: unknown,
		propertyOptions?: string
	) {
		super(GuardError.CLASS_NAME, source, message, {
			property: propertyName ?? "property",
			value: Is.undefined(propertyValue) ? "undefined" : propertyValue,
			options: propertyOptions
		});
	}
}
