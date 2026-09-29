// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type * as NodeChildProcess from "node:child_process";
import type * as NodeFs from "node:fs/promises";
import type * as NodeHttps from "node:https";
import type * as NodeModule from "node:module";
import type * as NodePath from "node:path";
import type * as NodeUrl from "node:url";
import { BaseError, Converter, GeneralError, Is, NativeModules, SharedStore } from "@twin.org/core";
import { Sha256 } from "@twin.org/crypto";
import { nameof } from "@twin.org/nameof";
import type { ICacheMetadata } from "../models/ICacheMetadata.js";
import type { IModuleHelperOptions } from "../models/IModuleHelperOptions.js";
import type { IModuleProtocol } from "../models/IModuleProtocol.js";
import type { IProtocolHandlerResult } from "../models/IProtocolHandlerResult.js";
import { ModuleProtocol } from "../models/moduleProtocol.js";

/**
 * Helper functions for resolving modules to files, the platform modules are accessed through
 * NativeModules and are registered by initNativeModules().
 */
export class ModuleResolutionHelper {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<ModuleResolutionHelper>();

	/**
	 * The native modules which must be registered with NativeModules.init() for resolution.
	 */
	public static readonly NATIVE_MODULES: string[] = [
		"node:child_process",
		"node:fs/promises",
		"node:https",
		"node:module",
		"node:path",
		"node:url"
	];

	/**
	 * Register any of the native modules needed for resolution which are not already registered,
	 * this only runs once, modules which fail to load (e.g. in a browser) leave resolution disabled.
	 * @returns A promise that resolves when registration has been attempted.
	 */
	public static async initNativeModules(): Promise<void> {
		// The promise is stored on the first call, so later calls never attempt the load again.
		await SharedStore.get("moduleResolutionNativeModules", async () => {
			const missing = ModuleResolutionHelper.NATIVE_MODULES.filter(name =>
				Is.undefined(NativeModules.getModule(name))
			);
			if (missing.length > 0) {
				await NativeModules.init(missing);
			}
		});
	}

	/**
	 * Get the options to use when none have been set, local and package modules are resolved from
	 * the working directory, npm: and https: modules need options to be set as they install or download code.
	 * @param moduleName The module name.
	 * @returns The default options, or undefined if the module can not be resolved without options.
	 */
	public static getDefaultOptions(moduleName: string): IModuleHelperOptions | undefined {
		const protocol = ModuleResolutionHelper.parseModuleProtocol(moduleName).protocol;
		const hasNativeModules = ModuleResolutionHelper.NATIVE_MODULES.every(name =>
			Is.notEmpty(NativeModules.getModule(name))
		);
		const workingDirectory = NativeModules.getType<{ cwd: () => string }>("process")?.cwd();

		if (
			(protocol === ModuleProtocol.Local || protocol === ModuleProtocol.Default) &&
			hasNativeModules &&
			Is.stringValue(workingDirectory)
		) {
			return { executionDirectory: workingDirectory };
		}
	}

	/**
	 * Parse the protocol from a module name.
	 * @param moduleName The module name to parse.
	 * @returns The parsed protocol information.
	 */
	public static parseModuleProtocol(moduleName: string): IModuleProtocol {
		const trimmed = moduleName.trim();

		if (trimmed.startsWith("npm:")) {
			return { protocol: ModuleProtocol.Npm, identifier: trimmed.slice(4), original: trimmed };
		}

		if (trimmed.startsWith("https://")) {
			return { protocol: ModuleProtocol.Https, identifier: trimmed, original: trimmed };
		}

		if (trimmed.startsWith("http://")) {
			return { protocol: ModuleProtocol.Http, identifier: trimmed, original: trimmed };
		}

		if (trimmed.startsWith("file://") || trimmed.startsWith(".") || trimmed.startsWith("/")) {
			return { protocol: ModuleProtocol.Local, identifier: trimmed, original: trimmed };
		}

		return { protocol: ModuleProtocol.Default, identifier: trimmed, original: trimmed };
	}

