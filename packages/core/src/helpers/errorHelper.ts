// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { StringHelper } from "./stringHelper.js";
import { BaseError } from "../errors/baseError.js";
import type { IError } from "../models/IError.js";
import type { IValidationFailure } from "../models/IValidationFailure.js";
import { I18n } from "../utils/i18n.js";
import { Is } from "../utils/is.js";

/**
 * Error helper functions.
 */
export class ErrorHelper {
	/**
	 * Format errors and returns just their messages.
	 * @param error The error to format.
	 * @param options Options for formatting the error.
	 * @param options.includeStack Whether to include the stack trace in the output, defaults to false.
	 * @param options.includeAdditional Whether to include additional error information in the output, defaults to false.
	 * @returns The error formatted including any causes errors.
	 */
	public static formatErrors(
		error: unknown,
		options?: {
			includeStack?: boolean;
			includeAdditional?: boolean;
		}
	): string[] {
		const localizedErrors = ErrorHelper.localizeErrors(error);

		const output: string[] = [];

		const includeAdditional = options?.includeAdditional ?? false;
		const includeStack = options?.includeStack ?? false;

		for (const err of localizedErrors) {
			let detailedError = err.message;
			if (includeAdditional && Is.arrayValue(err.additional)) {
				detailedError += `\n${err.additional.join("\n")}`;
			}
			if (includeStack && Is.stringValue(err.stack)) {
				detailedError += `\n${err.stack}`;
			}
			output.push(detailedError);
		}

		return output;
	}

	/**
	 * Localize the content of an error and any causes.
	 * @param error The error to format.
	 * @returns The localized version of the errors flattened.
	 */
	public static localizeErrors(error: unknown): (IError & { additional?: string[] })[] {
		const formattedErrors: (IError & { additional?: string[] })[] = [];

		if (Is.notEmpty(error)) {
			const errors = BaseError.flatten(error);

			for (const err of errors) {
				const errorNameKey = `errorNames.${StringHelper.camelCase(err.name)}`;
				const errorMessageKey = `error.${err.message}`;

				// If there is no error message then it is probably
				// from a 3rd party lib, so don't format it just display
				const hasErrorName = I18n.hasMessage(errorNameKey);
				const hasErrorMessage = I18n.hasMessage(errorMessageKey);

				const localizedError: IError & { additional?: string[] } = {
					name: I18n.formatMessage(hasErrorName ? errorNameKey : "errorNames.error"),
					message: hasErrorMessage
						? I18n.formatMessage(errorMessageKey, err.properties)
						: err.message
				};

				if (Is.stringValue(err.source)) {
					localizedError.source = err.source;
				}
				if (Is.stringValue(err.stack)) {
					// Remove the first line from the stack traces as they
					// just have the error type and message duplicated
					const lines = err.stack.split("\n");
					lines.shift();
					localizedError.stack = lines.join("\n");
				}

				const additional = ErrorHelper.formatValidationErrors(err);
				if (Is.arrayValue(additional)) {
					localizedError.additional = additional;
				}

				formattedErrors.push(localizedError);
			}
		}

		return formattedErrors;
	}

	/**
	 * Localize the content of an error and any causes.
	 * @param error The error to format.
	 * @returns The localized version of the errors flattened.
	 */
	public static formatValidationErrors(error: IError): string[] | undefined {
		if (
			Is.object(error.properties) &&
			Object.keys(error.properties).length > 0 &&
			Is.object<{ validationFailures: IValidationFailure[] }>(error.properties) &&
			Is.arrayValue(error.properties.validationFailures)
		) {
			const validationErrors: string[] = [];
			for (const validationFailure of error.properties.validationFailures) {
				const errorI18n = `error.${validationFailure.reason}`;
				const errorMessage = I18n.hasMessage(errorI18n)
					? I18n.formatMessage(errorI18n, validationFailure.properties)
					: errorI18n;

				let v = `${validationFailure.property}: ${errorMessage}`;
				if (
					Is.object<{ value: unknown }>(validationFailure.properties) &&
					Is.notEmpty(validationFailure.properties.value)
				) {
					v += ` = ${JSON.stringify(validationFailure.properties.value)}`;
				}
				validationErrors.push(v);
			}
			return validationErrors;
		}
	}
}
