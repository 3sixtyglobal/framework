// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { NativeModules, SharedStore } from "@twin.org/core";
import { ModuleHelper } from "../../src/helpers/moduleHelper.js";
import { ModuleResolutionHelper } from "../../src/helpers/moduleResolutionHelper.js";
import { ModuleProtocol } from "../../src/models/moduleProtocol.js";

describe("ModuleResolutionHelper", () => {
	beforeAll(async () => {
		await ModuleResolutionHelper.initNativeModules();
	});

	describe("parseModuleProtocol", () => {
		test("should parse npm: protocol correctly", () => {
			const result = ModuleResolutionHelper.parseModuleProtocol("npm:@twin.org/identity-service");

			expect(result.protocol).toEqual(ModuleProtocol.Npm);
			expect(result.identifier).toEqual("@twin.org/identity-service");
			expect(result.original).toEqual("npm:@twin.org/identity-service");
		});

		test("should parse npm: protocol with scoped package", () => {
			const result = ModuleResolutionHelper.parseModuleProtocol("npm:@myorg/custom-extension");

			expect(result.protocol).toEqual(ModuleProtocol.Npm);
			expect(result.identifier).toEqual("@myorg/custom-extension");
			expect(result.original).toEqual("npm:@myorg/custom-extension");
		});

		test("should parse https: protocol correctly", () => {
			const result = ModuleResolutionHelper.parseModuleProtocol("https://example.com/module.js");

			expect(result.protocol).toEqual(ModuleProtocol.Https);
			expect(result.identifier).toEqual("https://example.com/module.js");
			expect(result.original).toEqual("https://example.com/module.js");
		});

		test("should parse http: protocol correctly", () => {
			const result = ModuleResolutionHelper.parseModuleProtocol("http://example.com/module.js");

			expect(result.protocol).toEqual(ModuleProtocol.Http);
			expect(result.identifier).toEqual("http://example.com/module.js");
			expect(result.original).toEqual("http://example.com/module.js");
		});

		test("should parse file: protocol as local correctly", () => {
			const result = ModuleResolutionHelper.parseModuleProtocol("file:///path/to/extension.js");

			expect(result.protocol).toEqual(ModuleProtocol.Local);
			expect(result.identifier).toEqual("file:///path/to/extension.js");
			expect(result.original).toEqual("file:///path/to/extension.js");
		});

		test("should parse local relative path correctly", () => {
			const result = ModuleResolutionHelper.parseModuleProtocol("./fixtures/myExtension.js");

			expect(result.protocol).toEqual(ModuleProtocol.Local);
			expect(result.identifier).toEqual("./fixtures/myExtension.js");
			expect(result.original).toEqual("./fixtures/myExtension.js");
		});

		test("should parse local absolute path correctly", () => {
			const result = ModuleResolutionHelper.parseModuleProtocol("/absolute/path/extension.js");

			expect(result.protocol).toEqual(ModuleProtocol.Local);
			expect(result.identifier).toEqual("/absolute/path/extension.js");
			expect(result.original).toEqual("/absolute/path/extension.js");
		});

		test("should parse default npm package correctly", () => {
			const result = ModuleResolutionHelper.parseModuleProtocol("@twin.org/identity-service");

			expect(result.protocol).toEqual(ModuleProtocol.Default);
			expect(result.identifier).toEqual("@twin.org/identity-service");
			expect(result.original).toEqual("@twin.org/identity-service");
		});

		test("should parse unscoped npm package as default", () => {
			const result = ModuleResolutionHelper.parseModuleProtocol("lodash");

			expect(result.protocol).toEqual(ModuleProtocol.Default);
			expect(result.identifier).toEqual("lodash");
			expect(result.original).toEqual("lodash");
		});

		test("should trim whitespace from module name", () => {
			const result = ModuleResolutionHelper.parseModuleProtocol("  npm:@twin.org/service  ");

			expect(result.protocol).toEqual(ModuleProtocol.Npm);
			expect(result.identifier).toEqual("@twin.org/service");
		});

		test("should handle module name with path after protocol", () => {
			const result = ModuleResolutionHelper.parseModuleProtocol(
				"https://cdn.example.com/path/to/module.js?version=1.0.0"
			);

			expect(result.protocol).toEqual(ModuleProtocol.Https);
			expect(result.identifier).toEqual("https://cdn.example.com/path/to/module.js?version=1.0.0");
		});
	});

	describe("hashUrl", () => {
		test("should generate consistent hash for same URL", () => {
			const url = "https://example.com/module.js";
			const hash1 = ModuleResolutionHelper.hashUrl(url);
			const hash2 = ModuleResolutionHelper.hashUrl(url);

			expect(hash1).toEqual(hash2);
			expect(hash1).toMatch(/^[\da-f]{64}\.js$/);
		});

		test("should generate different hashes for different URLs", () => {
			const hash1 = ModuleResolutionHelper.hashUrl("https://example.com/module1.js");
			const hash2 = ModuleResolutionHelper.hashUrl("https://example.com/module2.js");

			expect(hash1).not.toEqual(hash2);
		});

		test("should preserve file extension from URL", () => {
			const jsHash = ModuleResolutionHelper.hashUrl("https://example.com/module.js");
			const mjsHash = ModuleResolutionHelper.hashUrl("https://example.com/module.js");
			const tsHash = ModuleResolutionHelper.hashUrl("https://example.com/module.ts");

			expect(jsHash).toMatch(/\.js$/);
			expect(mjsHash).toMatch(/\.js$/);
			expect(tsHash).toMatch(/\.ts$/);
		});

		test("should handle URL without extension", () => {
			const hash = ModuleResolutionHelper.hashUrl("https://example.com/module");

			expect(hash).toMatch(/^[\da-f]{64}$/);
		});

		test("should handle URL with query parameters", () => {
			const hash = ModuleResolutionHelper.hashUrl("https://example.com/module.js?version=1.0.0");

			expect(hash).toMatch(/^[\da-f]{64}\.js$/);
		});

		test("should handle URL with hash fragment", () => {
			const hash = ModuleResolutionHelper.hashUrl("https://example.com/module.js#section");

			expect(hash).toMatch(/^[\da-f]{64}\.js$/);
		});
	});

	describe("getCacheDirectory", () => {
		test("should generate correct path for npm protocol", () => {
			const cachePath = ModuleResolutionHelper.getCacheDirectory(
				"/home/user/project",
				ModuleProtocol.Npm,
				".tmp"
			);

			expect(cachePath).toContain(".tmp");
			expect(cachePath).toContain("extensions");
			expect(cachePath).toContain(ModuleProtocol.Npm);
			expect(cachePath).toMatch(/[/\\]\.tmp[/\\]extensions[/\\]npm$/);
		});

		test("should generate correct path for https protocol", () => {
			const cachePath = ModuleResolutionHelper.getCacheDirectory(
				"/home/user/project",
				ModuleProtocol.Https,
				".tmp"
			);

			expect(cachePath).toContain(".tmp");
			expect(cachePath).toContain("extensions");
			expect(cachePath).toContain(ModuleProtocol.Https);
			expect(cachePath).toMatch(/[/\\]\.tmp[/\\]extensions[/\\]https$/);
		});

		test("should generate correct path for local protocol", () => {
			const cachePath = ModuleResolutionHelper.getCacheDirectory(
				"/home/user/project",
				ModuleProtocol.Local,
				".tmp"
			);

			expect(cachePath).toContain(".tmp");
			expect(cachePath).toContain("extensions");
			expect(cachePath).toContain(ModuleProtocol.Local);
		});

		test("should use execution directory as base", () => {
			const execDir = "/custom/execution/dir";
			const resultPath = ModuleResolutionHelper.getCacheDirectory(
				execDir,
				ModuleProtocol.Npm,
				".tmp"
			);

			// Normalize path separators for cross-platform comparison
			const normalizedResult = resultPath.replace(/\\/g, "/");
			const normalizedExecDir = execDir.replace(/\\/g, "/");

			expect(normalizedResult).toContain(normalizedExecDir);
		});

		test("should work with Windows-style paths", () => {
			const cachePath = ModuleResolutionHelper.getCacheDirectory(
				"C:\\Users\\user\\project",
				ModuleProtocol.Npm,
				".tmp"
			);

			expect(cachePath).toContain(".tmp");
			expect(cachePath).toContain("extensions");
			expect(cachePath).toContain(ModuleProtocol.Npm);
		});

		test("should use custom cache directory when provided", () => {
			const cachePath = ModuleResolutionHelper.getCacheDirectory(
				"/home/user/project",
				ModuleProtocol.Npm,
				"cache"
			);

			expect(cachePath).toContain("cache");
			expect(cachePath).toContain("extensions");
			expect(cachePath).toContain(ModuleProtocol.Npm);
			expect(cachePath).not.toContain(".tmp");
			expect(cachePath).toMatch(/[/\\]cache[/\\]extensions[/\\]npm$/);
		});

		test("should use default .tmp when custom directory is undefined", () => {
			const cachePath = ModuleResolutionHelper.getCacheDirectory(
				"/home/user/project",
				ModuleProtocol.Npm,
				undefined
			);

			expect(cachePath).toContain(".tmp");
			expect(cachePath).toContain("extensions");
			expect(cachePath).toContain(ModuleProtocol.Npm);
			expect(cachePath).toMatch(/[/\\]\.tmp[/\\]extensions[/\\]npm$/);
		});

		test("should work with absolute custom cache directory", () => {
			const customDir = "/var/cache/twin-node";
			const cachePath = ModuleResolutionHelper.getCacheDirectory(
				"/home/user/project",
				ModuleProtocol.Https,
				customDir
			);

			expect(cachePath).toContain("extensions");
			expect(cachePath).toContain(ModuleProtocol.Https);
			expect(cachePath).toMatch(/[/\\]var[/\\]cache[/\\]twin-node[/\\]extensions[/\\]https$/);
		});
	});

	describe("isCacheExpired", () => {
		test("should return true when forceRefresh is true", async () => {
			const result = await ModuleResolutionHelper.isCacheExpired("/fake/path.meta", 24, true);
			expect(result).toBe(true);
		});

		test("should return true when metadata file doesn't exist", async () => {
			const result = await ModuleResolutionHelper.isCacheExpired(
				"/nonexistent/path.meta",
				24,
				false
			);
			expect(result).toBe(true);
		});

		test("should return false when cache is not expired", async () => {
			const tempDir = await mkdtemp(path.join(tmpdir(), "cache-test-"));
			const metadataPath = path.join(tempDir, "test.meta");
			const twelveHoursMillis = 12 * 60 * 60 * 1000;

			// Create metadata with recent timestamp (not expired)
			const metadata = {
				downloadedAt: Date.now() - twelveHoursMillis, // 12 hours ago
				url: "https://example.com/test.js",
				size: 1024
			};
			await writeFile(metadataPath, JSON.stringify(metadata));

			const result = await ModuleResolutionHelper.isCacheExpired(metadataPath, 24, false); // TTL 24 hours
			expect(result).toBe(false);

			// Cleanup
			await rm(tempDir, { recursive: true, force: true });
		});

		test("should return true when cache is expired", async () => {
			const tempDir = await mkdtemp(path.join(tmpdir(), "cache-test-"));
			const metadataPath = path.join(tempDir, "test.meta");
			const twoDaysMillis = 48 * 60 * 60 * 1000;
			// Create metadata with old timestamp (expired)
			const metadata = {
				downloadedAt: Date.now() - twoDaysMillis, // 48 hours ago
				url: "https://example.com/test.js",
				size: 1024
			};
			await writeFile(metadataPath, JSON.stringify(metadata));

			const result = await ModuleResolutionHelper.isCacheExpired(metadataPath, 24, false); // TTL 24 hours
			expect(result).toBe(true);

			// Cleanup
			await rm(tempDir, { recursive: true, force: true });
		});

		test("should return true when metadata is corrupted", async () => {
			const tempDir = await mkdtemp(path.join(tmpdir(), "cache-test-"));
			const metadataPath = path.join(tempDir, "test.meta");

			// Create corrupted metadata
			await writeFile(metadataPath, "invalid json content");

			const result = await ModuleResolutionHelper.isCacheExpired(metadataPath, 24, false);
			expect(result).toBe(true);

			// Cleanup
			await rm(tempDir, { recursive: true, force: true });
		});

		test("should handle edge case with TTL of 0", async () => {
			const tempDir = await mkdtemp(path.join(tmpdir(), "cache-test-"));
			const metadataPath = path.join(tempDir, "test.meta");

			// Create metadata with any timestamp
			const metadata = {
				downloadedAt: Date.now() - 1000, // 1 second ago
				url: "https://example.com/test.js",
				size: 1024
			};
			await writeFile(metadataPath, JSON.stringify(metadata));

			const result = await ModuleResolutionHelper.isCacheExpired(metadataPath, 0, false); // TTL 0 hours
			expect(result).toBe(true); // Should always be expired with TTL 0

			// Cleanup
			await rm(tempDir, { recursive: true, force: true });
		});
	});

	describe("createModuleImportUrl", () => {
		test("should create correct import URL for Windows platform", () => {
			// Mock Windows platform
			const originalPlatform = process.platform;
			Object.defineProperty(process, "platform", {
				value: "win32"
			});

			const filePath = "C:\\Users\\user\\project\\module.js";
			const result = ModuleResolutionHelper.createModuleImportUrl(filePath);

			expect(result).toEqual(`file://${filePath}`);

			// Restore original platform
			Object.defineProperty(process, "platform", {
				value: originalPlatform
			});
		});

		test("should create correct import URL for non-Windows platforms", () => {
			// Mock non-Windows platform
			const originalPlatform = process.platform;
			Object.defineProperty(process, "platform", {
				value: "linux"
			});

			const filePath = "/home/user/project/module.js";
			const result = ModuleResolutionHelper.createModuleImportUrl(filePath);

			expect(result).toEqual(filePath);

			// Restore original platform
			Object.defineProperty(process, "platform", {
				value: originalPlatform
			});
		});

		test("should handle absolute paths correctly", () => {
			const originalPlatform = process.platform;

			// Test Windows absolute path
			Object.defineProperty(process, "platform", {
				value: "win32"
			});

			const windowsPath = "C:\\Program Files\\Node\\module.js";
			const windowsResult = ModuleResolutionHelper.createModuleImportUrl(windowsPath);
			expect(windowsResult).toEqual(`file://${windowsPath}`);

			// Test Unix absolute path
			Object.defineProperty(process, "platform", {
				value: "darwin"
			});

			const unixPath = "/usr/local/lib/node_modules/module.js";
			const unixResult = ModuleResolutionHelper.createModuleImportUrl(unixPath);
			expect(unixResult).toEqual(unixPath);

			// Restore original platform
			Object.defineProperty(process, "platform", {
				value: originalPlatform
			});
		});
	});

	describe("dependency resolution", () => {
		let hostDir: string;

		beforeAll(async () => {
			// The host only depends on host-dep, nested-dep is installed below host-dep and not hoisted.
			hostDir = await mkdtemp(path.join(tmpdir(), "module-helper-host-"));
			const hostDepDir = path.join(hostDir, "node_modules", "host-dep");
			const nestedDepDir = path.join(hostDepDir, "node_modules", "nested-dep");
			await mkdir(nestedDepDir, { recursive: true });
			await writeFile(
				path.join(hostDir, "package.json"),
				JSON.stringify({ name: "nested-host", dependencies: { "host-dep": "1.0.0" } })
			);
			await writeFile(
				path.join(hostDepDir, "package.json"),
				JSON.stringify({ name: "host-dep", dependencies: { "nested-dep": "1.0.0" } })
			);
			await writeFile(
				path.join(nestedDepDir, "package.json"),
				JSON.stringify({ name: "nested-dep", type: "module", main: "index.js" })
			);
			await writeFile(
				path.join(nestedDepDir, "index.js"),
				"export function multiply(a, b) { return a * b; }"
			);
			await writeFile(
				path.join(hostDir, "workerModule.js"),
				"export function add(a, b) { return a + b; }"
			);
			// peer-only is only declared as a peer dependency of host-dep.
			const peerDepDir = path.join(hostDepDir, "node_modules", "peer-only");
			await mkdir(peerDepDir, { recursive: true });
			await writeFile(
				path.join(hostDepDir, "package.json"),
				JSON.stringify({
					name: "host-dep",
					dependencies: { "nested-dep": "1.0.0" },
					peerDependencies: { "peer-only": "1.0.0" }
				})
			);
			await writeFile(path.join(peerDepDir, "package.json"), JSON.stringify({ name: "peer-only" }));
			await mkdir(path.join(hostDir, "sub", "folder"), { recursive: true });
			// hoisted-only is not declared anywhere, pnpm hoists it into the virtual store.
			const hoistedDir = path.join(
				hostDir,
				"node_modules",
				".pnpm",
				"node_modules",
				"hoisted-only"
			);
			await mkdir(hoistedDir, { recursive: true });
			await writeFile(
				path.join(hoistedDir, "package.json"),
				JSON.stringify({ name: "hoisted-only", type: "module", main: "index.js" })
			);
			await writeFile(
				path.join(hoistedDir, "index.js"),
				"export function subtract(a, b) { return a - b; }"
			);
		});

		/**
		 * Run the callback with the working directory set to the host.
		 * @param callback The callback to run.
		 * @returns The result of the callback.
		 */
		async function inHostDir<T>(callback: () => Promise<T>): Promise<T> {
			const cwd = process.cwd();
			process.chdir(hostDir);
			try {
				return await callback();
			} finally {
				process.chdir(cwd);
			}
		}

		afterAll(async () => {
			await rm(hostDir, { recursive: true, force: true });
		});

		afterEach(() => {
			SharedStore.remove("moduleHelperOptions");
			SharedStore.remove("moduleHelperCache");
		});

		test("finds a package only installed as a nested dependency", async () => {
			await expect(
				ModuleResolutionHelper.findDependencyPackageRoot("nested-dep", hostDir)
			).resolves.toEqual(
				await realpath(path.join(hostDir, "node_modules", "host-dep", "node_modules", "nested-dep"))
			);
		});

		test("returns undefined for a package not in the dependency tree", async () => {
			await expect(
				ModuleResolutionHelper.findDependencyPackageRoot("missing-dep", hostDir)
			).resolves.toBeUndefined();
		});

		test("finds an installed package root", async () => {
			await expect(ModuleResolutionHelper.findPackageRoot("host-dep", hostDir)).resolves.toEqual(
				await realpath(path.join(hostDir, "node_modules", "host-dep"))
			);
		});

		test("finds a package declared as a peer dependency", async () => {
			await expect(
				ModuleResolutionHelper.findDependencyPackageRoot("peer-only", hostDir)
			).resolves.toEqual(
				await realpath(path.join(hostDir, "node_modules", "host-dep", "node_modules", "peer-only"))
			);
		});

		test("finds a nested dependency when starting below the host package", async () => {
			await expect(
				ModuleResolutionHelper.findDependencyPackageRoot(
					"nested-dep",
					path.join(hostDir, "sub", "folder")
				)
			).resolves.toEqual(
				await realpath(path.join(hostDir, "node_modules", "host-dep", "node_modules", "nested-dep"))
			);
		});

		test("finds an undeclared package in the pnpm hoisted store", async () => {
			await expect(
				ModuleResolutionHelper.findPnpmHoistedPackageRoot("hoisted-only", path.join(hostDir, "sub"))
			).resolves.toEqual(
				await realpath(path.join(hostDir, "node_modules", ".pnpm", "node_modules", "hoisted-only"))
			);
			await expect(
				ModuleResolutionHelper.findDependencyPackageRoot("hoisted-only", hostDir)
			).resolves.toBeUndefined();
		});

		test("worker threads import an undeclared package from the pnpm hoisted store", async () => {
			ModuleHelper.setOptions({ executionDirectory: hostDir });

			await expect(
				ModuleHelper.execModuleMethodThread("hoisted-only", "subtract", [9, 4])
			).resolves.toEqual(5);
		});

		test("resolveModule resolves a nested dependency from the working directory without options", async () => {
			const nestedDir = await realpath(
				path.join(hostDir, "node_modules", "host-dep", "node_modules", "nested-dep")
			);

			await expect(
				inHostDir(async () => ModuleHelper.resolveModule("nested-dep"))
			).resolves.toEqual(
				ModuleResolutionHelper.createModuleImportUrl(path.join(nestedDir, "index.js"))
			);
		});

		test("worker threads import a nested dependency from the working directory without options", async () => {
			await expect(
				inHostDir(async () => ModuleHelper.execModuleMethodThread("nested-dep", "multiply", [4, 5]))
			).resolves.toEqual(20);
		});

		test("resolveModule does not resolve npm: or https: modules without options", async () => {
			await expect(ModuleHelper.resolveModule("npm:nested-dep")).resolves.toEqual("npm:nested-dep");
			await expect(ModuleHelper.resolveModule("https://example.com/module.js")).resolves.toEqual(
				"https://example.com/module.js"
			);
		});

		test("resolveModule registers the native modules it needs", async () => {
			const registry = NativeModules.getRegistry();
			delete registry["node:fs/promises"];
			SharedStore.remove("moduleResolutionNativeModules");

			const nestedDir = await realpath(
				path.join(hostDir, "node_modules", "host-dep", "node_modules", "nested-dep")
			);

			await expect(
				inHostDir(async () => ModuleHelper.resolveModule("nested-dep"))
			).resolves.toEqual(
				ModuleResolutionHelper.createModuleImportUrl(path.join(nestedDir, "index.js"))
			);
			expect(NativeModules.getModule("node:fs/promises")).toBeDefined();
		});

		test("resolveModule returns the module unchanged without options", async () => {
			await expect(ModuleHelper.resolveModule("nested-dep")).resolves.toEqual("nested-dep");
		});

		test("resolveModule resolves a file URL to the module path", async () => {
			ModuleHelper.setOptions({ executionDirectory: hostDir });

			const modulePath = path.join(hostDir, "workerModule.js");

			await expect(ModuleHelper.resolveModule(pathToFileURL(modulePath).href)).resolves.toEqual(
				ModuleResolutionHelper.createModuleImportUrl(modulePath)
			);
		});

		test("resolveModule rejects the insecure http protocol", async () => {
			ModuleHelper.setOptions({ executionDirectory: hostDir });

			await expect(
				ModuleHelper.resolveModule("http://example.com/module.js")
			).rejects.toMatchObject({
				name: "GeneralError",
				message: "moduleResolutionHelper.insecureProtocol",
				properties: { protocol: "http" }
			});
		});

		test("resolveModulePath throws if a native module is not registered", async () => {
			const registry = NativeModules.getRegistry();
			const nodePath = registry["node:path"];
			delete registry["node:path"];
			try {
				await expect(
					ModuleResolutionHelper.resolveModulePath("./workerModule.js", {
						executionDirectory: hostDir
					})
				).rejects.toMatchObject({
					name: "GeneralError",
					message: "moduleResolutionHelper.nativeModuleMissing",
					properties: { module: "node:path" }
				});
			} finally {
				registry["node:path"] = nodePath;
			}
		});

		test("worker threads import local modules from the execution directory", async () => {
			ModuleHelper.setOptions({ executionDirectory: hostDir });

			await expect(
				ModuleHelper.execModuleMethodThread("./workerModule.js", "add", [2, 3])
			).resolves.toEqual(5);
		});

		test("worker threads import a package only installed as a nested dependency", async () => {
			ModuleHelper.setOptions({ executionDirectory: hostDir });

			await expect(
				ModuleHelper.execModuleMethodThread("nested-dep", "multiply", [2, 3])
			).resolves.toEqual(6);
		});

		test("main thread imports a package only installed as a nested dependency", async () => {
			ModuleHelper.setOptions({ executionDirectory: hostDir });

			const multiply = await ModuleHelper.getModuleEntry<(a: number, b: number) => number>(
				"nested-dep",
				"multiply"
			);
			expect(multiply(3, 4)).toEqual(12);
		});
	});
});
