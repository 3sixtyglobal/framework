// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Worker } from "node:worker_threads";
import { BaseError, GeneralError, Is, SharedStore } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";

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
				entry: method
			});
		}

		const moduleEntry = await ModuleHelper.getModuleEntry<T>(module, methodParts[0]);

		if (Is.function<T>(moduleEntry)) {
			return moduleEntry;
		}

		throw new GeneralError(ModuleHelper.CLASS_NAME, "notFunction", {
			module,
			entry: method
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
	 * @returns The result of the method execution.
	 * @throws GeneralError if executing the module entry failed.
	 */
	public static async execModuleMethodThread<T>(
		module: string,
		method: string,
		args?: unknown[]
	): Promise<T> {
		return new Promise((resolve, reject) => {
			const worker = new Worker(
				`(async () => {
	try {
		const { workerData, parentPort } = await import('node:worker_threads');

		function rejectError(errorType, cause) {
			parentPort.postMessage({ errorType, cause });
		}

		async function executeMethod(method) {
			try {
				const result = await method(...(args ?? []));

				parentPort.postMessage({ result });
			} catch (err) {
				rejectError('resultError', err);
			}
		}

		const { module, method, args } = workerData;

		const moduleInstance = await import(module);
		const methodParts = method.split('.');
		const moduleEntry = moduleInstance[methodParts[0]];

		if (moduleEntry === undefined) {
			rejectError('entryNotFound');
		} else if (methodParts.length === 2) {
			const moduleMethod = moduleEntry[methodParts[1]];
			if (typeof moduleMethod === 'function') {
				await executeMethod(moduleMethod, args);
			} else {
				rejectError('notFunction');
			}
		} else if (typeof moduleEntry === 'function') {
			await executeMethod(moduleEntry, args);
		} else {
			rejectError('notFunction');
		}
	} catch (err) {
		rejectError('moduleNotFound', err);
	}
})();
			`,
				{ eval: true, workerData: { module, method, args: args ?? [] } }
			);

			worker.on("message", msg => {
				if (Is.stringValue(msg.errorType)) {
					reject(
						new GeneralError(
							ModuleHelper.CLASS_NAME,
							msg.errorType,
							{ module, entry: method },
							msg.cause
						)
					);
				} else {
					resolve(msg.result);
				}
			});

			worker.on("error", err => {
				reject(
					new GeneralError(
						ModuleHelper.CLASS_NAME,
						"workerException",
						{
							module,
							entry: method
						},
						err
					)
				);
			});

			worker.on("exit", code => {
				if (code === 1) {
					reject(
						new GeneralError(ModuleHelper.CLASS_NAME, "workerFailed", {
							module,
							entry: method,
							exitCode: code
						})
					);
				}
			});
		});
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
