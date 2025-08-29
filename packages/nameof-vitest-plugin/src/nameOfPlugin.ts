// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { manual } from "@twin.org/nameof-transformer";
import type { Plugin } from "vitest/config";

export const nameOfPluginTransform = (code: string, id: string): string => manual(code);

// eslint-disable-next-line @typescript-eslint/naming-convention
export const NameOfPlugin: Plugin = {
	name: "name-of",
	enforce: "pre",
	transform: nameOfPluginTransform
};
