// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { nameof } from "@3sixty/nameof";
import { ObjectHelper } from "./objectHelper.js";
import { StringHelper } from "./stringHelper.js";
import { GeneralError } from "../errors/generalError.js";
import { Coerce } from "../utils/coerce.js";
import { Guards } from "../utils/guards.js";
import { Is } from "../utils/is.js";

/**
 * Environment variable helper.
 */
export class EnvHelper {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<EnvHelper>();

	/**
	 * Get the environment variable as an object with camel cased names.
	 * @param envVars The environment variables.
	 * @param prefix The prefix of the environment variables, if not provided gets all.
	 * @returns The object with camel cased names.
	 */
	public static envToJson<T = { [id: string]: string }>(
		envVars: { [id: string]: string | undefined },
		prefix?: string
	): T {
		const result: { [id: string]: string } = {};

		if (Is.object(envVars)) {
			if (Is.empty(prefix)) {
				for (const envVar in envVars) {
					if (Is.stringValue(envVars[envVar])) {
						ObjectHelper.propertySet(
							result,
							EnvHelper.envVarKeyToJsonKey(envVar, prefix),
							envVars[envVar]
						);
					}
				}
			} else {
				for (const envVar in envVars) {
					if (envVar.startsWith(prefix) && Is.stringValue(envVars[envVar])) {
						ObjectHelper.propertySet(
							result,
							EnvHelper.envVarKeyToJsonKey(envVar, prefix),
							envVars[envVar]
						);
					}
				}
			}
		}

		return result as T;
	}

	/**
	 * Convert an environment variable key to a JSON key.
	 * A trailing _* or * is preserved as a wildcard suffix (e.g. TWIN_REST_PATH_* → "restPath*").
	 * @param envVarKey The environment variable key.
	 * @param prefix The prefix of the environment variable key, if not provided gets all.
	 * @returns The JSON key.
	 */
	public static envVarKeyToJsonKey(envVarKey: string, prefix?: string): string {
		const isWildcard = envVarKey.endsWith("*");
		if (isWildcard) {
			envVarKey = envVarKey.replace(/_?\*$/, "");
		}
		if (Is.stringValue(prefix) && envVarKey.startsWith(prefix)) {
			envVarKey = envVarKey.replace(prefix, "");
		}
		const camelKey = StringHelper.camelCase(envVarKey.toLowerCase());
		return isWildcard ? `${camelKey}*` : camelKey;
	}

	/**
	 * Convert a JSON key to an environment variable key.
	 * @param jsonKey The JSON key.
	 * @param prefix The prefix of the environment variable key, if not provided gets all.
	 * @returns The environment variable key.
	 */
	public static jsonKeyToEnvVarKey(jsonKey: string, prefix?: string): string {
		const envVarKey = StringHelper.snakeCase(jsonKey).toUpperCase();
		if (Is.stringValue(prefix)) {
			return `${prefix}${envVarKey}`;
		}
		return envVarKey;
	}

	/**
	 * Returns an env var as a string when it holds a non-empty value, falling back to the supplied default.
	 * @param envVars The environment variables object.
	 * @param key The property name of the env var to read.
	 * @param defaultValue The value to return when the env var is absent or empty. Omit to return undefined when absent.
	 * @returns The string value, the default, or undefined when absent and no default given.
	 */
	public static envString<T>(envVars: T, key: keyof T, defaultValue: string): string;
	public static envString<T>(envVars: T, key: keyof T): string | undefined;
	public static envString<T>(envVars: T, key: keyof T, defaultValue?: string): string | undefined {
		const value = envVars[key];
		return Is.stringValue(value) ? value : defaultValue;
	}

	/**
	 * Returns an env var constrained to one of the supplied choices, falling back to the supplied default.
	 * @param envVars The environment variables object.
	 * @param key The property name of the env var to read.
	 * @param choices The permitted values for the env var.
	 * @param defaultValue The value to return when the env var is absent or empty. Omit to return undefined when absent.
	 * @returns The matching choice, the default, or undefined when absent and no default given.
	 * @throws GeneralError if the value is set but is not one of the choices.
	 */
	public static envChoice<T, U extends string>(
		envVars: T,
		key: keyof T,
		choices: readonly U[],
		defaultValue: U
	): U;
	public static envChoice<T, U extends string>(
		envVars: T,
		key: keyof T,
		choices: readonly U[]
	): U | undefined;
	public static envChoice<T, U extends string>(
		envVars: T,
		key: keyof T,
		choices: readonly U[],
		defaultValue?: U
	): U | undefined {
		const value = envVars[key];
		if (!Is.stringValue(value)) {
			return defaultValue;
		}
		if (!choices.includes(value as U)) {
			throw new GeneralError(EnvHelper.CLASS_NAME, "invalidEnvVarValue", {
				key,
				value,
				type: choices.join(" | ")
			});
		}
		return value as U;
	}

