// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { ICliOutputOptionsConsole } from "./ICliOutputOptionsConsole.js";
import type { ICliOutputOptionsEnv } from "./ICliOutputOptionsEnv.js";
import type { ICliOutputOptionsJson } from "./ICliOutputOptionsJson.js";

/**
 * Options for the CLI Output.
 */
export type CliOutputOptions = ICliOutputOptionsConsole &
	ICliOutputOptionsEnv &
	ICliOutputOptionsJson;
