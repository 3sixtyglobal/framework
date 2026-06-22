// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IContextIds } from "@twin.org/context";

/**
 * Worker definition for modules.
 */
export interface IModuleWorker {
	/**
	 * Execute a method in the module.
	 * @param method The method to execute.
	 * @param args The arguments for the method.
	 * @param contextIds The context IDs.
	 */
	executeMethod(method: string, args?: unknown, contextIds?: IContextIds): void;

	/**
	 * Terminate the worker.
	 * @returns A promise that resolves when the worker is terminated including the exit code.
	 */
	terminate(): Promise<number>;
}
