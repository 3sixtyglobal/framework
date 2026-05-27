// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Worker } from "node:worker_threads";
import type { IContextIds } from "@twin.org/context";
import { BaseError, GeneralError, Is, Mutex, SharedStore } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import type { IModuleWorker } from "../models/IModuleWorker.js";

/**
 * Helper functions for modules.
 */
export class ModuleHelper {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<ModuleHelper>();

	/**
	 * Override the import function for modules.
	 * @param overrideImport The override import function.
	 */
	public static overrideImport(
		overrideImport: (moduleName: string) => Promise<{ module?: unknown; useDefault: boolean }>
	): void {
		SharedStore.set("overrideImport", overrideImport);
	}

	/**
	 * Get the module entry.
	 * @param module The module.
	 * @param entry The entry to get from the module.
	 * @returns The entry from the module.
	 * @throws GeneralError if getting the module entry failed.
	 */
	public static async getModuleEntry<T>(module: string, entry: string): Promise<T> {
		let moduleInstance;

		try {
			let useDefault = true;

			const overrideImport =
				SharedStore.get<(moduleName: string) => Promise<{ module?: unknown; useDefault: boolean }>>(
					"overrideImport"
				);

			if (Is.function(overrideImport)) {
				const overrideResult = await overrideImport(module);

				moduleInstance = overrideResult.module;
				useDefault = overrideResult.useDefault;
			}

			if (useDefault) {
				moduleInstance = await import(module);
			}
		} catch (err) {
			throw new GeneralError(
				ModuleHelper.CLASS_NAME,
				"moduleNotFound",
				{
					module,
					entry
				},
				BaseError.fromError(err)
			);
		}

		const moduleEntry = moduleInstance?.[entry];

		if (Is.empty(moduleEntry)) {
			throw new GeneralError(ModuleHelper.CLASS_NAME, "entryNotFound", {
				module,
				entry
			});
		}

		return moduleEntry as T;
	}

	/**
	 * Get the method from a module.
	 * @param module The module.
	 * @param method The method to execute from the module, use dot notation to get a static class method.
	 * @returns The result of the method execution.
	 * @throws GeneralError if executing the module entry failed.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static async getModuleMethod<T extends (...args: any[]) => any = (...args: any[]) => any>(
		module: string,
		method: string
	): Promise<T> {
		const methodParts = method.split(".");

		if (methodParts.length === 2) {
			const moduleEntry = await ModuleHelper.getModuleEntry<{
				[id: string]: T;
			}>(module, methodParts[0]);

			if (Is.function<T>(moduleEntry[methodParts[1]])) {
				return moduleEntry[methodParts[1]];
			}
			throw new GeneralError(ModuleHelper.CLASS_NAME, "notFunction", {
				module,
				method
			});
		}

		const moduleEntry = await ModuleHelper.getModuleEntry<T>(module, methodParts[0]);

		if (Is.function<T>(moduleEntry)) {
			return moduleEntry;
		}

		throw new GeneralError(ModuleHelper.CLASS_NAME, "notFunction", {
			module,
			method
		});
	}

	/**
	 * Execute the method in the module.
	 * @param module The module.
	 * @param method The method to execute from the module.
	 * @param args The arguments to pass to the method.
	 * @returns The result of the method execution.
	 * @throws GeneralError if executing the module entry failed.
	 */
	public static async execModuleMethod<T>(
		module: string,
		method: string,
		args?: unknown[]
	): Promise<T> {
		const moduleMethod = await ModuleHelper.getModuleMethod<(...args: unknown[]) => T>(
			module,
			method
		);

		return moduleMethod(...(args ?? []));
	}

	/**
	 * Execute the method in the module in a thread.
	 * @param module The module.
	 * @param method The method to execute from the module.
	 * @param args The arguments to pass to the method.
	 * @param contextIds The context IDs.
	 * @returns The result of the method execution.
	 * @throws GeneralError if executing the module entry failed.
	 */
	public static async execModuleMethodThread<T>(
		module: string,
		method: string,
		args?: unknown[],
		contextIds?: IContextIds
	): Promise<T> {
		let messageModule: IModuleWorker | undefined;
		try {
			return await new Promise<T>((resolve, reject) => {
				messageModule = ModuleHelper.execModuleMethodThreadMessage(
					module,
					(resultMethod, result, err) => {
						if (err) {
							reject(err);
						} else {
							resolve(result as T);
						}
					}
				);

				messageModule.executeMethod(method, args, contextIds);
			});
		} finally {
			await messageModule?.terminate();
		}
	}

