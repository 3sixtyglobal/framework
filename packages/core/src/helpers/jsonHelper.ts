// Copyright 2024 IOTA Stiftung.
// Copyright 2026 3Sixty Trade Ltd.
// SPDX-License-Identifier: Apache-2.0.
import { nameof } from "@3sixty/nameof";
import { applyPatch, createPatch, type Operation } from "rfc6902";
import { ObjectHelper } from "./objectHelper.js";
import { GeneralError } from "../errors/generalError.js";
import type { IPatchOperation } from "../models/IPatchOperation.js";
import { Converter } from "../utils/converter.js";
import { Is } from "../utils/is.js";

/**
 * Helpers methods for JSON objects.
 */
export class JsonHelper {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<JsonHelper>();

	/**
	 * Serializes in canonical format.
	 * Based on https://www.rfc-editor.org/rfc/rfc8785.
	 * @param object The object to be serialized.
	 * @returns The serialized object.
	 */
	public static canonicalize(object: unknown): string {
		const buffer: string[] = [];

		if (
			(!Is.object(object) && !Is.array(object)) ||
			("toJSON" in object && Is.function(object.toJSON))
		) {
			// Primitive data type
			buffer.push(JSON.stringify(object));
		} else if (Array.isArray(object)) {
			// Array maintain element order
			const parts: string[] = [];
			for (const element of object) {
				if (element === undefined) {
					parts.push("null");
				} else {
					parts.push(JsonHelper.canonicalize(element));
				}
			}
			buffer.push(`[${parts.join(",")}]`);
		} else {
			// Object sort properties
			const props: string[] = [];
			const keys = Object.keys(object).sort();
			const o = object;
			for (const key of keys) {
				if (o[key] !== undefined) {
					props.push(`${JSON.stringify(key)}:${JsonHelper.canonicalize(o[key])}`);
				}
			}
			buffer.push(`{${props.join(",")}}`);
		}

		return buffer.join("");
	}

	/**
	 * Creates a RFC 6902 diff set.
	 * Based on https://www.rfc-editor.org/rfc/rfc6902.
	 * @param object1 The first object.
	 * @param object2 The second object.
	 * @returns The list of patches.
	 */
	public static diff<T = unknown>(object1: T, object2: T): IPatchOperation[] {
		const operations = createPatch(object1, object2);
		return operations;
	}

	/**
	 * Applies a RFC 6902 diff set to an object.
	 * Based on https://www.rfc-editor.org/rfc/rfc6902.
	 * @param object The object to patch.
	 * @param patches The patch operations to apply.
	 * @returns The updated object.
	 * @throws GeneralError if the patch fails.
	 */
	public static patch<T = unknown>(object: T, patches: IPatchOperation[]): T {
		const clone = ObjectHelper.clone(object);
		const result = applyPatch(clone, patches as Operation[]);

		for (let i = 0; i < result.length; i++) {
			if (!Is.empty(result[i])) {
				throw new GeneralError(JsonHelper.CLASS_NAME, "failedPatch", { index: i }, result[i]);
			}
		}

		return clone;
	}

