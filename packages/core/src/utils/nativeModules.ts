// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { SharedStore } from "./sharedStore.js";
import { BaseError } from "../errors/baseError.js";
import type { IError } from "../models/IError.js";

/**
 * Helper for detecting and resolving native platform modules (Node builtins and globals)
 * so a class can prefer a faster native implementation while keeping a pure JavaScript
 * fallback where the native form does not exist (e.g. a browser). See getModule() and
 * init() below for how a builtin is opted into, and getType() for a global.
 */
export class NativeModules {
	/**
	 * SharedStore key for the registry of modules resolved via init().
	 * @internal
	 */
	private static readonly _REGISTRY_KEY = "nativeModulesRegistry";

	/**
	 * Get the registry of modules resolved via init(), creating it if it does not yet exist.
	 * The registry is live, so mutating it changes what getModule() and names() return.
	 * @returns The registry, keyed by module specifier.
	 */
	public static getRegistry(): { [specifier: string]: unknown } {
		return SharedStore.get<{ [specifier: string]: unknown }>(
			NativeModules._REGISTRY_KEY,
			() => ({})
		);
	}

	/**
	 * Get a global of the given name from the current environment, typed as the caller requires.
	 * Pass the constructor type, not the instance type, to reach statics e.g.
	 * getType<BufferConstructor>("Buffer").
	 * @param name The name of the global to get, e.g. "Buffer".
	 * @returns The global, or undefined if it does not exist (e.g. in a browser).
	 */
	public static getType<T = unknown>(name: string): T | undefined {
		return (globalThis as { [key: string]: unknown })[name] as T | undefined;
	}

	/**
	 * Get a module previously registered by init(). Never resolves anything itself, even
	 * a Node builtin - a specifier init() was never called for returns undefined here.
	 * @param name The module specifier, e.g. "node:crypto".
	 * @returns The module, or undefined if it was never registered via init().
	 */
	public static getModule<T = unknown>(name: string): T | undefined {
		const registry = NativeModules.getRegistry();
		return registry[name] as T | undefined;
	}

	/**
	 * Get the specifiers of the modules registered via init().
	 * @returns The registered specifiers.
	 */
	public static names(): string[] {
		const registry = NativeModules.getRegistry();
		return Object.keys(registry);
	}

	/**
	 * Resolve and register modules for getModule() to return, including Node builtins.
	 * @param modules The module specifiers to import and register.
	 * @returns The specifiers that failed, keyed by specifier, with the error raised.
	 */
	public static async init(modules: string[]): Promise<{ [specifier: string]: IError }> {
		const registry = NativeModules.getRegistry();
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
