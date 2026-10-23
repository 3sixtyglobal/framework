// Copyright 2026 3Sixty Trade Ltd.
// SPDX-License-Identifier: Apache-2.0.
import type { BuildOrchestrator, CompilerOptions } from "typescript-native/sync";

/**
 * The internal API method for creating a build orchestrator.
 */
export interface IBuildOrchestratorApi {
	/**
	 * Create a build orchestrator for the projects.
	 * @param rootNames The project config files to build.
	 * @param options The options for the build.
	 * @param options.cwd The working directory for the build.
	 * @param options.compilerOptions The compiler options to override the project options, used by clients which spread the options into the request.
	 * @param options.overrideCompilerOptions The compiler options to override the project options, used by clients which nest the options in the request.
	 * @returns The build orchestrator.
	 */
	createBuildOrchestrator(
		rootNames: string[],
		options: {
			cwd: string;
			compilerOptions: CompilerOptions;
			overrideCompilerOptions: CompilerOptions;
		}
	): BuildOrchestrator;
}
