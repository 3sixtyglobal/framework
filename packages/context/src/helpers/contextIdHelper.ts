// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { GeneralError, Guards, Is } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import { ContextIdHandlerFactory } from "../factories/contextIdHandlerFactory.js";
import type { IContextIds } from "../models/IContextIds.js";

/**
 * Class to help with context IDs.
 */
export class ContextIdHelper {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<ContextIdHelper>();

	/**
	 * Perform a runtime guard on the provided context ID value.
	 * @param contextIds The context IDs to guard.
	 * @param key The context ID key to guard.
	 * @throws Guard error if the value is invalid.
	 */
	public static guard<T extends { [k: string]: string | undefined }, K extends string>(
		contextIds: T | undefined,
		key: K
	): asserts contextIds is T & { [P in K]: string } {
		Guards.stringValue(ContextIdHelper.CLASS_NAME, nameof(key), key);

		if (Is.undefined(contextIds?.[key])) {
			throw new GeneralError(ContextIdHelper.CLASS_NAME, "contextIdMissing", { key });
		}

		const handler = ContextIdHandlerFactory.getIfExists(key);
		if (handler?.guard) {
			handler.guard(contextIds[key]);
		} else {
			Guards.stringValue(ContextIdHelper.CLASS_NAME, `contextIds.${key}`, contextIds[key]);
		}
	}

	/**
	 * Gets the short version of a context ID.
	 * @param contextIds The context IDs to get the short version from.
	 * @param key The context ID key to get the short version for.
	 * @returns The short version of the context ID.
	 * @throws Guard error if the value is invalid.
	 */
	public static short(contextIds: IContextIds | undefined, key: string): string {
		Guards.stringValue(ContextIdHelper.CLASS_NAME, nameof(key), key);
		if (Is.undefined(contextIds?.[key])) {
			throw new GeneralError(ContextIdHelper.CLASS_NAME, "contextIdMissing", { key });
		}

		const handler = ContextIdHandlerFactory.getIfExists(key);
		if (handler?.short) {
			return handler.short(contextIds[key]);
		}
		return contextIds[key];
	}

	/**
	 * Perform a runtime guard on the provided context ID values.
	 * @param contextIds The context IDs to guard.
	 * @param keys The context ID keys to guard.
	 * @throws Guard error if the value is invalid.
	 */
	public static guardAll<T extends { [k: string]: string | undefined }, K extends string>(
		contextIds: T | undefined,
		keys: readonly K[] | undefined
	): asserts contextIds is T & { [P in K]: string } {
		if (Is.arrayValue(keys)) {
			for (const key of keys) {
				ContextIdHelper.guard(contextIds, key);
			}
		}
	}

	/**
	 * Gets the long version of a context ID, expanding from a short form if a handler is registered.
	 * @param contextIds The context IDs to get the long version from.
	 * @param key The context ID key to get the long version for.
	 * @returns The long version of the context ID.
	 * @throws Guard error if the value is invalid.
	 */
	public static long(contextIds: IContextIds | undefined, key: string): string {
		Guards.stringValue(ContextIdHelper.CLASS_NAME, nameof(key), key);
		if (Is.undefined(contextIds?.[key])) {
			throw new GeneralError(ContextIdHelper.CLASS_NAME, "contextIdMissing", { key });
		}

		const handler = ContextIdHandlerFactory.getIfExists(key);
		if (handler?.long) {
			return handler.long(contextIds[key]);
		}
		return contextIds[key];
	}

	/**
	 * Gets the long versions of multiple context IDs.
	 * @param contextIds The context IDs to get the long versions from.
	 * @param keys The context ID keys to get the long versions for.
	 * @returns The long versions of the context IDs.
	 */
	public static longAll(
		contextIds: IContextIds | undefined,
		keys: string[] | undefined
	): IContextIds {
		const long: IContextIds = {};
		if (Is.arrayValue(keys)) {
			for (const key of keys) {
				long[key] = ContextIdHelper.long(contextIds, key);
			}
		}
		return long;
	}

	/**
	 * Gets the short versions of multiple context IDs.
	 * @param contextIds The context IDs to get the short versions from.
	 * @param keys The context ID keys to get the short versions for.
	 * @returns The short versions of the context IDs.
	 */
	public static shortAll(
		contextIds: IContextIds | undefined,
		keys: string[] | undefined
	): IContextIds {
		const short: IContextIds = {};
		if (Is.arrayValue(keys)) {
			for (const key of keys) {
				short[key] = ContextIdHelper.short(contextIds, key);
			}
		}
		return short;
	}

	/**
	 * Gets the combined short version.
	 * @param contextIds The context IDs to get the short versions from.
	 * @param keys The context ID keys to get the short versions for.
	 * @param separator The separator to use between parts.
	 * @returns The short version combined.
	 */
	public static shortCombined(
		contextIds: IContextIds | undefined,
		keys: string[] | undefined,
		separator: string = "/"
	): string | undefined {
		const short = ContextIdHelper.shortAll(contextIds, keys);
		if (Object.keys(short).length === 0) {
			return undefined;
		}
		return Object.values(short).join(separator);
	}

	/**
	 * Split a combined short version in to the separate context IDs.
	 * @param keys The context ID keys to get the short versions for.
	 * @param combined The combined short version to separate.
	 * @param separator The separator used between parts.
	 * @returns The short version combined.
	 * @throws GeneralError if the number of parts does not match the number of keys.
	 */
	public static shortSplit(keys: string[], combined: string, separator: string = "/"): IContextIds {
		Guards.arrayValue<string>(ContextIdHelper.CLASS_NAME, nameof(keys), keys);
		Guards.stringValue(ContextIdHelper.CLASS_NAME, nameof(combined), combined);

		const parts = combined.split(separator);
		const result: IContextIds = {};

		if (parts.length !== keys.length) {
			throw new GeneralError(ContextIdHelper.CLASS_NAME, "contextIdSplitMismatch", {
				expected: keys.length,
				actual: parts.length
			});
		}

		for (let i = 0; i < keys.length; i++) {
			result[keys[i]] = parts[i];
		}

		return result;
	}

	/**
	 * Create a combined key.
	 * @param contextIds The context IDs to create the combined key for.
	 * @param keys The context ID keys to get the short versions for.
	 * @param separator The separator to use between parts.
	 * @returns The short version combined.
	 */
	public static combinedContextKey(
		contextIds: IContextIds | undefined,
		keys: string[] | undefined,
		separator: string = "/"
	): string | undefined {
		ContextIdHelper.guardAll(contextIds, keys);

		const short = ContextIdHelper.shortAll(contextIds, keys);

		if (Object.keys(short).length === 0) {
			return undefined;
		}

		return Object.values(short).join(separator);
	}

	/**
	 * Pick only the desired keys from the available keys.
	 * @param availableKeys The available keys to pick from.
	 * @param desiredKeys The desired keys to pick.
	 * @returns The picked keys.
	 */
	public static pickKeysFromAvailable(availableKeys?: string[], desiredKeys?: string[]): string[] {
		if (!Is.arrayValue(availableKeys) || !Is.arrayValue(desiredKeys)) {
			return [];
		}

		return desiredKeys.filter(key => availableKeys.includes(key));
	}
}
