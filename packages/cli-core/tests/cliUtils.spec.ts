// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { mkdir, realpath, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { CLIUtils } from "../src/cliUtils.js";

const testRoot = path.resolve("./tests/.tmp/package-root");

/**
 * Create a package in the test structure.
 * @param packageFolder The folder to create the package in.
 * @param packageName The name of the package.
 * @returns The folder of the created package.
 */
async function createPackage(packageFolder: string, packageName: string): Promise<string> {
	const fullFolder = path.join(packageFolder, "node_modules", packageName);
	await mkdir(fullFolder, { recursive: true });
	await writeFile(path.join(fullFolder, "package.json"), JSON.stringify({ name: packageName }));
	return fullFolder;
}

describe("CLIUtils", () => {
	beforeAll(async () => {
		await rm(testRoot, { recursive: true, force: true });
		await mkdir(testRoot, { recursive: true });
	});

	afterAll(async () => {
		await rm(testRoot, { recursive: true, force: true });
	});

	test("Can find a package in the node_modules of the start folder", async () => {
		const packageFolder = await createPackage(testRoot, "@test/direct");

		const found = await CLIUtils.findPackageRoot("@test/direct", testRoot);

		expect(found).toEqual(await realpath(packageFolder));
	});

	test("Can find a package by walking up to a parent node_modules", async () => {
		const packageFolder = await createPackage(testRoot, "@test/parent");
		const startFolder = path.join(testRoot, "apps", "my-app", "src");
		await mkdir(startFolder, { recursive: true });

		const found = await CLIUtils.findPackageRoot("@test/parent", startFolder);

		expect(found).toEqual(await realpath(packageFolder));
	});

	test("Can find a package nested in the node_modules of another package", async () => {
		const storeFolder = path.join(testRoot, "node_modules", ".store", "@test+nested@1.0.0");
		const dependentFolder = await createPackage(storeFolder, "@test/dependent");
		const nestedFolder = await createPackage(storeFolder, "@test/nested");

		const found = await CLIUtils.findPackageRoot("@test/nested", dependentFolder);

		expect(found).toEqual(await realpath(nestedFolder));
	});

	test("Can return undefined when the package can not be found", async () => {
		const found = await CLIUtils.findPackageRoot("@test/missing", testRoot);

		expect(found).toBeUndefined();
	});
});
