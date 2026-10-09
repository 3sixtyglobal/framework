// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Worker } from "node:worker_threads";
import type { IContextIds } from "@3sixty/context";
import {
	BaseError,
	GeneralError,
	Is,
	Mutex,
	NativeModules,
	SharedObjectBuffer,
	SharedStore
} from "@3sixty/core";
import { nameof } from "@3sixty/nameof";
import { ModuleResolutionHelper } from "./moduleResolutionHelper.js";
import type { IModuleHelperOptions } from "../models/IModuleHelperOptions.js";
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
	 * Set the options for module resolution, this enables resolving local, package, npm: and https:
	 * modules from the execution directory for both main thread and worker thread imports.
	 * Setting the options clears the resolution caches.
	 * @param options The options for module resolution.
	 */
	public static setOptions(options: IModuleHelperOptions): void {
		SharedStore.set("moduleHelperOptions", options);
		SharedStore.remove("moduleHelperCache");
	}

	/**
	 * Get the options for module resolution, worker threads are started with these options.
	 * @returns The options, or undefined if they have not been set.
	 */
	public static getOptions(): IModuleHelperOptions | undefined {
		return SharedStore.get<IModuleHelperOptions>("moduleHelperOptions");
	}

	/**
	 * Import a module on the main thread, resolving and caching it.
	 * @param module The module.
	 * @returns The imported module.
	 */
	public static async importModule<T = { [key: string]: unknown }>(module: string): Promise<T> {
		const cache = ModuleHelper.getCache();
		if (cache.modules.has(module)) {
			return cache.modules.get(module) as T;
		}

		const moduleInstance = await import(await ModuleHelper.resolveModule(module));
		cache.modules.set(module, moduleInstance);
		return moduleInstance as T;
	}

	/**
	 * Get the module entry.
	 * @param module The module.
	 * @param entry The entry to get from the module.
	 * @returns The entry from the module.
	 * @throws GeneralError if getting the module entry failed.
	 */
	public static async getModuleEntry<T>(module: string, entry: string): Promise<T> {
		let moduleInstance: { [key: string]: unknown } | undefined;

		try {
			moduleInstance = await ModuleHelper.importModule(module);
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
	 * Load the module and provide a messaging interface. The worker starts with the native
	 * modules already registered on this thread via NativeModules.init() and the options from
	 * setOptions, messages from the worker's onMessage option are forwarded to this thread.
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
		const pending: { method: string; args?: unknown; contextIds?: IContextIds }[] = [];
		let worker: Worker | undefined;
		let terminated = false;

		// The worker starts once the module is resolved, messages are queued until then.
		const started = (async () => {
			try {
				const resolvedModule = await ModuleHelper.resolveModule(module);
				if (!terminated) {
					worker = ModuleHelper.createWorker(
						module,
						resolvedModule,
						completed,
						options?.threadName
					);
					for (const message of pending) {
						worker.postMessage(message);
					}
					pending.length = 0;
				}
			} catch (err) {
				completed(
					"startup",
					undefined,
					new GeneralError(
						ModuleHelper.CLASS_NAME,
						"workerStartup",
						{ module },
						BaseError.fromError(err)
					)
				);
			}
		})();

		return {
			executeMethod: (method: string, args?: unknown, contextIds?: IContextIds) => {
				if (worker) {
					worker.postMessage({ method, args, contextIds });
				} else {
					pending.push({ method, args, contextIds });
				}
			},
			terminate: async () => {
				terminated = true;
				await started;
				return worker?.terminate() ?? 0;
			}
		};
	}

	/**
	 * Resolve a module name to the specifier to import, using the options from setOptions. Without
	 * options, local and package modules are resolved from the working directory, npm: and https:
	 * modules are only resolved once options are set. The native modules needed are registered on first use.
	 * @param module The module name.
	 * @returns The specifier to import, or the module name unchanged if it could not be resolved.
	 * @throws GeneralError if the module uses an insecure protocol or could not be installed or downloaded.
	 */
	public static async resolveModule(module: string): Promise<string> {
		await ModuleResolutionHelper.initNativeModules();

		const options = ModuleHelper.getOptions() ?? ModuleResolutionHelper.getDefaultOptions(module);
		if (Is.undefined(options)) {
			return module;
		}

		const cache = ModuleHelper.getCache();
		const cacheKey = `${options.executionDirectory}|${module}`;
		let resolved = cache.resolved.get(cacheKey);
		if (Is.undefined(resolved)) {
			const resolvedPath = await ModuleResolutionHelper.resolveModulePath(
				module,
				options,
				cache.dependencyRoots
			);
			if (Is.stringValue(resolvedPath)) {
				resolved = ModuleResolutionHelper.createModuleImportUrl(resolvedPath);
				cache.resolved.set(cacheKey, resolved);
			}
		}

		return resolved ?? module;
	}

	/**
	 * Get the resolution caches, shared across instance loads of the package.
	 * @returns The caches.
	 * @internal
	 */
	private static getCache(): {
		modules: Map<string, unknown>;
		resolved: Map<string, string>;
		dependencyRoots: Map<string, string | undefined>;
	} {
		return SharedStore.get("moduleHelperCache", () => ({
			modules: new Map<string, unknown>(),
			resolved: new Map<string, string>(),
			dependencyRoots: new Map<string, string | undefined>()
		}));
	}

	/**
	 * Create the worker thread for the module.
	 * @param module The module name, used for error reporting.
	 * @param resolvedModule The resolved module specifier to import in the worker.
	 * @param completed Callback called when the worker thread processes a completion.
	 * @param threadName The name of the thread.
	 * @returns The worker.
	 * @internal
	 */
	private static createWorker(
		module: string,
		resolvedModule: string,
		completed: (operation: string, result?: unknown, err?: Error) => void,
		threadName?: string
	): Worker {
		// Eval workers resolve bare specifiers from the host's working directory, so resolve our
		// own dependencies here and pass their URLs to the worker.
		const moduleHelperOptions = ModuleHelper.getOptions();
		const worker = new Worker(
			`(async () => {
	const { workerData, parentPort } = await import('node:worker_threads');
	const { module, nativeModules, moduleHelperOptions, forwardMessages, contextUrl, coreUrl } = workerData;

	let ContextIdStore;
	let BaseError;
	try {
		const contextModule = await import(contextUrl);
		const coreModule = await import(coreUrl);
		ContextIdStore = contextModule.ContextIdStore;
		BaseError = coreModule.BaseError;

		// Failures are ignored, the pure JavaScript fallbacks still work.
		if (nativeModules.length > 0) {
			await coreModule.NativeModules.init(nativeModules);
		}

		// Set through the global shared store so any ModuleHelper instance in the worker uses them.
		if (moduleHelperOptions !== undefined) {
			coreModule.SharedStore.set('moduleHelperOptions', {
				...moduleHelperOptions,
				onMessage: forwardMessages
					? (level, key, properties) => parentPort.postMessage({ moduleHelperMessage: { level, key, properties } })
					: undefined
			});
		}
	} catch (err) {
		// BaseError may not have loaded, so serialise the cause directly.
		parentPort.postMessage({
			errorType: 'workerStartup',
			method: 'startup',
			cause: { name: err?.name ?? 'Error', message: err?.message ?? String(err), stack: err?.stack }
		});
		return;
	}

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
			{
				eval: true,
				workerData: {
					module: resolvedModule,
					nativeModules: NativeModules.names(),
					// Functions can not be cloned to the worker, so messages are forwarded to onMessage here.
					moduleHelperOptions: Is.object(moduleHelperOptions)
						? { ...moduleHelperOptions, onMessage: undefined }
						: undefined,
					forwardMessages: Is.function(moduleHelperOptions?.onMessage),
					contextUrl: import.meta.resolve("@3sixty/context"),
					coreUrl: import.meta.resolve("@3sixty/core")
				},
				name: threadName
			}
		);

		worker.on("message", msg => {
			if (Mutex.handleWorkerMessage(msg)) {
				return;
			}
			if (SharedObjectBuffer.handleWorkerMessage(msg)) {
				return;
			}
			if (Is.object(msg?.moduleHelperMessage)) {
				moduleHelperOptions?.onMessage?.(
					msg.moduleHelperMessage.level,
					msg.moduleHelperMessage.key,
					msg.moduleHelperMessage.properties
				);
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

		return worker;
	}
}
