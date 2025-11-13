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
	 * @returns Nothing.
	 */
	public static async run<T = unknown>(contextIds: IContextIds, asyncMethod: () => T): Promise<T> {
		return (await ContextIdStore.createStorage()).run<T>(contextIds, asyncMethod);
	}

	/**
	 * Get the context IDs.
	 * @returns The context IDs.
	 */
	public static async getContextIds(): Promise<IContextIds | undefined> {
		return (await ContextIdStore.createStorage()).getStore();
	}

	/**
	 * Create the storage if it doesn't exist.
	 * @returns The storage.
	 */
	private static async createStorage(): Promise<AsyncLocalStorage<IContextIds>> {
		let asyncHooksStore = SharedStore.get<{ contextIds?: AsyncLocalStorage<IContextIds> }>(
			"asyncHooks"
		);

		if (Is.empty(asyncHooksStore?.contextIds)) {
			try {
				const hooks = await import("node:async_hooks");
				asyncHooksStore = asyncHooksStore ?? {};
				asyncHooksStore.contextIds = new hooks.AsyncLocalStorage<IContextIds>({
					name: "AsyncContextIdsStorage"
				});
			} catch (err) {
				throw new GeneralError(
					ContextIdStore.CLASS_NAME,
					"asyncHooksNotAvailable",
					undefined,
					BaseError.fromError(err)
				);
			}
			SharedStore.set("asyncHooks", asyncHooksStore);
		}
		return asyncHooksStore.contextIds;
	}
}