	/**
	 * Resolve a module name to a file path.
	 * @param moduleName The module name.
	 * @param options The module resolution options.
	 * @param dependencyRootCache Cache of dependency tree searches, including misses.
	 * @returns The resolved file path, or undefined if it could not be resolved.
	 * @throws GeneralError if the module uses an insecure protocol or a native module is not registered.
	 */
	public static async resolveModulePath(
		moduleName: string,
		options: IModuleHelperOptions,
		dependencyRootCache?: Map<string, string | undefined>
	): Promise<string | undefined> {
		const nodePath = ModuleResolutionHelper.getNativeModule<typeof NodePath>("node:path");
		const parsed = ModuleResolutionHelper.parseModuleProtocol(moduleName);
		const executionDirectory = options.executionDirectory;

		switch (parsed.protocol) {
			case ModuleProtocol.Npm: {
				return (await ModuleResolutionHelper.handleNpmProtocol(parsed.identifier, options))
					.resolvedPath;
			}

			case ModuleProtocol.Https: {
				return (await ModuleResolutionHelper.handleHttpsProtocol(parsed.identifier, options))
					.resolvedPath;
			}

			case ModuleProtocol.Http: {
				throw new GeneralError(ModuleResolutionHelper.CLASS_NAME, "insecureProtocol", {
					protocol: ModuleProtocol.Http
				});
			}

			case ModuleProtocol.Local: {
				const localFilename = moduleName.startsWith("file://")
					? ModuleResolutionHelper.getNativeModule<typeof NodeUrl>("node:url").fileURLToPath(
							moduleName
						)
					: nodePath.resolve(moduleName);
				if (await ModuleResolutionHelper.fileExists(localFilename)) {
					return localFilename;
				}

				const executionFilename = nodePath.resolve(executionDirectory, moduleName);
				if (await ModuleResolutionHelper.fileExists(executionFilename)) {
					return executionFilename;
				}
				return;
			}

			default: {
				// Installed package, the npm protocol cache, nested dependencies, then the pnpm hoisted store.
				const npmCacheRoot = nodePath.join(
					ModuleResolutionHelper.getCacheDirectory(
						executionDirectory,
						ModuleProtocol.Npm,
						options.cacheDirectory
					),
					"node_modules"
				);
				const candidateRoots = [
					async () => ModuleResolutionHelper.findPackageRoot(moduleName, executionDirectory),
					async () => nodePath.resolve(npmCacheRoot, moduleName),
					async () => {
						const cacheKey = `${executionDirectory}|${moduleName}`;
						if (!dependencyRootCache?.has(cacheKey)) {
							dependencyRootCache?.set(
								cacheKey,
								await ModuleResolutionHelper.findDependencyPackageRoot(
									moduleName,
									executionDirectory
								)
							);
						}
						return dependencyRootCache?.get(cacheKey);
					},
					async () =>
						ModuleResolutionHelper.findPnpmHoistedPackageRoot(moduleName, executionDirectory)
				];

				for (const candidateRoot of candidateRoots) {
					const packagePath = await candidateRoot();
					if (Is.stringValue(packagePath)) {
						const mainFile = await ModuleResolutionHelper.resolvePackageEntryPoint(
							packagePath,
							moduleName
						);
						const modulePath = nodePath.resolve(packagePath, mainFile);
						if (await ModuleResolutionHelper.fileExists(modulePath)) {
							return modulePath;
						}
					}
				}
			}
		}
	}

	/**
	 * Hash a URL to create a safe filename.
	 * @param url The URL to hash.
	 * @returns A hashed filename safe for the filesystem.
	 */
	public static hashUrl(url: string): string {
		const nodePath = ModuleResolutionHelper.getNativeModule<typeof NodePath>("node:path");
		const hash = Converter.bytesToHex(Sha256.sum256(Converter.utf8ToBytes(url)));
		const ext = nodePath.extname(new URL(url).pathname);
		return `${hash}${ext}`;
	}

