// Copyright 2026 3Sixty Trade Ltd.
// SPDX-License-Identifier: Apache-2.0.
import { nameof } from "@3sixty/nameof";
import { Is } from "./is.js";
import { NativeModules } from "./nativeModules.js";
import { RuntimeEngine } from "../models/runtimeEngine.js";
import { RuntimeOs } from "../models/runtimeOs.js";

/**
 * Detect the JavaScript runtime the code is executing in.
 */
export class Runtime {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<Runtime>();

	/**
	 * Get the runtime engine. Bun, Deno and Cloudflare Workers are checked before Node
	 * as they all provide a Node compatible process global.
	 * @returns The runtime engine.
	 */
	public static engine(): RuntimeEngine {
		if (Is.stringValue(Runtime.processVersions()?.bun)) {
			return RuntimeEngine.Bun;
		}
		if (Is.object(NativeModules.getType("Deno"))) {
			return RuntimeEngine.Deno;
		}
		if (Runtime.userAgent() === "Cloudflare-Workers") {
			return RuntimeEngine.Workerd;
		}
		if (Is.stringValue(Runtime.processVersions()?.node)) {
			return RuntimeEngine.Node;
		}
		if (
			Is.object(NativeModules.getType("window")) &&
			Is.object(NativeModules.getType("document"))
		) {
			return RuntimeEngine.Browser;
		}
		if (Is.function(NativeModules.getType("importScripts"))) {
			return RuntimeEngine.WebWorker;
		}
		return RuntimeEngine.Unknown;
	}

	/**
	 * Get the version of the runtime engine.
	 * @returns The version, the user agent for browsers and workers, or an empty string if unknown.
	 */
	public static version(): string {
		switch (Runtime.engine()) {
			case RuntimeEngine.Bun:
				return Runtime.processVersions()?.bun ?? "";
			case RuntimeEngine.Deno:
				return NativeModules.getType<{ version?: { deno?: string } }>("Deno")?.version?.deno ?? "";
			case RuntimeEngine.Node:
				return Runtime.processVersions()?.node ?? "";
			case RuntimeEngine.Workerd:
			case RuntimeEngine.Browser:
			case RuntimeEngine.WebWorker:
				return Runtime.userAgent() ?? "";
			default:
				return "";
		}
	}

	/**
	 * Get the operating system.
	 * @returns The operating system.
	 */
	public static os(): RuntimeOs {
		const name =
			NativeModules.getType<{ build?: { os?: string } }>("Deno")?.build?.os ??
			NativeModules.getType<{ platform?: string }>("process")?.platform ??
			NativeModules.getType<{ userAgentData?: { platform?: string }; platform?: string }>(
				"navigator"
			)?.userAgentData?.platform ??
			NativeModules.getType<{ platform?: string }>("navigator")?.platform ??
			Runtime.userAgent() ??
			"";

		if (/^win|windows/i.test(name)) {
			return RuntimeOs.Windows;
		}
		if (/^darwin|mac/i.test(name)) {
			return RuntimeOs.Mac;
		}
		if (/linux/i.test(name)) {
			return RuntimeOs.Linux;
		}
		return RuntimeOs.Unknown;
	}

	/**
	 * Get the process versions if there is a process global.
	 * @returns The versions, or undefined if there is no process global.
	 * @internal
	 */
	private static processVersions(): { [name: string]: string | undefined } | undefined {
		return NativeModules.getType<{ versions?: { [name: string]: string | undefined } }>("process")
			?.versions;
	}

	/**
	 * Get the navigator user agent if there is a navigator global.
	 * @returns The user agent, or undefined if there is no navigator global.
	 * @internal
	 */
	private static userAgent(): string | undefined {
		return NativeModules.getType<{ userAgent?: string }>("navigator")?.userAgent;
	}
}
