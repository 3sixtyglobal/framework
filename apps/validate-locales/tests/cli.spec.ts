// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CLIDisplay } from "@twin.org/cli-core";
import { CLI } from "../src/cli.js";

const testDir = path.dirname(fileURLToPath(import.meta.url));

let writeBuffer: string[] = [];
let errorBuffer: string[] = [];
const localesDirectory = "./dist/locales/";

describe("CLI", () => {
	beforeEach(() => {
		writeBuffer = [];
		errorBuffer = [];

		CLIDisplay.write = (str: string | Uint8Array): void => {
			writeBuffer.push(...str.toString().split("\n"));
		};

		CLIDisplay.writeError = (str: string | Uint8Array): void => {
			errorBuffer.push(...str.toString().split("\n"));
		};
	});

	test("Can validate source with valid error class locale usage", async () => {
		const fixture = path.join(testDir, "fixtures", "valid-error-class");
		const cli = new CLI();
		const exitCode = await cli.run(
			[
				"",
				"",
				"--source",
				path.join(fixture, "src/**/*.ts"),
				"--locales",
				path.join(fixture, "locales/**/*.json")
			],
			localesDirectory,
			{ overrideOutputWidth: 1000 }
		);
		expect(exitCode).toEqual(0);
	});

	test("Can validate source with valid health check locale usage", async () => {
		const fixture = path.join(testDir, "fixtures", "valid-health-check");
		const cli = new CLI();
		const exitCode = await cli.run(
			[
				"",
				"",
				"--source",
				path.join(fixture, "src/**/*.ts"),
				"--locales",
				path.join(fixture, "locales/**/*.json")
			],
			localesDirectory,
			{ overrideOutputWidth: 1000 }
		);
		expect(exitCode).toEqual(0);
	});

	test("Can validate source with valid log entry locale usage", async () => {
		const fixture = path.join(testDir, "fixtures", "valid-log-entry");
		const cli = new CLI();
		const exitCode = await cli.run(
			[
				"",
				"",
				"--source",
				path.join(fixture, "src/**/*.ts"),
				"--locales",
				path.join(fixture, "locales/**/*.json")
			],
			localesDirectory,
			{ overrideOutputWidth: 1000 }
		);
		expect(exitCode).toEqual(0);
	});

	test("Fails validation when a locale key referenced in source is missing from the locale file", async () => {
		const fixture = path.join(testDir, "fixtures", "missing-key");
		const cli = new CLI();
		const exitCode = await cli.run(
			[
				"",
				"",
				"--source",
				path.join(fixture, "src/**/*.ts"),
				"--locales",
				path.join(fixture, "locales/**/*.json")
			],
			localesDirectory,
			{ overrideOutputWidth: 1000 }
		);
		expect(exitCode).toEqual(1);
		expect(errorBuffer.some(line => line.includes("error.myClass.missingKey"))).toEqual(true);
	});

	test("Fails validation when a locale message property is not passed in source", async () => {
		const fixture = path.join(testDir, "fixtures", "missing-property");
		const cli = new CLI();
		const exitCode = await cli.run(
			[
				"",
				"",
				"--source",
				path.join(fixture, "src/**/*.ts"),
				"--locales",
				path.join(fixture, "locales/**/*.json")
			],
			localesDirectory,
			{ overrideOutputWidth: 1000 }
		);
		expect(exitCode).toEqual(1);
		expect(errorBuffer.some(line => line.includes("count"))).toEqual(true);
	});

	test("Fails validation when a locale entry is defined but never referenced in source files", async () => {
		const fixture = path.join(testDir, "fixtures", "unused-key");
		const cli = new CLI();
		const exitCode = await cli.run(
			[
				"",
				"",
				"--source",
				path.join(fixture, "src/**/*.ts"),
				"--locales",
				path.join(fixture, "locales/**/*.json")
			],
			localesDirectory,
			{ overrideOutputWidth: 1000 }
		);
		expect(exitCode).toEqual(1);
		expect(errorBuffer.some(line => line.includes("error.myClass.unusedKey"))).toEqual(true);
	});

	test("Fails validation when a health check locale key is missing from the locale file", async () => {
		const fixture = path.join(testDir, "fixtures", "health-check-missing-key");
		const cli = new CLI();
		const exitCode = await cli.run(
			[
				"",
				"",
				"--source",
				path.join(fixture, "src/**/*.ts"),
				"--locales",
				path.join(fixture, "locales/**/*.json")
			],
			localesDirectory,
			{ overrideOutputWidth: 1000 }
		);
		expect(exitCode).toEqual(1);
		expect(errorBuffer.some(line => line.includes("health.myServer.reachable"))).toEqual(true);
	});
});
