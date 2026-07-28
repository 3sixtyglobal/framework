// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CLIDisplay, CLIUtils } from "@twin.org/cli-core";
import { I18n, type ILocaleDictionary } from "@twin.org/core";
import { actionCommandValidateLocales } from "../src/commands/validateLocales.js";

const testDir = path.dirname(fileURLToPath(import.meta.url));

let writeBuffer: string[] = [];
let errorBuffer: string[] = [];

describe("actionCommandValidateLocales", () => {
	beforeAll(() => {
		const localeContent = CLIUtils.readJsonFileSync<ILocaleDictionary>(
			path.join(testDir, "../dist/locales/en.json")
		);
		if (localeContent) {
			I18n.addDictionary("en", localeContent);
			I18n.setLocale("en");
		}
	});

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
		await actionCommandValidateLocales({
			source: path.join(fixture, "src/**/*.ts"),
			locales: path.join(fixture, "locales/**/*.json"),
			ignoreFile: path.join(fixture, "locales/.validate-ignore")
		});
		expect(errorBuffer.filter(l => l.length > 0)).toHaveLength(0);
	});

	test("Can validate source with valid health check locale usage", async () => {
		const fixture = path.join(testDir, "fixtures", "valid-health-check");
		await actionCommandValidateLocales({
			source: path.join(fixture, "src/**/*.ts"),
			locales: path.join(fixture, "locales/**/*.json"),
			ignoreFile: path.join(fixture, "locales/.validate-ignore")
		});
		expect(errorBuffer.filter(l => l.length > 0)).toHaveLength(0);
	});

	test("Can validate source with valid health check using StringHelper template literal source", async () => {
		const fixture = path.join(testDir, "fixtures", "valid-health-check-string-helper-source");
		await actionCommandValidateLocales({
			source: path.join(fixture, "src/**/*.ts"),
			locales: path.join(fixture, "locales/**/*.json"),
			ignoreFile: path.join(fixture, "locales/.validate-ignore")
		});
		expect(errorBuffer.filter(l => l.length > 0)).toHaveLength(0);
	});

	test("Can validate source with valid health check using template literal source", async () => {
		const fixture = path.join(testDir, "fixtures", "valid-health-check-template-source");
		await actionCommandValidateLocales({
			source: path.join(fixture, "src/**/*.ts"),
			locales: path.join(fixture, "locales/**/*.json"),
			ignoreFile: path.join(fixture, "locales/.validate-ignore")
		});
		expect(errorBuffer.filter(l => l.length > 0)).toHaveLength(0);
	});

	test("Can validate source with valid health check using string literal source", async () => {
		const fixture = path.join(testDir, "fixtures", "valid-health-check-string-source");
		await actionCommandValidateLocales({
			source: path.join(fixture, "src/**/*.ts"),
			locales: path.join(fixture, "locales/**/*.json"),
			ignoreFile: path.join(fixture, "locales/.validate-ignore")
		});
		expect(errorBuffer.filter(l => l.length > 0)).toHaveLength(0);
	});

	test("Can validate source with valid log entry locale usage", async () => {
		const fixture = path.join(testDir, "fixtures", "valid-log-entry");
		await actionCommandValidateLocales({
			source: path.join(fixture, "src/**/*.ts"),
			locales: path.join(fixture, "locales/**/*.json"),
			ignoreFile: path.join(fixture, "locales/.validate-ignore")
		});
		expect(errorBuffer.filter(l => l.length > 0)).toHaveLength(0);
	});

	test("Can validate source with ModuleHelper.execModuleMethod ignoring its parameters", async () => {
		const fixture = path.join(testDir, "fixtures", "valid-exec-module-method");
		await actionCommandValidateLocales({
			source: path.join(fixture, "src/**/*.ts"),
			locales: path.join(fixture, "locales/**/*.json"),
			ignoreFile: path.join(fixture, "locales/.validate-ignore")
		});
		expect(errorBuffer.filter(l => l.length > 0)).toHaveLength(0);
	});

	test("Fails validation when a locale key referenced in source is missing from the locale file", async () => {
		const fixture = path.join(testDir, "fixtures", "missing-key");
		await expect(
			actionCommandValidateLocales({
				source: path.join(fixture, "src/**/*.ts"),
				locales: path.join(fixture, "locales/**/*.json"),
				ignoreFile: path.join(fixture, "locales/.validate-ignore")
			})
		).rejects.toThrow();
		expect(errorBuffer.some(line => line.includes("error.myClass.missingKey"))).toEqual(true);
	});

	test("Fails validation when a locale message property is not passed in source", async () => {
		const fixture = path.join(testDir, "fixtures", "missing-property");
		await expect(
			actionCommandValidateLocales({
				source: path.join(fixture, "src/**/*.ts"),
				locales: path.join(fixture, "locales/**/*.json"),
				ignoreFile: path.join(fixture, "locales/.validate-ignore")
			})
		).rejects.toThrow();
		expect(errorBuffer.some(line => line.includes("count"))).toEqual(true);
	});

	test("Fails validation when a locale entry is defined but never referenced in source files", async () => {
		const fixture = path.join(testDir, "fixtures", "unused-key");
		await expect(
			actionCommandValidateLocales({
				source: path.join(fixture, "src/**/*.ts"),
				locales: path.join(fixture, "locales/**/*.json"),
				ignoreFile: path.join(fixture, "locales/.validate-ignore")
			})
		).rejects.toThrow();
		expect(errorBuffer.some(line => line.includes("error.myClass.unusedKey"))).toEqual(true);
	});

	test("Fails validation when a health check locale key is missing from the locale file", async () => {
		const fixture = path.join(testDir, "fixtures", "health-check-missing-key");
		await expect(
			actionCommandValidateLocales({
				source: path.join(fixture, "src/**/*.ts"),
				locales: path.join(fixture, "locales/**/*.json"),
				ignoreFile: path.join(fixture, "locales/.validate-ignore")
			})
		).rejects.toThrow();
		expect(errorBuffer.some(line => line.includes("health.myServer.reachable"))).toEqual(true);
	});
});