	/**
	 * Stringify the JSON with support for extended data types date/bigint/uint8array/symbol.
	 * Symbols in the global registry are restored as the same symbol, others as a new symbol with the
	 * same description.
	 * Circular references are stringified as the index of the object they refer to on the path
	 * from the root, an object referenced more than once without a cycle is stringified in full each time.
	 * @param object The object to stringify.
	 * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
	 * @returns The stringified object.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static stringifyEx(object: any, space?: string | number): string {
		return JSON.stringify(JsonHelper.toExtendedJson(object), undefined, space);
	}

	/**
	 * Parse the JSON string with support for extended data types date/bigint/uint8array/symbol,
	 * restoring circular references.
	 * @param json The object to pause.
	 * @returns The object.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static parseEx(json: string): any {
		// We want to keep the 'this' intact for the reviver
		// eslint-disable-next-line @typescript-eslint/unbound-method
		const parsed: unknown = JSON.parse(json, JsonHelper.parseExReviver);
		// The reviver only sees the containing object, so circular references to objects further
		// up the path are restored afterwards
		return JsonHelper.restoreCircular(parsed, []);
	}

	/**
	 * Replacer function to handle extended data types.
	 * @param this The object.
	 * @param key The key.
	 * @param value The value.
	 * @returns The value.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static stringifyExReplacer(this: any, key: string, value: unknown): unknown {
		// The this in the replacer is the containing object
		// so we need to get the actual value from there
		// eslint-disable-next-line no-restricted-syntax
		const rawValue = this[key];

		if (Is.bigint(rawValue)) {
			return {
				"@ext": "bigint",
				value: rawValue.toString()
			};
		} else if (Is.date(rawValue)) {
			return {
				"@ext": "date",
				value: rawValue.getTime()
			};
		} else if (Is.uint8Array(rawValue)) {
			return {
				"@ext": "uint8array",
				value: Converter.bytesToBase64(rawValue)
			};
		} else if (Is.symbol(rawValue)) {
			return JsonHelper.symbolToExtended(rawValue);
		}
		return value;
	}

	/**
	 * Reviver function to handle extended data types.
	 * @param this The object.
	 * @param key The key.
	 * @param value The value.
	 * @returns The value.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static parseExReviver(this: any, key: string, value: unknown): unknown {
		if (Is.object<{ "@ext": string; value: string; global?: boolean }>(value)) {
			if (value["@ext"] === "bigint") {
				return BigInt(value.value);
			} else if (value["@ext"] === "date") {
				return new Date(value.value);
			} else if (value["@ext"] === "uint8array") {
				return Converter.base64ToBytes(value.value);
			} else if (value["@ext"] === "symbol") {
				return value.global === true ? Symbol.for(value.value) : Symbol(value.value);
			}
		}

		return value;
	}

	/**
	 * Convert a value to plain JSON values, with the extended data types date/bigint/uint8array/symbol
	 * converted to their extended form and circular references converted to the index of the object they refer to on the path from the root.
	 * @param value The value to convert.
	 * @returns The converted value.
	 */
	public static toExtendedJson(value: unknown): unknown {
		return JsonHelper.toExtendedJsonValue(value, []);
	}

	/**
	 * Convert a value to plain JSON values, with the extended data types.
	 * @param value The value to convert.
	 * @param ancestors The objects on the path from the root to the value, used to detect cycles.
	 * @returns The converted value.
	 * @internal
	 */
	private static toExtendedJsonValue(value: unknown, ancestors: unknown[]): unknown {
		if (Is.bigint(value)) {
			return {
				"@ext": "bigint",
				value: value.toString()
			};
		} else if (Is.date(value)) {
			return {
				"@ext": "date",
				value: value.getTime()
			};
		} else if (Is.uint8Array(value)) {
			return {
				"@ext": "uint8array",
				value: Converter.bytesToBase64(value)
			};
		} else if (Is.symbol(value)) {
			return JsonHelper.symbolToExtended(value);
		} else if (Is.array(value) || Is.object<{ toJSON?: () => unknown }>(value)) {
			const ancestorIndex = ancestors.indexOf(value);
			if (ancestorIndex !== -1) {
				return {
					"@ext": "circular",
					value: ancestorIndex
				};
			}
			const path = [...ancestors, value];
			if (Is.array(value)) {
				return value.map(item => JsonHelper.toExtendedJsonValue(item, path));
			}
			if (Is.function(value.toJSON)) {
				return JsonHelper.toExtendedJsonValue(value.toJSON(), path);
			}
			const result: { [key: string]: unknown } = {};
			for (const [key, propertyValue] of Object.entries(value)) {
				result[key] = JsonHelper.toExtendedJsonValue(propertyValue, path);
			}
			return result;
		}
		return value;
	}

	/**
	 * Replace the circular reference markers with the objects they refer to.
	 * @param value The value to restore.
	 * @param ancestors The objects on the path from the root to the value.
	 * @returns The restored value.
	 * @internal
	 */
	private static restoreCircular(value: unknown, ancestors: unknown[]): unknown {
		if (Is.array(value) || (Is.object(value) && !Is.date(value) && !Is.uint8Array(value))) {
			if (
				Is.object<{ "@ext": string; value: unknown }>(value) &&
				value["@ext"] === "circular" &&
				Is.integer(value.value) &&
				value.value >= 0 &&
				value.value < ancestors.length
			) {
				return ancestors[value.value];
			}
			const path = [...ancestors, value];
			const container = value as { [key: string]: unknown };
			for (const key of Object.keys(container)) {
				container[key] = JsonHelper.restoreCircular(container[key], path);
			}
		}
		return value;
	}

	/**
	 * Convert a symbol to its extended form, symbols in the global registry are flagged so they
	 * can be restored as the same symbol.
	 * @param value The symbol to convert.
	 * @returns The extended form of the symbol.
	 * @internal
	 */
	private static symbolToExtended(value: symbol): { [key: string]: unknown } {
		const globalKey = Symbol.keyFor(value);
		return Is.undefined(globalKey)
			? { "@ext": "symbol", value: value.description }
			: { "@ext": "symbol", value: globalKey, global: true };
	}
}
