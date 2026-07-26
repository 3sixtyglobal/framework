// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Is } from "./is.js";

/**
 * Provide a store for shared objects which can be accessed through multiple
 * instance loads of a package.
 */
export class SharedStore {
	/**
	 * Get a property from the shared store.
	 * @param prop The name of the property to get.
	 * @returns The property if it exists.
	 */
	public static get<T = unknown>(prop: string): T | undefined;

	/**
	 * Get a property from the shared store, creating and storing it with the
	 * factory if absent. The factory is invoked synchronously so its return
	 * value - including a Promise - is stored before any async yield, making
	 * this safe against concurrent callers.
	 * @param prop The name of the property to get or create.
	 * @param factory A synchronous factory that produces the initial value.
	 * @returns The existing or newly created value.
	 */
	public static get<T = unknown>(prop: string, factory: () => T): T;

	/**
	 * Get a property from the shared store, creating and storing it with the
	 * factory if absent. The factory is invoked synchronously so its return
	 * value - including a Promise - is stored before any async yield, making
	 * this safe against concurrent callers.
	 * @param prop The name of the property to get or create.
	 * @param factory A synchronous factory that produces the initial value.
	 * @returns The existing or newly created value.
	 */
	public static get<T = unknown>(prop: string, factory?: () => T): T | undefined {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const shared = (globalThis as any).__TWIN_SHARED__;
		let value: T | undefined = Is.undefined(shared) ? undefined : (shared[prop] as T);

		if (Is.empty(value) && !Is.undefined(factory)) {
			value = factory();
			SharedStore.set(prop, value);
		}

		return value;
	}

	/**
	 * Set the property in the shared store.
	 * @param prop The name of the property to set.
	 * @param value The value to set.
	 */
	public static set<T = unknown>(prop: string, value: T): void {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (Is.undefined((globalThis as any).__TWIN_SHARED__)) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(globalThis as any).__TWIN_SHARED__ = {};
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(globalThis as any).__TWIN_SHARED__[prop] = value;
	}

	/**
	 * Remove a property from the shared store.
	 * @param prop The name of the property to remove.
	 */
	public static remove(prop: string): void {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const shared = (globalThis as any).__TWIN_SHARED__;
		if (!Is.undefined(shared)) {
			delete shared[prop];
		}
	}
}