	/**
	 * Get the cache directory for a protocol.
	 * @param executionDirectory The execution directory.
	 * @param protocol The protocol type for subdirectory organisation.
	 * @param cacheDirectory The cache directory base path.
	 * @returns The cache directory path.
	 */
	public static getCacheDirectory(
		executionDirectory: string,
		protocol: ModuleProtocol,
		cacheDirectory?: string
	): string {
		const nodePath = ModuleResolutionHelper.getNativeModule<typeof NodePath>("node:path");
		return nodePath.join(
			nodePath.resolve(executionDirectory),
			cacheDirectory ?? ".tmp",
			"extensions",
			protocol
		);
	}

	/**
	 * Handle the npm: protocol by installing the package if needed.
	 * @param packageName The npm package name without the npm: prefix.
	 * @param options The module resolution options.
	 * @returns The resolved path to the installed module.
	 * @throws GeneralError if the package could not be installed.
	 */
	public static async handleNpmProtocol(
		packageName: string,
		options: IModuleHelperOptions
	): Promise<IProtocolHandlerResult> {
		const nodePath = ModuleResolutionHelper.getNativeModule<typeof NodePath>("node:path");
		const nodeFs = ModuleResolutionHelper.getNativeModule<typeof NodeFs>("node:fs/promises");
		const nodeChildProcess =
			ModuleResolutionHelper.getNativeModule<typeof NodeChildProcess>("node:child_process");

		const cacheDir = ModuleResolutionHelper.getCacheDirectory(
			options.executionDirectory,
			ModuleProtocol.Npm,
			options.cacheDirectory
		);
		// lastIndexOf keeps the scope of "@scope/pkg@1.0.0", "> 0" leaves "@scope/pkg" unchanged.
		const lastAtIndex = packageName.lastIndexOf("@");
		const packageNameOnly = lastAtIndex > 0 ? packageName.slice(0, lastAtIndex) : packageName;
		const packageDir = nodePath.join(cacheDir, "node_modules", packageNameOnly);

		if (await ModuleResolutionHelper.fileExists(nodePath.join(packageDir, "package.json"))) {
			const mainFile = await ModuleResolutionHelper.resolvePackageEntryPoint(
				packageDir,
				packageNameOnly
			);
			return { resolvedPath: nodePath.join(packageDir, mainFile), cached: true };
		}

		await nodeFs.mkdir(cacheDir, { recursive: true });

		options.onMessage?.("info", "moduleResolutionHelper.npmInstalling", { package: packageName });

		try {
			nodeChildProcess.execSync(
				`npm install ${packageName} --prefix "${cacheDir}" --omit=dev --no-save --no-package-lock`,
				{ cwd: cacheDir, stdio: "pipe" }
			);
		} catch (err) {
			throw new GeneralError(
				ModuleResolutionHelper.CLASS_NAME,
				"npmInstallFailed",
				{ package: packageName },
				BaseError.fromError(err)
			);
		}

		const mainFile = await ModuleResolutionHelper.resolvePackageEntryPoint(
			packageDir,
			packageNameOnly
		);
		return { resolvedPath: nodePath.join(packageDir, mainFile), cached: false };
	}

	/**
	 * Check if a cached file has expired based on TTL and force refresh settings.
	 * @param metadataPath Path to the cache metadata file.
	 * @param ttlHours Time to live in hours.
	 * @param forceRefresh Whether to force refresh regardless of TTL.
	 * @returns True if the cache is expired or should be refreshed.
	 */
	public static async isCacheExpired(
		metadataPath: string,
		ttlHours: number,
		forceRefresh: boolean
	): Promise<boolean> {
		if (forceRefresh) {
			return true;
		}

		try {
			const metadata = await ModuleResolutionHelper.loadJsonFile<ICacheMetadata>(metadataPath);
			const ttlMillis = ttlHours * 60 * 60 * 1000;
			return Date.now() > metadata.downloadedAt + ttlMillis;
		} catch {
			// Missing or corrupted metadata is treated as expired.
			return true;
		}
	}

