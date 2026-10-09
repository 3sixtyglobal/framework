// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { manual } from "@3sixty/nameof-transformer";
import type { Plugin } from "vitest/config";

/**
 * Transforms the code using the nameOf plugin.
 * @param code The code to transform.
 * @param id The id of the file being transformed.
 * @returns The transformed code.
 */
export function nameOfPluginTransform(code: string, id: string): string {
	return manual(code);
}

/**
 * Vitest plugin that applies the nameof transformer to all source files before testing.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const NameOfPlugin: Plugin = {
	name: "name-of",
	enforce: "pre",
	transform: nameOfPluginTransform
};
