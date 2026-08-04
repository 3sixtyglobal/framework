// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type * as ts from "typescript";
import { transformerFactory } from "./transformer.js";

/**
 * Exports the factory.
 * @returns The factory.
 */
export function factory(): ts.TransformerFactory<ts.Node> {
	return transformerFactory;
}

/**
 * Exports the factory version.
 * @returns The factory.
 */
export const version = "0.9.2-next.6"; // x-release-please-version

/**
 * Exports the factory name.
 * @returns The factory.
 */
export const name = "@twin.org/nameof-transformer";

export * from "./manual.js";
export * from "./svelte.js";

export default factory;