	/**
	 * Coerces an env var to a boolean, falling back to the supplied default when not set.
	 * @param envVars The environment variables object.
	 * @param key The property name of the env var to coerce.
	 * @param defaultValue The value to return when the env var is absent. Omit to return undefined when absent.
	 * @returns The boolean value, the default, or undefined when absent and no default given.
	 * @throws GeneralError if the value is set but cannot be coerced to a boolean.
	 */
	public static envBoolean<T>(envVars: T, key: keyof T, defaultValue: boolean): boolean;
	public static envBoolean<T>(envVars: T, key: keyof T): boolean | undefined;
	public static envBoolean<T>(
		envVars: T,
		key: keyof T,
		defaultValue?: boolean
	): boolean | undefined {
		const value = envVars[key];
		if (!Is.stringValue(value)) {
			return defaultValue;
		}
		const result = Coerce.boolean(value);
		if (Is.empty(result)) {
			throw new GeneralError(EnvHelper.CLASS_NAME, "invalidEnvVarValue", {
				key,
				value,
				type: "boolean"
			});
		}
		return result;
	}

	/**
	 * Coerces an env var that is already in milliseconds to an integer.
	 * @param envVars The environment variables object.
	 * @param key The property name of the env var to coerce.
	 * @param defaultValue The value to return when the env var is absent. Omit to return undefined when absent.
	 * @returns The millisecond value, the default, or undefined when absent and no default given.
	 * @throws GeneralError if the value is set but cannot be coerced to an integer.
	 */
	public static envMs<T>(envVars: T, key: keyof T, defaultValue: number): number;
	public static envMs<T>(envVars: T, key: keyof T): number | undefined;
	public static envMs<T>(envVars: T, key: keyof T, defaultValue?: number): number | undefined {
		const value = envVars[key];
		if (!Is.stringValue(value)) {
			return defaultValue;
		}
		const result = Coerce.integer(value);
		if (Is.empty(result)) {
			throw new GeneralError(EnvHelper.CLASS_NAME, "invalidEnvVarValue", {
				key,
				value,
				type: "integer"
			});
		}
		return result;
	}

	/**
	 * Coerces an env var that represents an integer count or size to an integer.
	 * @param envVars The environment variables object.
	 * @param key The property name of the env var to coerce.
	 * @param defaultValue The value to return when the env var is absent. Omit to return undefined when absent.
	 * @returns The count, the default, or undefined when absent and no default given.
	 * @throws GeneralError if the value is set but cannot be coerced to an integer.
	 */
	public static envCount<T>(envVars: T, key: keyof T, defaultValue: number): number;
	public static envCount<T>(envVars: T, key: keyof T): number | undefined;
	public static envCount<T>(envVars: T, key: keyof T, defaultValue?: number): number | undefined {
		const value = envVars[key];
		if (!Is.stringValue(value)) {
			return defaultValue;
		}
		const result = Coerce.integer(value);
		if (Is.empty(result)) {
			throw new GeneralError(EnvHelper.CLASS_NAME, "invalidEnvVarValue", {
				key,
				value,
				type: "integer"
			});
		}
		return result;
	}

	/**
	 * Coerces an env var that represents an integer to an actual integer.
	 * @param envVars The environment variables object.
	 * @param key The property name of the env var to coerce.
	 * @param defaultValue The value to return when the env var is absent. Omit to return undefined when absent.
	 * @returns The integer, the default, or undefined when absent and no default given.
	 * @throws GeneralError if the value is set but cannot be coerced to an integer.
	 */
	public static envInteger<T>(envVars: T, key: keyof T, defaultValue: number): number;
	public static envInteger<T>(envVars: T, key: keyof T): number | undefined;
	public static envInteger<T>(envVars: T, key: keyof T, defaultValue?: number): number | undefined {
		const value = envVars[key];
		if (!Is.stringValue(value)) {
			return defaultValue;
		}
		const result = Coerce.integer(value);
		if (Is.empty(result)) {
			throw new GeneralError(EnvHelper.CLASS_NAME, "invalidEnvVarValue", {
				key,
				value,
				type: "integer"
			});
		}
		return result;
	}

