// Copyright 2026 3Sixty Trade Ltd.
// SPDX-License-Identifier: Apache-2.0.
import { readFileSync } from "node:fs";
import path from "node:path";
import {
	API,
	type Diagnostic,
	formatDiagnosticsWithColorAndContext
} from "typescript-native/async";
import { type FileSystemCallbacks, serverFS } from "typescript-native/fs";
import { manual } from "./manual.js";
import type { IApiClientInternals } from "./models/IApiClientInternals.js";
import type { IBuildOrchestratorApi } from "./models/IBuildOrchestratorApi.js";

/**
 * Is the file a source file that should have the nameof calls replaced.
 * @param fileName The name of the file.
 * @returns True if the nameof calls should be replaced.
 */
function isSourceFile(fileName: string): boolean {
	return (
		/\.[cm]?tsx?$/.test(fileName) &&
		!/\.d\.[cm]?ts$/.test(fileName) &&
		!fileName.includes("/node_modules/")
	);
}

/**
 * Read a file, replacing the nameof calls if it is a source file.
 * @param fileName The name of the file.
 * @returns The content of the file, undefined if it does not exist, or useOS for other files.
 * @throws Error if the file exists but cannot be read.
 */
function readFile(fileName: string): string | undefined | typeof serverFS.useOS {
	if (!isSourceFile(fileName)) {
		return serverFS.useOS;
	}
	try {
		return manual(readFileSync(fileName, "utf8"));
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return undefined;
		}
		throw error;
	}
}

/**
 * Compile a project with the native TypeScript compiler, replacing the nameof calls
 * in the source files as they are read through a virtual file system. Uses the async
 * API as the sync API relies on Node internal pipe handles that other runtimes lack.
 * @param args The tsc command line arguments.
 * @param cwd The working directory containing the project.
 * @returns The diagnostics output, empty if the compilation succeeded.
 */
export async function tsTransform(args: string[], cwd: string): Promise<string> {
	const fs: FileSystemCallbacks = {
		directoryExists: serverFS.useOS,
		fileExists: serverFS.useOS,
		getAccessibleEntries: serverFS.useOS,
		realpath: serverFS.useOS,
		stat: serverFS.useOS,
		writeFile: serverFS.useOS,
		removeFile: serverFS.useOS,
		readFile
	};
	const api = new API({ cwd, fs });
	const client = (api as unknown as IApiClientInternals).client;
	let closing = false;
	let crashed = false;

	try {
		// The API leaves its requests pending if the compiler process dies, so the
		// compile is raced against the process exiting to report the failure instead.
		await client.connect();
		const exited = new Promise<never>((resolve, reject) => {
			const onExit = (code: number | null, signal: string | null): void => {
				if (!closing) {
					crashed = true;
					reject(
						// This package sits below @3sixty/core, so has no BaseError to use.
						// eslint-disable-next-line no-restricted-syntax
						new Error(
							`The TypeScript compiler exited unexpectedly (code ${code}, signal ${signal})`
						)
					);
				}
			};
			if (client.process?.exitCode !== null && client.process?.exitCode !== undefined) {
				onExit(client.process.exitCode, null);
			} else {
				client.process?.once("exit", onExit);
			}
		});

		return await Promise.race([compile(api, args, cwd), exited]);
	} finally {
		closing = true;
		// After a crash the API's close waits on requests the compiler will never answer,
		// closing the client first disposes the connection, which rejects them.
		if (crashed) {
			await client.close();
		}
		await api.close();
	}
}

/**
 * Compile the project through a connected API.
 * @param api The connected API.
 * @param args The tsc command line arguments.
 * @param cwd The working directory containing the project.
 * @returns The diagnostics output, empty if the compilation succeeded.
 */
async function compile(api: API, args: string[], cwd: string): Promise<string> {
	const commandLine = await api.parseCommandLine(args);
	const diagnostics: Diagnostic[] = [...commandLine.errors];
	if (diagnostics.length === 0) {
		const { project, ...compilerOptions } = commandLine.options;
		// The build orchestrator is internal to the API but is the only route which
		// supports incremental builds, the server expects the options to be nested.
		// Current clients spread the options so only the nested compilerOptions key
		// reaches the server, clients with https://github.com/microsoft/TypeScript/pull/64759
		// only send overrideCompilerOptions. Remove compilerOptions once that is released.
		const orchestrator = await (api as unknown as IBuildOrchestratorApi).createBuildOrchestrator(
			[project ?? path.join(cwd, "tsconfig.json")],
			{
				cwd,
				compilerOptions,
				overrideCompilerOptions: compilerOptions
			}
		);
		try {
			diagnostics.push(...((await orchestrator.build()).diagnostics ?? []));
		} finally {
			await orchestrator.dispose();
		}
	}

	return diagnostics.length > 0 ? formatDiagnosticsWithColorAndContext(diagnostics, api) : "";
}