	/**
	 * Handle the https: protocol by downloading the module if needed.
	 * @param url The HTTPS URL to download from.
	 * @param options The module resolution options.
	 * @returns The resolved path to the downloaded module.
	 * @throws GeneralError if the download failed.
	 */
	public static async handleHttpsProtocol(
		url: string,
		options: IModuleHelperOptions
	): Promise<IProtocolHandlerResult> {
		const nodePath = ModuleResolutionHelper.getNativeModule<typeof NodePath>("node:path");
		const nodeFs = ModuleResolutionHelper.getNativeModule<typeof NodeFs>("node:fs/promises");
		const nodeHttps = ModuleResolutionHelper.getNativeModule<typeof NodeHttps>("node:https");

		const ttlHours = options.cacheTtlHours ?? 24;
		const forceRefresh = options.forceRefresh ?? false;
		const cacheDir = ModuleResolutionHelper.getCacheDirectory(
			options.executionDirectory,
			ModuleProtocol.Https,
			options.cacheDirectory
		);
		const cachedPath = nodePath.join(cacheDir, ModuleResolutionHelper.hashUrl(url));
		const metadataPath = `${cachedPath}.meta`;

		if (await ModuleResolutionHelper.fileExists(cachedPath)) {
			if (!(await ModuleResolutionHelper.isCacheExpired(metadataPath, ttlHours, forceRefresh))) {
				return { resolvedPath: cachedPath, cached: true };
			}

			if (forceRefresh) {
				options.onMessage?.("warning", "moduleResolutionHelper.forceRefresh", { url });
			} else {
				options.onMessage?.("info", "moduleResolutionHelper.cacheExpired", { url });
			}
		}

		options.onMessage?.("warning", "moduleResolutionHelper.securityWarning", { url });
		options.onMessage?.("info", "moduleResolutionHelper.httpsDownloading", { url });

		await nodeFs.mkdir(cacheDir, { recursive: true });

		const maxSizeBytes = (options.maxSizeMb ?? 10) * 1024 * 1024;
		let downloadedSize = 0;
		const chunks: Uint8Array[] = [];

		try {
			await new Promise<void>((resolve, reject) => {
				nodeHttps
					.get(url, response => {
						if (response.statusCode !== 200) {
							reject(
								new GeneralError(ModuleResolutionHelper.CLASS_NAME, "downloadFailed", {
									url,
									status: response.statusCode ?? 0
								})
							);
							return;
						}

						response.on("data", (chunk: Uint8Array) => {
							downloadedSize += chunk.length;

							if (downloadedSize > maxSizeBytes) {
								response.destroy();
								reject(
									new GeneralError(ModuleResolutionHelper.CLASS_NAME, "sizeLimitExceeded", {
										size: downloadedSize,
										limit: maxSizeBytes
									})
								);
								return;
							}

							chunks.push(chunk);
						});

						response.on("end", () => resolve());

						response.on("error", err => reject(BaseError.fromError(err)));
					})
					.on("error", err => reject(BaseError.fromError(err)));
			});
		} catch (err) {
			throw new GeneralError(
				ModuleResolutionHelper.CLASS_NAME,
				"downloadFailed",
				{ url },
				BaseError.fromError(err)
			);
		}

		const content = new Uint8Array(downloadedSize);
		let offset = 0;
		for (const chunk of chunks) {
			content.set(chunk, offset);
			offset += chunk.length;
		}

		const tempPath = `${cachedPath}.tmp`;
		await nodeFs.writeFile(tempPath, content);
		await nodeFs.rename(tempPath, cachedPath);

		const metadata: ICacheMetadata = { downloadedAt: Date.now(), url, size: content.length };
		await nodeFs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

		return { resolvedPath: cachedPath, cached: false };
	}

