// Copyright 2026 3Sixty Trade Ltd.
// SPDX-License-Identifier: Apache-2.0.
import { RuntimeEngine } from "../../src/models/runtimeEngine.js";
import { RuntimeOs } from "../../src/models/runtimeOs.js";
import { Runtime } from "../../src/utils/runtime.js";

/**
 * Remove the server runtime globals so the browser and worker checks are reached.
 */
function stubNoServerRuntime(): void {
	vi.stubGlobal("Deno", undefined);
	vi.stubGlobal("process", undefined);
}

describe("Runtime", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test("can detect the current engine", () => {
		expect(Runtime.engine()).toEqual(
			process.versions.bun === undefined ? RuntimeEngine.Node : RuntimeEngine.Bun
		);
	});

	test("can get the current version", () => {
		expect(Runtime.version()).toEqual(process.versions.bun ?? process.versions.node);
	});

	test("can detect the current os", () => {
		const platforms: { [platform: string]: RuntimeOs } = {
			win32: RuntimeOs.Windows,
			darwin: RuntimeOs.Mac,
			linux: RuntimeOs.Linux
		};
		expect(Runtime.os()).toEqual(platforms[process.platform] ?? RuntimeOs.Unknown);
	});

	test("can detect Bun", () => {
		vi.stubGlobal("process", { versions: { node: "24.0.0", bun: "1.3.0" }, platform: "linux" });
		expect(Runtime.engine()).toEqual(RuntimeEngine.Bun);
		expect(Runtime.version()).toEqual("1.3.0");
		expect(Runtime.os()).toEqual(RuntimeOs.Linux);
	});

	test("can detect Deno before the Node compatible process global", () => {
		vi.stubGlobal("Deno", { version: { deno: "2.1.0" }, build: { os: "darwin" } });
		vi.stubGlobal("process", { versions: { node: "22.0.0" }, platform: "linux" });
		expect(Runtime.engine()).toEqual(RuntimeEngine.Deno);
		expect(Runtime.version()).toEqual("2.1.0");
		expect(Runtime.os()).toEqual(RuntimeOs.Mac);
	});

	test("can detect Cloudflare Workers", () => {
		stubNoServerRuntime();
		vi.stubGlobal("navigator", { userAgent: "Cloudflare-Workers" });
		expect(Runtime.engine()).toEqual(RuntimeEngine.Workerd);
		expect(Runtime.version()).toEqual("Cloudflare-Workers");
	});

	test("can detect Node", () => {
		vi.stubGlobal("Deno", undefined);
		vi.stubGlobal("process", { versions: { node: "24.1.0" }, platform: "win32" });
		expect(Runtime.engine()).toEqual(RuntimeEngine.Node);
		expect(Runtime.version()).toEqual("24.1.0");
		expect(Runtime.os()).toEqual(RuntimeOs.Windows);
	});

	test("can detect a browser", () => {
		stubNoServerRuntime();
		vi.stubGlobal("window", {});
		vi.stubGlobal("document", {});
		vi.stubGlobal("navigator", {
			userAgent: "Mozilla/5.0 (X11; Linux x86_64)",
			userAgentData: { platform: "Windows" }
		});
		expect(Runtime.engine()).toEqual(RuntimeEngine.Browser);
		expect(Runtime.version()).toEqual("Mozilla/5.0 (X11; Linux x86_64)");
		expect(Runtime.os()).toEqual(RuntimeOs.Windows);
	});

	test("can detect a web worker", () => {
		stubNoServerRuntime();
		vi.stubGlobal("importScripts", () => {});
		vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0", platform: "MacIntel" });
		expect(Runtime.engine()).toEqual(RuntimeEngine.WebWorker);
		expect(Runtime.os()).toEqual(RuntimeOs.Mac);
	});

	test("can detect the os from the user agent", () => {
		stubNoServerRuntime();
		vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (X11; Linux x86_64)" });
		expect(Runtime.os()).toEqual(RuntimeOs.Linux);
	});

	test("returns unknown when nothing can be detected", () => {
		stubNoServerRuntime();
		vi.stubGlobal("navigator", undefined);
		expect(Runtime.engine()).toEqual(RuntimeEngine.Unknown);
		expect(Runtime.version()).toEqual("");
		expect(Runtime.os()).toEqual(RuntimeOs.Unknown);
	});
});
