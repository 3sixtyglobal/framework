// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
// Development entry point which runs the CLI straight from the TypeScript source, so
// that the repo scripts which use this tool do not require the package to have been
// built first. The published entry point is bin/index.js which runs the built output.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CLIUtils } from "@3sixty/cli-core";
import { CLI } from "./cli.js";

const devDirectory = path.dirname(fileURLToPath(import.meta.url));

// The published entry resolves its locales from the merged dist copy, which does not
// exist until the package is built, so take them from the dependency packages and then
// this package instead. The order matches the precedence the merge-locales tool uses.
// The dependency packages are resolved from this file rather than the working directory,
// so the tool still finds them when it is run from another package in the workspace.
const dependencyLocales = await Promise.all(
	["@3sixty/cli-core", "@3sixty/core"].map(async packageName => {
		const packageRoot = await CLIUtils.findPackageRoot(packageName, devDirectory);
		return packageRoot === undefined ? packageName : path.join(packageRoot, "locales");
	})
);

const localesDirectory = [...dependencyLocales, path.join(devDirectory, "../locales")];

const cli = new CLI();
process.exitCode = await cli.run(process.argv, localesDirectory);