	/**
	 * Resolve the main entry point from a package directory.
	 * @param packagePath The absolute path to the package directory.
	 * @param packageName The package name.
	 * @param fallback The fallback file name if no entry point is found.
	 * @returns The resolved entry point file name relative to the package directory.
	 */
	public static async resolvePackageEntryPoint(
		packagePath: string,
		packageName: string,
		fallback = "index.js"
	): Promise<string> {
		const nodePath = ModuleResolutionHelper.getNativeModule<typeof NodePath>("node:path");
		try {
			// Handles exports, main and module fields.
			const nodeModule = ModuleResolutionHelper.getNativeModule<typeof NodeModule>("node:module");
			const resolvedPath = nodeModule.createRequire(import.meta.url).resolve(packageName, {
				paths: [nodePath.dirname(packagePath)]
			});
			return nodePath.relative(packagePath, resolvedPath);
		} catch {
			try {
				const packageJson = await ModuleResolutionHelper.loadJsonFile<{
					module?: string;
					main?: string;
				}>(nodePath.join(packagePath, "package.json"));
				return packageJson.module ?? packageJson.main ?? fallback;
			} catch {
				return fallback;
			}
		}
	}

	/**
	 * Find the root folder of a package by walking up the node_modules folders from a start folder.
	 * @param packageName The name of the package to locate.
	 * @param startFolder The folder to start the search from.
	 * @returns The real path of the package root folder, or undefined if it was not found.
	 */
	public static async findPackageRoot(
		packageName: string,
		startFolder: string
	): Promise<string | undefined> {
		const nodePath = ModuleResolutionHelper.getNativeModule<typeof NodePath>("node:path");
		const nodeFs = ModuleResolutionHelper.getNativeModule<typeof NodeFs>("node:fs/promises");
		let currentFolder = nodePath.resolve(startFolder);
		let searching = true;

		while (searching) {
			// A node_modules folder never contains a nested node_modules folder of its own.
			if (nodePath.basename(currentFolder) !== "node_modules") {
				const packageFolder = nodePath.join(currentFolder, "node_modules", packageName);

				if (await ModuleResolutionHelper.fileExists(nodePath.join(packageFolder, "package.json"))) {
					// Resolve symlinks so walking up finds the dependencies of the package itself.
					try {
						return await nodeFs.realpath(packageFolder);
					} catch {
						return packageFolder;
					}
				}
			}

			const parentFolder = nodePath.dirname(currentFolder);
			searching = parentFolder !== currentFolder;
			currentFolder = parentFolder;
		}
	}

	/**
	 * Find the root folder of a package anywhere in the dependency tree of a folder, this locates
	 * packages which are only reachable from a nested dependency when the package manager does not hoist them.
	 * @param packageName The name of the package to locate.
	 * @param startFolder The folder to start the search from, the nearest folder at or above it with a package.json is used.
	 * @returns The resolved root folder of the package, or undefined if it is not in the dependency tree.
	 */
	public static async findDependencyPackageRoot(
		packageName: string,
		startFolder: string
	): Promise<string | undefined> {
		const nodePath = ModuleResolutionHelper.getNativeModule<typeof NodePath>("node:path");
		let packageFolder = nodePath.resolve(startFolder);
		while (
			!(await ModuleResolutionHelper.fileExists(nodePath.join(packageFolder, "package.json"))) &&
			nodePath.dirname(packageFolder) !== packageFolder
		) {
			packageFolder = nodePath.dirname(packageFolder);
		}

		const queue = [packageFolder];
		const visited = new Set<string>(queue);

		// Breadth first so the shallowest, and most likely intended, copy of the package is found.
		while (queue.length > 0) {
			const folder = queue.shift() as string;

			let dependencyNames: string[] = [];
			try {
				const packageJson = await ModuleResolutionHelper.loadJsonFile<{
					dependencies?: { [name: string]: string };
					optionalDependencies?: { [name: string]: string };
					peerDependencies?: { [name: string]: string };
				}>(nodePath.join(folder, "package.json"));
				dependencyNames = [
					...Object.keys(packageJson.dependencies ?? {}),
					...Object.keys(packageJson.optionalDependencies ?? {}),
					...Object.keys(packageJson.peerDependencies ?? {})
				];
			} catch {
				// A folder without a readable package.json has no dependencies to follow.
			}

			for (const dependencyName of dependencyNames) {
				const dependencyRoot = await ModuleResolutionHelper.findPackageRoot(dependencyName, folder);
				if (Is.stringValue(dependencyRoot)) {
					if (dependencyName === packageName) {
						return dependencyRoot;
					}
					if (!visited.has(dependencyRoot)) {
						visited.add(dependencyRoot);
						queue.push(dependencyRoot);
					}
				}
			}
		}
	}

