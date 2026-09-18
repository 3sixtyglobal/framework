// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Is } from "./is.js";
import { SharedStore } from "./sharedStore.js";
import { BaseError } from "../errors/baseError.js";
import type { IError } from "../models/IError.js";

/**
 * Helper for detecting and resolving native platform modules (Node builtins and globals)
 * so a class can prefer a faster native implementation while keeping a pure JavaScript
 * fallback where the native form does not exist (e.g. a browser). See getModule() and
 * init() below for how a builtin is opted into, and typeExists() for a global.
 */
export class NativeModules {
	/**
	 * SharedStore key for the registry of modules resolved via init().
	 * @internal
	 */
	private static readonly _REGISTRY_KEY = "nativeModulesRegistry";

	/**
	 * Check whether a global of the given name exists in the current environment.
	 * @param name The name of the global to check for, e.g. "Buffer".
	 * @returns True if the global exists, false otherwise (e.g. in a browser).
	 */
	public static typeExists(name: string): boolean {
		return !Is.undefined((globalThis as { [key: string]: unknown })[name]);
	}

	/**
	 * Get a module previously registered by init(). Never resolves anything itself, even
	 * a Node builtin - a specifier init() was never called for returns undefined here.
	 * @param name The module specifier, e.g. "node:crypto".
	 * @returns The module, or undefined if it was never registered via init().
	 */
	public static getModule<T = unknown>(name: string): T | undefined {
		const registry = SharedStore.get<{ [specifier: string]: unknown }>(NativeModules._REGISTRY_KEY);
		if (!Is.undefined(registry) && name in registry) {
			return registry[name] as T;
		}
		return undefined;
	}

	/**
	 * Resolve and register modules for getModule() to return, including Node builtins.
	 * @param modules The module specifiers to import and register.
	 * @returns The specifiers that failed, keyed by specifier, with the error raised.
	 */
	public static async init(modules: string[]): Promise<{ [specifier: string]: IError }> {
		const registry = SharedStore.get<{ [specifier: string]: unknown }>(
			NativeModules._REGISTRY_KEY,
			() => ({})
		);
		const failures: { [specifier: string]: IError } = {};

		await Promise.all(
			modules.map(async name => {
				try {
					registry[name] = await import(name);
				} catch (error) {
					failures[name] = BaseError.fromError(error).toJsonObject(false);
				}
			})
		);

		return failures;
	}
}