	/**
	 * Returns an env var as a typed object. Accepts a pre-parsed object, an inline JSON object string,
	 * or a value already expanded from a @json: file reference.
	 * @param envVars The environment variables object.
	 * @param key The property name of the env var to coerce.
	 * @param defaultValue The value to return when the env var is absent or cannot be parsed.
	 * @returns The parsed object, or the default when absent or the value cannot be parsed.
	 */
	public static envObject<T, U>(envVars: T, key: keyof T, defaultValue: U): U;
	/**
	 * Returns an env var as a typed object. Accepts a pre-parsed object, an inline JSON object string,
	 * or a value already expanded from a @json: file reference.
	 * @param envVars The environment variables object.
	 * @param key The property name of the env var to coerce.
	 * @returns The parsed object, or undefined when the var is absent or the value cannot be parsed.
	 */
	public static envObject<T, U>(envVars: T, key: keyof T): U | undefined;
	public static envObject<T, U>(envVars: T, key: keyof T, defaultValue?: U): U | undefined {
		const value: unknown = envVars[key];
		if (Is.undefined(value)) {
			return defaultValue;
		}
		return Coerce.object<U>(value) ?? defaultValue;
	}

	/**
	 * Returns an env var as a typed array. Accepts a pre-parsed array, an inline JSON array string,
	 * or a value already expanded from a @json: file reference.
	 * @param envVars The environment variables object.
	 * @param key The property name of the env var to coerce.
	 * @param defaultValue The value to return when the env var is absent or cannot be parsed.
	 * @returns The parsed array, or the default when absent or the value cannot be parsed.
	 */
	public static envArray<T, U>(envVars: T, key: keyof T, defaultValue: U[]): U[];
	/**
	 * Returns an env var as a typed array. Accepts a pre-parsed array, an inline JSON array string,
	 * or a value already expanded from a @json: file reference.
	 * @param envVars The environment variables object.
	 * @param key The property name of the env var to coerce.
	 * @returns The parsed array, or undefined when the var is absent or the value cannot be parsed.
	 */
	public static envArray<T, U>(envVars: T, key: keyof T): U[] | undefined;
	public static envArray<T, U>(envVars: T, key: keyof T, defaultValue?: U[]): U[] | undefined {
		const value: unknown = envVars[key];
		if (Is.undefined(value)) {
			return defaultValue;
		}
		return Coerce.array<U>(value) ?? defaultValue;
	}

	/**
	 * Coerces an env var that is already in seconds to an integer.
	 * @param envVars The environment variables object.
	 * @param key The property name of the env var to coerce.
	 * @param defaultValue The value to return when the env var is absent. Omit to return undefined when absent.
	 * @returns The second value, the default, or undefined when absent and no default given.
	 * @throws GeneralError if the value is set but cannot be coerced to an integer.
	 */
	public static envSeconds<T>(envVars: T, key: keyof T, defaultValue: number): number;
	public static envSeconds<T>(envVars: T, key: keyof T): number | undefined;
	public static envSeconds<T>(envVars: T, key: keyof T, defaultValue?: number): number | undefined {
		const value = envVars[key];
		if (!Is.stringValue(value)) {
			return defaultValue;
		}
		const result = Coerce.integer(value);
		if (Is.empty(result)) {
			throw new GeneralError(EnvHelper.CLASS_NAME, "invalidEnvVarValue", {
				key,
				value,
				type: "integer"
			});
		}
		return result;
	}

	/**
	 * Coerces an env var that is already in minutes to an integer.
	 * @param envVars The environment variables object.
	 * @param key The property name of the env var to coerce.
	 * @param defaultValue The value to return when the env var is absent. Omit to return undefined when absent.
	 * @returns The minute value, the default, or undefined when absent and no default given.
	 * @throws GeneralError if the value is set but cannot be coerced to an integer.
	 */
	public static envMinutes<T>(envVars: T, key: keyof T, defaultValue: number): number;
	public static envMinutes<T>(envVars: T, key: keyof T): number | undefined;
	public static envMinutes<T>(envVars: T, key: keyof T, defaultValue?: number): number | undefined {
		const value = envVars[key];
		if (!Is.stringValue(value)) {
			return defaultValue;
		}
		const result = Coerce.integer(value);
		if (Is.empty(result)) {
			throw new GeneralError(EnvHelper.CLASS_NAME, "invalidEnvVarValue", {
				key,
				value,
				type: "integer"
			});
		}
		return result;
	}

