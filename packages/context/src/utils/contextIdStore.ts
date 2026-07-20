// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { AsyncLocalStorage } from "node:async_hooks";
import { BaseError, GeneralError, Is, SharedStore } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import type { IContextIds } from "../models/IContextIds.js";

/**
 * Class to maintain context ids and execute an async method.
 */
export class ContextIdStore {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<ContextIdStore>();

	/**
	 * Execute the method wrapped in the context.
	 * @param contextIds The context IDs.
	 * @param asyncMethod The async method to run.
	 * @returns A promise that resolves with the result of the async method.
	 */
	public static async run<T = unknown>(contextIds: IContextIds, asyncMethod: () => T): Promise<T> {
		const storage = await ContextIdStore.getStorage();
		return storage.run<T>(contextIds, asyncMethod);
	}

	/**
	 * Get the context IDs.
	 * @returns The context IDs.
	 */
	public static async getContextIds(): Promise<IContextIds | undefined> {
		const storage = await ContextIdStore.getStorage();
		return storage.getStore();
	}

	/**
	 * Get the storage and create it if it doesn't exist.
	 * @returns The storage.
	 */
	public static async getStorage(): Promise<AsyncLocalStorage<IContextIds>> {
		// get with the factory is invoked synchronously and stores the returned
		// Promise before yielding, so concurrent callers always await the same
		// AsyncLocalStorage instance regardless of how many module versions are loaded.
		const stored = SharedStore.get<
			Promise<AsyncLocalStorage<IContextIds>> | { contextIds: AsyncLocalStorage<IContextIds> }
		>("asyncHooks", async () => {
			try {
				const hooks = await import("node:async_hooks");
				return new hooks.AsyncLocalStorage<IContextIds>({
					name: "AsyncContextIdsStorage"
				});
			} catch (err) {
				SharedStore.remove("asyncHooks");
				throw new GeneralError(
					ContextIdStore.CLASS_NAME,
					"asyncHooksNotAvailable",
					undefined,
					BaseError.fromError(err)
				);
			}
		});

		// Back-compat with context@0.9.0: that version stored { contextIds: AsyncLocalStorage }
		// (a plain wrapper object, not a Promise). Leave SharedStore untouched - upgrading to
		// the Promise shape would cause old code to see no contextIds, create a second
		// AsyncLocalStorage, and silently split context between versions.
		if (!Is.promise<AsyncLocalStorage<IContextIds>>(stored)) {
			return stored.contextIds;
		}
		return stored;
	}
}