	/**
	 * Load the module and provide a messaging interface.
	 * @param module The module.
	 * @param completed Callback called when the worker thread processes a completion.
	 * @param options Optional settings.
	 * @param options.threadName The name of the thread.
	 * @returns The messaging interface.
	 * @throws GeneralError if executing the module entry failed.
	 */
	public static execModuleMethodThreadMessage(
		module: string,
		completed: (operation: string, result?: unknown, err?: Error) => void,
		options?: {
			threadName?: string;
		}
	): IModuleWorker {
		const worker = new Worker(
			`(async () => {
	const { workerData, parentPort } = await import('node:worker_threads');
	const { ContextIdStore } = await import('@twin.org/context');
	const { BaseError } = await import('@twin.org/core');
	const { module } = workerData;

	function rejectError(errorType, methodName, args, cause) {
		parentPort.postMessage({ errorType, method: methodName, args, cause: BaseError.fromError(cause).toJsonObject(true) });
	}

	async function executeMethod(method, methodName, args, contextIds) {
		try {
			await ContextIdStore.run(contextIds ?? {}, async () => {
				const result = await method(...(args ?? []));

				parentPort.postMessage({ method: methodName, result });
			});
		} catch (err) {
			rejectError('resultError', methodName, args, err);
		}
	}

	const modules = {};

	parentPort.on('message', async msg => {
		const { method, args, contextIds } = msg;

		try {
			const moduleInstance = modules[module] ?? (await import(module));
			modules[module] = moduleInstance;

			const methodParts = method.split('.');
			const moduleEntry = moduleInstance[methodParts[0]];

			if (moduleEntry === undefined) {
				rejectError('entryNotFound', method, args);
			} else if (methodParts.length === 2) {
				const moduleMethod = moduleEntry[methodParts[1]];
				if (typeof moduleMethod === 'function') {
					await executeMethod(moduleMethod, method, args, contextIds);
				} else {
					rejectError('notFunction', method, args);
				}
			} else if (typeof moduleEntry === 'function') {
				await executeMethod(moduleEntry, method, args, contextIds);
			} else {
				rejectError('notFunction', method, args);
			}
		} catch (errInner) {
			rejectError('moduleNotFound', method, args, errInner);
		}
	});
})();`,
			{ eval: true, workerData: { module }, name: options?.threadName }
		);

		worker.on("message", msg => {
			if (Mutex.handleWorkerMessage(msg)) {
				return;
			}
			if (!Is.stringValue(msg?.method)) {
				return;
			}
			if (Is.stringValue(msg.errorType)) {
				completed(
					msg.method,
					undefined,
					new GeneralError(
						ModuleHelper.CLASS_NAME,
						msg.errorType,
						{ module, method: msg.method, args: msg.args },
						msg.cause
					)
				);
			} else {
				completed(msg.method, msg.result);
			}
		});

		worker.on("error", err => {
			completed(
				"error",
				undefined,
				new GeneralError(
					ModuleHelper.CLASS_NAME,
					"workerException",
					{
						module
					},
					err
				)
			);
		});

		worker.on("exit", code => {
			completed("terminate", code);
		});

		return {
			executeMethod: (method: string, args?: unknown, contextIds?: IContextIds) =>
				worker.postMessage({ method, args, contextIds }),
			terminate: async () => worker.terminate()
		};
	}

	/**
	 * Check if a module is a local module.
	 * @param name The name of the module.
	 * @returns True if the module is local, false otherwise.
	 */
	public static isLocalModule(name: string): boolean {
		return name.startsWith(".") || name.startsWith("/");
	}

	/**
	 * Check if a module is a relative module.
	 * @param name The name of the module.
	 * @returns True if the module is relative, false otherwise.
	 */
	public static isRelativeModule(name: string): boolean {
		return name.startsWith(".");
	}
}