	/**
	 * Coerces an env var that is a datetime string, throwing when the value is set but not a valid datetime.
	 * @param envVars The environment variables object.
	 * @param key The property name of the env var to coerce.
	 * @param defaultValue The value to return when the env var is absent. Omit to return undefined when absent.
	 * @returns The datetime ISO string, the default, or undefined when absent and no default given.
	 * @throws GeneralError if the value is set but cannot be coerced to a datetime.
	 */
	public static envDateTime<T>(envVars: T, key: keyof T, defaultValue: string): string;
	public static envDateTime<T>(envVars: T, key: keyof T): string | undefined;
	public static envDateTime<T>(
		envVars: T,
		key: keyof T,
		defaultValue?: string
	): string | undefined {
		const value = envVars[key];
		if (!Is.stringValue(value)) {
			return defaultValue;
		}
		const result = Coerce.dateTime(value) ?? Coerce.date(value);
		if (Is.empty(result)) {
			throw new GeneralError(EnvHelper.CLASS_NAME, "invalidEnvVarValue", {
				key,
				value,
				type: "datetime"
			});
		}
		return result.toISOString();
	}

	/**
	 * Coerces an env var to an integer and converts from seconds to milliseconds.
	 * Values of zero or less are returned unchanged so sentinels such as -1 keep their meaning.
	 * @param envVars The environment variables object.
	 * @param key The property name of the env var to coerce.
	 * @param defaultValue The value to return when the env var is absent. Omit to return undefined when absent.
	 * @returns The value in milliseconds, the default, or undefined when absent and no default given.
	 * @throws GeneralError if the value is set but cannot be coerced to an integer.
	 */
	public static envSecToMs<T>(envVars: T, key: keyof T, defaultValue: number): number;
	public static envSecToMs<T>(envVars: T, key: keyof T): number | undefined;
	public static envSecToMs<T>(envVars: T, key: keyof T, defaultValue?: number): number | undefined {
		const value = envVars[key];
		if (!Is.stringValue(value)) {
			return defaultValue;
		}
		const n = Coerce.integer(value);
		if (Is.empty(n)) {
			throw new GeneralError(EnvHelper.CLASS_NAME, "invalidEnvVarValue", {
				key,
				value,
				type: "integer"
			});
		}
		return n <= 0 ? n : n * 1000;
	}

	/**
	 * Coerces an env var to an integer and converts from minutes to milliseconds.
	 * Values of zero or less are returned unchanged so sentinels such as -1 keep their meaning.
	 * @param envVars The environment variables object.
	 * @param key The property name of the env var to coerce.
	 * @param defaultValue The value to return when the env var is absent. Omit to return undefined when absent.
	 * @returns The value in milliseconds, the default, or undefined when absent and no default given.
	 * @throws GeneralError if the value is set but cannot be coerced to an integer.
	 */
	public static envMinToMs<T>(envVars: T, key: keyof T, defaultValue: number): number;
	public static envMinToMs<T>(envVars: T, key: keyof T): number | undefined;
	public static envMinToMs<T>(envVars: T, key: keyof T, defaultValue?: number): number | undefined {
		const value = envVars[key];
		if (!Is.stringValue(value)) {
			return defaultValue;
		}
		const n = Coerce.integer(value);
		if (Is.empty(n)) {
			throw new GeneralError(EnvHelper.CLASS_NAME, "invalidEnvVarValue", {
				key,
				value,
				type: "integer"
			});
		}
		return n <= 0 ? n : n * 60_000;
	}

