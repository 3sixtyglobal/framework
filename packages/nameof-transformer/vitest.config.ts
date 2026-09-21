// Copyright 2025 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { defineConfig } from "vitest/config";

// This configuration is deliberately left without the NameOfPlugin as we are testing the transformer itself.

export default defineConfig({
	plugins: [],
	test: {
		include: ["./tests/**/*.spec.ts"],
		globals: true,
		testTimeout: 300000,
		hookTimeout: 300000,
		bail: 1,
		reporters: ["verbose"],
		disableConsoleIntercept: true,
		coverage: {
			reporter: ["text", "lcov"],
			include: ["src/**/*.ts"],
			exclude: ["**/index.ts", "**/models/**/*.ts"]
		},
		fileParallelism: true,
		maxWorkers: 4,
		fsModuleCache: true
	}
});
