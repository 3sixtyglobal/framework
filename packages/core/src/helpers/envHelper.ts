// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ObjectHelper } from "./objectHelper.js";
import { StringHelper } from "./stringHelper.js";
import { Is } from "../utils/is.js";

/**
 * Environment variable helper.
 */
export class EnvHelper {
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
	 * @param envVarKey The environment variable key.
	 * @param prefix The prefix of the environment variable key, if not provided gets all.
	 * @returns The JSON key.
	 */
	public static envVarKeyToJsonKey(envVarKey: string, prefix?: string): string {
		if (Is.stringValue(prefix) && envVarKey.startsWith(prefix)) {
			envVarKey = envVarKey.replace(prefix, "");
		}
		return StringHelper.camelCase(envVarKey.toLowerCase());
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
}
