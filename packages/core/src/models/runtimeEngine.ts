// Copyright 2026 3Sixty Trade Ltd.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The JavaScript runtime engines that can be detected.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const RuntimeEngine = {
	/**
	 * Node.js.
	 */
	Node: "node",

	/**
	 * Bun.
	 */
	Bun: "bun",

	/**
	 * Deno.
	 */
	Deno: "deno",

	/**
	 * Cloudflare Workers.
	 */
	Workerd: "workerd",

	/**
	 * A browser window.
	 */
	Browser: "browser",

	/**
	 * A web worker.
	 */
	WebWorker: "webWorker",

	/**
	 * A runtime that could not be identified.
	 */
	Unknown: "unknown"
} as const;

/**
 * The JavaScript runtime engines that can be detected.
 */
export type RuntimeEngine = (typeof RuntimeEngine)[keyof typeof RuntimeEngine];
