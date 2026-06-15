// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HexHelper } from "../helpers/hexHelper.js";

/**
 * Class to check types of objects.
 */
export class Is {
	/**
	 * Is the property undefined.
	 * @param value The value to test.
	 * @returns True if the value is undefined.
	 */
	public static undefined(value: unknown): value is undefined {
		return value === undefined;
	}

	/**
	 * Is the property null.
	 * @param value The value to test.
	 * @returns True if the value is null.
	 */
	public static null(value: unknown): value is null {
		return value === null;
	}

	/**
	 * Is the property null or undefined.
	 * @param value The value to test.
	 * @returns True if the value is null or undefined.
	 */
	public static empty(value: unknown): value is undefined | null {
		return value === null || value === undefined;
	}

	/**
	 * Is the property not null or undefined.
	 * @param value The value to test.
	 * @returns True if the value is not null or undefined.
	 */
	public static notEmpty(value: unknown): boolean {
		return value !== null && value !== undefined;
	}

	/**
	 * Is the value a string.
	 * @param value The value to test.
	 * @returns True if the value is a string.
	 */
	public static string(value: unknown): value is string {
		return typeof value === "string";
	}

	/**
	 * Is the value a non-empty string.
	 * @param value The value to test.
	 * @returns True if the value is a non-empty string.
	 */
	public static stringValue(value: unknown): value is string {
		return Is.string(value) && value.trim().length > 0;
	}

	/**
	 * Is the value a JSON string.
	 * @param value The value to test.
	 * @returns True if the value is a JSON string.
	 */
	public static json(value: unknown): value is string {
		if (!Is.stringValue(value)) {
			return false;
		}

		try {
			const json = JSON.parse(value);
			return (
				Is.object(json) ||
				Is.array(json) ||
				Is.string(json) ||
				Is.number(json) ||
				Is.boolean(json) ||
				Is.null(json)
			);
		} catch {
			return false;
		}
	}

