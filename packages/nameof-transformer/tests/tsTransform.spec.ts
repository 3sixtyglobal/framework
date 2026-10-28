// Copyright 2026 3Sixty Trade Ltd.
// SPDX-License-Identifier: Apache-2.0.
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { tsTransform } from "../src/tsTransform.js";

const mocks = vi.hoisted(() => ({ compilerPath: undefined as string | undefined }));

// Lets a test replace the compiler executable, to simulate the compiler process failing.
vi.mock("typescript-native/async", async importOriginal => {
	const original = (await importOriginal()) as {
		API: new (options: { tsserverPath?: string }) => object;
	};
	class API extends original.API {
		constructor(options: { tsserverPath?: string }) {
			super({ ...options, tsserverPath: mocks.compilerPath ?? options.tsserverPath });
		}
	}
	return { ...original, API };
});

let projectDir: string;

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

describe("tsTransform", () => {
	beforeEach(() => {
		projectDir = mkdtempSync(path.join(tmpdir(), "tstransform-"));
	});

	afterEach(() => {
		rmSync(projectDir, { recursive: true, force: true });
	});

	test("can compile a project replacing the nameof calls", async () => {
		writeProject(
			"interface IMyObject { prop: number }\n" +
				"export const typeName: string = nameof<IMyObject>();\n" +
				"export const camelName: string = nameofCamelCase<IMyObject>();\n"
		);

		const output = await tsTransform([], projectDir);

		expect(output).toEqual("");
		const js = readFileSync(path.join(projectDir, "dist", "index.js"), "utf8");
		expect(js).toContain('typeName = "IMyObject";');
		expect(js).toContain('camelName = "myObject";');
	});

	test("can type check a project without emitting", async () => {
		writeProject(
			"export const typeName: string = nameof<IMyObject>();\ninterface IMyObject { prop: number }\n"
		);

		const output = await tsTransform(["--noEmit"], projectDir);

		expect(output).toEqual("");
		expect(() => readFileSync(path.join(projectDir, "dist", "index.js"))).toThrow();
	});

	test("can compile a project incrementally", async () => {
		writeProject("export const value = 1;\n");

		const output = await tsTransform(
			["--incremental", "--tsBuildInfoFile", ".cache/tsconfig.tsbuildinfo"],
			projectDir
		);

		expect(output).toEqual("");
		expect(existsSync(path.join(projectDir, ".cache", "tsconfig.tsbuildinfo"))).toEqual(true);
	});

	test("can return the diagnostics for a project with errors", async () => {
		writeProject('export const value: number = "text";\n');

		const output = await tsTransform([], projectDir);

		expect(output).toContain("TS2322");
	});

	test("rejects when the compiler process exits unexpectedly", async () => {
		writeProject("export const value = 1;\n");
		// Node rejects the compiler's --api argument and exits straight away.
		mocks.compilerPath = "node";

		try {
			await expect(tsTransform([], projectDir)).rejects.toThrow(
				"The TypeScript compiler exited unexpectedly"
			);
		} finally {
			mocks.compilerPath = undefined;
		}
	});

	test("can return the diagnostics for invalid command line arguments", async () => {
		writeProject("export const value = 1;\n");

		const output = await tsTransform(["--notAnOption"], projectDir);

		expect(output).toContain("TS5023");
	});
});