	/**
	 * Find a package in the pnpm virtual store hoisted folder (node_modules/.pnpm/node_modules) by walking
	 * up from a start folder, this is where a bare import from an installed package finds undeclared dependencies.
	 * @param packageName The name of the package to locate.
	 * @param startFolder The folder to start the search from.
	 * @returns The real path of the package root folder, or undefined if it was not found.
	 */
	public static async findPnpmHoistedPackageRoot(
		packageName: string,
		startFolder: string
	): Promise<string | undefined> {
		const nodePath = ModuleResolutionHelper.getNativeModule<typeof NodePath>("node:path");
		const nodeFs = ModuleResolutionHelper.getNativeModule<typeof NodeFs>("node:fs/promises");
		let currentFolder = nodePath.resolve(startFolder);
		let searching = true;

		while (searching) {
			const packageFolder = nodePath.join(
				currentFolder,
				"node_modules",
				".pnpm",
				"node_modules",
				packageName
			);

			if (await ModuleResolutionHelper.fileExists(nodePath.join(packageFolder, "package.json"))) {
				try {
					return await nodeFs.realpath(packageFolder);
				} catch {
					return packageFolder;
				}
			}

			const parentFolder = nodePath.dirname(currentFolder);
			searching = parentFolder !== currentFolder;
			currentFolder = parentFolder;
		}
	}

	/**
	 * Convert a file path to an import compatible URL, adding the file:// prefix on Windows.
	 * @param filePath The absolute file path to convert.
	 * @returns A URL string compatible with dynamic import().
	 */
	public static createModuleImportUrl(filePath: string): string {
		const platform = NativeModules.getType<{ platform: string }>("process")?.platform;
		return platform === "win32" ? `file://${filePath}` : filePath;
	}

	/**
	 * Get a registered native module.
	 * @param name The module specifier.
	 * @returns The module.
	 * @throws GeneralError if the module has not been registered with NativeModules.init().
	 * @internal
	 */
	private static getNativeModule<T>(name: string): T {
		const nativeModule = NativeModules.getModule<T>(name);
		if (Is.undefined(nativeModule)) {
			throw new GeneralError(ModuleResolutionHelper.CLASS_NAME, "nativeModuleMissing", {
				module: name
			});
		}
		return nativeModule;
	}

	/**
	 * Does the specified file exist.
	 * @param filename The filename to check.
	 * @returns True if the file exists.
	 * @internal
	 */
	private static async fileExists(filename: string): Promise<boolean> {
		const nodeFs = ModuleResolutionHelper.getNativeModule<typeof NodeFs>("node:fs/promises");
		try {
			return (await nodeFs.stat(filename)).isFile();
		} catch {
			return false;
		}
	}

	/**
	 * Load and parse a JSON file.
	 * @param filename The filename to load.
	 * @returns The parsed content.
	 * @internal
	 */
	private static async loadJsonFile<T>(filename: string): Promise<T> {
		const nodeFs = ModuleResolutionHelper.getNativeModule<typeof NodeFs>("node:fs/promises");
		return JSON.parse(await nodeFs.readFile(filename, "utf8")) as T;
	}
}