	/**
	 * Converts a comma separated list to an array.
	 * @param envVars The environment variables object.
	 * @param key The property name of the env var.
	 * @param expectedValues An optional array of expected values.
	 * @throws GeneralError if the list contains a value not in the expected values.
	 * @returns The array, empty when the env var is absent.
	 */
	public static envListToArray<T, U>(envVars: T, key: keyof T, expectedValues?: U[]): U[];
	/**
	 * Converts a comma separated list to an array.
	 * @param envVars The environment variables object.
	 * @param key The property name of the env var.
	 * @param expectedValues An optional array of expected values.
	 * @param defaultValue The default value to return when the list is empty or undefined.
	 * @throws GeneralError if the list contains a value not in the expected values.
	 * @returns The array, or the default when the env var is absent.
	 */
	public static envListToArray<T, U>(
		envVars: T,
		key: keyof T,
		expectedValues: U[] | undefined,
		defaultValue: U[]
	): U[];
	/**
	 * Converts a comma separated list to an array.
	 * @param envVars The environment variables object.
	 * @param key The property name of the env var.
	 * @param expectedValues An optional array of expected values.
	 * @param defaultValue The default value to return when the list is empty or undefined.
	 * @throws GeneralError if the list contains a value not in the expected values.
	 * @returns The array, or the default when the env var is absent, which may be undefined.
	 */
	public static envListToArray<T, U>(
		envVars: T,
		key: keyof T,
		expectedValues: U[] | undefined,
		defaultValue: U[] | undefined
	): U[] | undefined;
	public static envListToArray<T, U>(
		envVars: T,
		key: keyof T,
		expectedValues?: U[],
		defaultValue?: U[]
	): U[] | undefined {
		const value = envVars[key];
		const resolvedDefaultValue = arguments.length >= 4 ? defaultValue : [];

		const values = EnvHelper.commaSeparatedListToArray<U>(
			value as string | undefined,
			resolvedDefaultValue
		);

		if (values === undefined) {
			return undefined;
		}

		if (Is.arrayValue(expectedValues) && !values.every(item => expectedValues.includes(item))) {
			throw new GeneralError(EnvHelper.CLASS_NAME, "invalidEnvVarValue", {
				key,
				value,
				type: expectedValues.join(" | ")
			});
		}

		return values;
	}

	/**
	 * Converts a comma separated list to an array.
	 * @param value The comma separated list.
	 * @returns The array, empty when the list is empty or undefined.
	 */
	public static commaSeparatedListToArray<U>(value: string | undefined): U[];
	/**
	 * Converts a comma separated list to an array.
	 * @param value The comma separated list.
	 * @param defaultValue The default value to return when the list is empty or undefined.
	 * @returns The array, or the default when the list is empty or undefined.
	 */
	public static commaSeparatedListToArray<U>(
		value: string | undefined,
		defaultValue: U[] | undefined
	): U[] | undefined;
	public static commaSeparatedListToArray<U>(
		value: string | undefined,
		defaultValue?: U[]
	): U[] | undefined {
		if (!Is.stringValue(value)) {
			if (arguments.length < 2) {
				return [];
			}
			return defaultValue;
		}
		return value
			.split(",")
			.map(item => item.trim())
			.filter(item => item.length > 0) as U[];
	}

	/**
	 * Gets named key integer pairs from an env var holding comma separated key=integer pairs.
	 * @param envVars The environment variables object.
	 * @param key The property name of the env var to read.
	 * @returns The named key integer pairs, or undefined when the env var is absent or empty.
	 * @throws GeneralError if an entry is not a unique name=value pair with an integer value.
	 */
	public static envKeyIntegerPairs<T>(
		envVars: T,
		key: keyof T
	): { [key: string]: number } | undefined {
		const entries = EnvHelper.commaSeparatedListToArray<string>(
			envVars[key] as string | undefined,
			undefined
		);
		if (!Is.arrayValue(entries)) {
			return undefined;
		}

		const keyValues: { [name: string]: number } = {};
		for (const entry of entries) {
			const parts = entry.split("=").map(part => part.trim());

			const keyPart = parts[0];
			const valuePart = Coerce.integer(parts[1]);
			if (
				parts.length !== 2 ||
				!Is.stringValue(keyPart) ||
				!Is.integer(valuePart) ||
				!Is.undefined(keyValues[keyPart])
			) {
				throw new GeneralError(EnvHelper.CLASS_NAME, "invalidEnvVarPair", {
					key: keyPart,
					value: entry
				});
			}
			keyValues[keyPart] = valuePart;
		}

		return keyValues;
	}