	/**
	 * Is the value a base64 string.
	 * @param value The value to test.
	 * @returns True if the value is a base64 string.
	 */
	public static stringBase64(value: unknown): value is string {
		return (
			Is.stringValue(value) &&
			// eslint-disable-next-line unicorn/better-regex
			/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)
		);
	}

	/**
	 * Is the value a base64 url string.
	 * @param value The value to test.
	 * @returns True if the value is a base64 string.
	 */
	public static stringBase64Url(value: unknown): value is string {
		return (
			Is.stringValue(value) &&
			// eslint-disable-next-line unicorn/better-regex
			/^([A-Za-z0-9-_])*$/.test(value)
		);
	}

	/**
	 * Is the value a base58 string.
	 * @param value The value to test.
	 * @returns True if the value is a base58 string.
	 */
	public static stringBase58(value: unknown): value is string {
		return (
			Is.stringValue(value) &&
			// eslint-disable-next-line unicorn/better-regex
			/^[A-HJ-NP-Za-km-z1-9]*$/.test(value)
		);
	}

	/**
	 * Is the value a hex string.
	 * @param value The value to test.
	 * @param allowPrefix Allow the hex to have the 0x prefix.
	 * @returns True if the value is a hex string.
	 */
	public static stringHex(value: unknown, allowPrefix: boolean = false): value is string {
		return Is.string(value) && HexHelper.isHex(value, allowPrefix);
	}

	/**
	 * Is the value a hex string of fixed length.
	 * @param value The value to test.
	 * @param length The length to test.
	 * @param allowPrefix Allow the hex to have the 0x prefix.
	 * @returns True if the value is a hex string of required length.
	 */
	public static stringHexLength(
		value: unknown,
		length: number,
		allowPrefix: boolean = false
	): value is string {
		return Is.stringHex(value, allowPrefix) && value.length === length;
	}

	/**
	 * Is the value a number.
	 * @param value The value to test.
	 * @returns True if the value is a number.
	 */
	public static number(value: unknown): value is number {
		return typeof value === "number" && Number.isFinite(value) && !Number.isNaN(value);
	}

	/**
	 * Is the value an integer.
	 * @param value The value to test.
	 * @returns True if the value is an integer.
	 */
	public static integer(value: unknown): value is number {
		return Is.number(value) && Number.isInteger(value);
	}

	/**
	 * Is the value a big integer.
	 * @param value The value to test.
	 * @returns True if the value is a big integer.
	 */
	public static bigint(value: unknown): value is bigint {
		return typeof value === "bigint";
	}

	/**
	 * Is the value a boolean.
	 * @param value The value to test.
	 * @returns True if the value is a boolean.
	 */
	public static boolean(value: unknown): value is boolean {
		return typeof value === "boolean";
	}

	/**
	 * Is the value a date.
	 * @param value The value to test.
	 * @returns True if the value is a date.
	 */
	public static date(value: unknown): value is Date {
		return (
			Object.prototype.toString.call(value) === "[object Date]" &&
			!Number.isNaN((value as Date).getTime())
		);
	}

	/**
	 * Is the value an empty date.
	 * @param value The value to test.
	 * @returns True if the value is an empty date.
	 */
	public static dateEmpty(value: unknown): boolean {
		return (
			Object.prototype.toString.call(value) === "[object Date]" &&
			Number.isNaN((value as Date).getTime())
		);
	}

	/**
	 * Is the value a date string.
	 * @param value The value to test.
	 * @returns True if the value is a string in ISO 8601 date format.
	 */
	public static dateString(value: unknown): boolean {
		if (typeof value !== "string" || value.length === 0 || value.includes("T")) {
			return false;
		}
		return !Number.isNaN(Date.parse(value));
	}

	/**
	 * Is the value a date string.
	 * @param value The value to test.
	 * @returns True if the value is a string in ISO 8601 date/time format.
	 */
	public static dateTimeString(value: unknown): boolean {
		if (typeof value !== "string" || value.length === 0 || !value.includes("T")) {
			return false;
		}
		return !Number.isNaN(Date.parse(value));
	}

	/**
	 * Is the value a time string.
	 * @param value The value to test.
	 * @returns True if the value is a string in ISO 8601 time format.
	 */
	public static timeString(value: unknown): boolean {
		if (typeof value !== "string" || value.length === 0 || value.includes("T")) {
			return false;
		}
		return !Number.isNaN(Date.parse(`1970-01-01T${value}`));
	}

	/**
	 * Is the value a timestamp in seconds.
	 * @param value The value to test.
	 * @returns True if the value is a timestamp in seconds.
	 */
	public static timestampSeconds(value: unknown): value is number {
		if (!Is.integer(value)) {
			return false;
		}

		return value.toString().length < 12;
	}

	/**
	 * Is the value a timestamp in milliseconds.
	 * @param value The value to test.
	 * @returns True if the value is a timestamp in milliseconds.
	 */
	public static timestampMilliseconds(value: unknown): value is number {
		if (!Is.integer(value)) {
			return false;
		}

		return value.toString().length >= 12;
	}

	/**
	 * Is the value an object.
	 * @param value The value to test.
	 * @returns True if the value is a object.
	 */
	public static object<T = { [id: string]: unknown }>(value: unknown): value is T {
		return typeof value === "object" && value !== null && !Array.isArray(value);
	}

	/**
	 * Is the value an object with at least one property.
	 * @param value The value to test.
	 * @returns True if the value is a object.
	 */
	public static objectValue<T = { [id: string]: unknown }>(value: unknown): value is T {
		return (
			typeof value === "object" &&
			value !== null &&
			!Array.isArray(value) &&
			Object.keys(value).length > 0
		);
	}

	/**
	 * Is the value an array.
	 * @param value The value to test.
	 * @returns True if the value is an array.
	 */
	public static array<T>(value: unknown): value is T[] {
		return Array.isArray(value);
	}

	/**
	 * Is the value an array with at least one element.
	 * @param value The value to test.
	 * @returns True if the value is an array with at least one element.
	 */
	public static arrayValue<T>(value: unknown): value is T[] {
		return Array.isArray(value) && value.length > 0;
	}

	/**
	 * Is the value an array with at least one element.
	 * @param value The value to test.
	 * @param options The options the value must be one of.
	 * @returns True if the value is an element from the options array.
	 */
	public static arrayOneOf<T>(value: T, options: T[]): value is T {
		if (Is.empty(value) || !Is.array<T>(options) || !options.includes(value)) {
			return false;
		}

		return true;
	}

	/**
	 * Is the value a Uint8Array.
	 * @param value The value to test.
	 * @returns True if the value is a Uint8Array.
	 */
	public static uint8Array(value: unknown): value is Uint8Array {
		// This is the only way we can reliably check for Uint8Array
		// eslint-disable-next-line no-restricted-syntax
		return value instanceof Uint8Array;
	}

	/**
	 * Is the value a TypedArray.
	 * @param value The value to test.
	 * @returns True if the value is a TypedArray.
	 */
	public static typedArray(
		value: unknown
	): value is
		| Uint8Array
		| Int8Array
		| Uint16Array
		| Int16Array
		| Uint32Array
		| Int32Array
		| Float32Array
		| Float64Array {
		// This is the only way we can reliably check for TypedArray
		// eslint-disable-next-line no-restricted-syntax
		return value instanceof Object.getPrototypeOf(Uint8Array);
	}

	/**
	 * Is the property a function.
	 * @param value The value to test.
	 * @returns True if the value is a function.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static function<T extends (...args: any[]) => any = (...args: any[]) => any>(
		value: unknown
	): value is T {
		return typeof value === "function";
	}

	/**
	 * Is the value a string formatted as an email address.
	 * @param value The value to test.
	 * @returns True if the value is a string.
	 */
	public static email(value: unknown): value is string {
		return (
			Is.stringValue(value) &&
			/^[\w!#$%&'*+./=?^`{|}~-]+@[\dA-Za-z](?:[\dA-Za-z-]{0,61}[\dA-Za-z])?(?:\.[\dA-Za-z](?:[\dA-Za-z-]{0,61}[\dA-Za-z])?)*$/.test(
				value
			)
		);
	}

	/**
	 * Is the value a promise.
	 * @param value The value to test.
	 * @returns True if the value is a promise.
	 */
	public static promise<T = unknown>(value: unknown): value is Promise<T> {
		// This is the only way we can reliably check for Promise
		// eslint-disable-next-line no-restricted-syntax
		return value instanceof Promise;
	}

	/**
	 * Is the value a regexp.
	 * @param value The value to test.
	 * @returns True if the value is a regexp.
	 */
	public static regexp(value: unknown): value is RegExp {
		// This is the only way we can reliably check for RegExp
		// eslint-disable-next-line no-restricted-syntax
		return value instanceof RegExp;
	}

	/**
	 * Is the provided object a class constructor.
	 * @param obj The object to check.
	 * @returns True if the object is a class, false otherwise.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static class<T = unknown>(obj: unknown): obj is new (...args: any[]) => T {
		if (typeof obj !== "function") {
			return false;
		}
		const str = Function.prototype.toString.call(obj);
		return /^class\s/.test(str);
	}

	/**
	 * Is the value a uuidV7 string.
	 * @param value The value to test.
	 * @param format The format of the UUIDv7 string.
	 * @returns True if the value is a uuidV7 string.
	 */
	public static uuidV7(value: unknown, format?: "standard" | "compact"): value is string {
		if (format === "compact") {
			// 32 hex chars, where:
			// - char 13 (0-based index 12) is the version (7)
			// - char 17 (0-based index 16) is the variant (8, 9, a, b)
			return Is.stringValue(value) && /^[\da-f]{12}7[\da-f]{3}[89ab][\da-f]{15}$/i.test(value);
		}

		return (
			Is.stringValue(value) &&
			/^[\da-f]{8}-[\da-f]{4}-7[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(value)
		);
	}
}
