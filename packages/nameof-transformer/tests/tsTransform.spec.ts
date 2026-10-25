// Copyright 2026 3Sixty Trade Ltd.
// SPDX-License-Identifier: Apache-2.0.
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { tsTransform } from "../src/tsTransform.js";

let projectDir: string;

// The native compiler's sync API reads Node internal pipe handles on POSIX, which Bun does not provide
const UNSUPPORTED_RUNTIME = process.versions.bun !== undefined && process.platform !== "win32";

/**
 * Write a project with the given source file.
 * @param source The content of the source file.
 */
function writeProject(source: string): void {
	mkdirSync(path.join(projectDir, "src"), { recursive: true });
	writeFileSync(
		path.join(projectDir, "tsconfig.json"),
		JSON.stringify({
			compilerOptions: {
				module: "nodenext",
				target: "ES2022",
				rootDir: "./src",
				outDir: "dist",
				strict: true,
				types: []
			},
			include: ["src/**/*.ts"]
		})
	);
	writeFileSync(path.join(projectDir, "src", "index.ts"), source);
}

describe.skipIf(UNSUPPORTED_RUNTIME)("tsTransform", () => {
	beforeEach(() => {
		projectDir = mkdtempSync(path.join(tmpdir(), "tstransform-"));
	});

	afterEach(() => {
		rmSync(projectDir, { recursive: true, force: true });
	});

	test("can compile a project replacing the nameof calls", () => {
		writeProject(
			"interface IMyObject { prop: number }\n" +
				"export const typeName: string = nameof<IMyObject>();\n" +
				"export const camelName: string = nameofCamelCase<IMyObject>();\n"
		);

		const output = tsTransform([], projectDir);

		expect(output).toEqual("");
		const js = readFileSync(path.join(projectDir, "dist", "index.js"), "utf8");
		expect(js).toContain('typeName = "IMyObject";');
		expect(js).toContain('camelName = "myObject";');
	});

	test("can type check a project without emitting", () => {
		writeProject(
			"export const typeName: string = nameof<IMyObject>();\ninterface IMyObject { prop: number }\n"
		);

		const output = tsTransform(["--noEmit"], projectDir);

		expect(output).toEqual("");
		expect(() => readFileSync(path.join(projectDir, "dist", "index.js"))).toThrow();
	});

	test("can compile a project incrementally", () => {
		writeProject("export const value = 1;\n");

		const output = tsTransform(
			["--incremental", "--tsBuildInfoFile", ".cache/tsconfig.tsbuildinfo"],
			projectDir
		);

		expect(output).toEqual("");
		expect(existsSync(path.join(projectDir, ".cache", "tsconfig.tsbuildinfo"))).toEqual(true);
	});

	test("can return the diagnostics for a project with errors", () => {
		writeProject('export const value: number = "text";\n');

		const output = tsTransform([], projectDir);

		expect(output).toContain("TS2322");
	});

	test("can return the diagnostics for invalid command line arguments", () => {
		writeProject("export const value = 1;\n");

		const output = tsTransform(["--notAnOption"], projectDir);

		expect(output).toContain("TS5023");
	});
});