	/**
	 * Test whether a camelCase key matches an entry in a pattern set.
	 * Entries ending with "*" are treated as prefix patterns; all others require an exact match.
	 * @param camelKey The camelCase key to test.
	 * @param patternSet The set of exact keys and/or wildcard patterns (e.g. "restPath*").
	 * @returns True if the key matches any entry.
	 */
	public static matchesPatternSet(
		camelKey: string,
		patternSet: ReadonlySet<string> | Set<string>
	): boolean {
		if (patternSet.has(camelKey)) {
			return true;
		}
		for (const pattern of patternSet) {
			if (pattern.endsWith("*") && camelKey.startsWith(pattern.slice(0, -1))) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Report any environment variables which are still recognised but no longer used.
	 * @param envVars The already-converted camelCase env variables.
	 * @param prefix The prefix used for the environment variables (e.g. "TWIN_").
	 * @param deprecatedKeys An optional map of deprecated keys to their replacements. If not provided, the default set is used.
	 * @returns An array of warnings, each containing the deprecated key and its suggested replacements if any.
	 */
	public static warnDeprecatedEnvVarKeys(
		envVars: { [id: string]: string | unknown },
		prefix: string,
		deprecatedKeys?: ReadonlyMap<string, readonly string[]>
	): {
		key: string;
		replacements?: string[];
	}[] {
		const warnings: {
			key: string;
			replacements?: string[];
		}[] = [];
		for (const camelKey of Object.keys(envVars)) {
			const replacements = deprecatedKeys?.get(camelKey);
			if (!Is.undefined(replacements)) {
				const key = EnvHelper.jsonKeyToEnvVarKey(camelKey, prefix);

				if (Is.arrayValue(replacements)) {
					warnings.push({
						key,
						replacements: replacements.map(replacement =>
							EnvHelper.jsonKeyToEnvVarKey(replacement, prefix)
						)
					});
				} else {
					warnings.push({
						key
					});
				}
			}
		}
		return warnings;
	}

	/**
	 * Validate that every key in envVars maps to a recognised property.
	 * All unknown keys are collected, then reported together as a single error or warning.
	 * Raw env var names listed in the allow list (e.g. TWIN_MY_EXTENSION_SECRET, TWIN_REST_PATH_*) are always accepted.
	 * Wildcard patterns ending with * are supported in both allow sets and the allow list.
	 * @param envVars The already-converted camelCase env variables.
	 * @param prefix The prefix used for the environment variables (e.g. "TWIN_").
	 * @param allowSets An array of sets of allowed keys and/or wildcard patterns.
	 * @param deprecatedKeys An optional map of deprecated keys to their replacements. If not provided, the default set is used.
	 * @returns A warning message if unknown env var properties are found and the strict mode is "warn", otherwise undefined.
	 * @throws GeneralError If any unknown env var properties are found and strict mode is "error", or if the strict mode value is invalid.
	 */
	public static validateEnvVarKeys(
		envVars: { [id: string]: string | undefined } & { strictEnv?: string; envAllowList?: string },
		prefix: string,
		allowSets: ReadonlySet<string>[],
		deprecatedKeys?: ReadonlyMap<string, readonly string[]>
	): string[] | undefined {
		const mode = Is.stringValue(envVars.strictEnv) ? envVars.strictEnv : "error";
		Guards.arrayOneOf(EnvHelper.CLASS_NAME, `${prefix}STRICT_ENV`, mode, [
			"error",
			"warn",
			"ignore"
		]);

		if (mode === "ignore") {
			return;
		}

		const customSet = new Set(
			EnvHelper.commaSeparatedListToArray<string>(envVars.envAllowList).map(k =>
				EnvHelper.envVarKeyToJsonKey(k.trim(), prefix)
			)
		);

		const unknown = Object.keys(envVars)
			.filter(
				camelKey =>
					!allowSets.some(set => EnvHelper.matchesPatternSet(camelKey, set)) &&
					!EnvHelper.matchesPatternSet(camelKey, customSet) &&
					!deprecatedKeys?.has(camelKey)
			)
			.map(camelKey => EnvHelper.jsonKeyToEnvVarKey(camelKey, prefix));

		if (unknown.length > 0) {
			if (mode === "error") {
				throw new GeneralError(EnvHelper.CLASS_NAME, "unknownEnvVars", {
					keys: unknown.join(", "),
					prefix
				});
			}
			return unknown;
		}
	}
}
