// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { Compression } from "../../src/utils/compression.js";
import { Converter } from "../../src/utils/converter.js";
import { NativeModules } from "../../src/utils/nativeModules.js";

/**
 * Drop node:zlib from the NativeModules registry so compression falls back to the web streams.
 */
function unregisterNodeZlib(): void {
	delete NativeModules.getRegistry()["node:zlib"];
}

describe.each([
	{ implementation: "node:zlib", useNodeZlib: true },
	{ implementation: "web streams", useNodeZlib: false }
])("Compression ($implementation)", ({ useNodeZlib }) => {
	let compression: typeof Compression;

	beforeAll(async () => {
		unregisterNodeZlib();
		if (useNodeZlib) {
			expect(await NativeModules.init(["node:zlib"])).toEqual({});
			expect(NativeModules.getModule("node:zlib")).toBeDefined();
		} else {
			expect(NativeModules.getModule("node:zlib")).toBeUndefined();
		}

		// A fresh class each time, as the resolved module is cached in a static after
		// the first call and would otherwise leak from one implementation to the next.
		vi.resetModules();
		compression = (await import("../../src/utils/compression.js")).Compression;
	});

	afterAll(() => {
		unregisterNodeZlib();
	});

	test("can compress and decompress simple data using gzip", async () => {
		const bytes = Converter.utf8ToBytes("The quick brown fox jumps over the lazy dog");
		const compressed = await compression.compress(bytes, "gzip");

		const decompressed = await compression.decompress(compressed, "gzip");

		expect(Converter.bytesToUtf8(decompressed)).toEqual(
			"The quick brown fox jumps over the lazy dog"
		);
	});

	test("can compress and decompress simple data using deflate", async () => {
		const bytes = Converter.utf8ToBytes("The quick brown fox jumps over the lazy dog");
		const compressed = await compression.compress(bytes, "deflate");

		const decompressed = await compression.decompress(compressed, "deflate");

		expect(Converter.bytesToUtf8(decompressed)).toEqual(
			"The quick brown fox jumps over the lazy dog"
		);
	});

	test("can compress and decompress large data using gzip", async () => {
		const bytes = new Uint8Array(16384);
		const compressed = await compression.compress(bytes, "gzip");

		const decompressed = await compression.decompress(compressed, "gzip");

		expect(decompressed).toEqual(new Uint8Array(16384));
	});

	test("can compress and decompress large data using deflate", async () => {
		const bytes = new Uint8Array(16384);
		const compressed = await compression.compress(bytes, "deflate");

		const decompressed = await compression.decompress(compressed, "deflate");

		expect(decompressed).toEqual(new Uint8Array(16384));
	});

	test("can compress and decompress an empty array", async () => {
		for (const type of ["gzip", "deflate"] as const) {
			const compressed = await compression.compress(new Uint8Array(), type);
			expect(await compression.decompress(compressed, type)).toEqual(new Uint8Array());
		}
	});

	test("normalises the gzip OS header byte to 3 so output is deterministic", async () => {
		const bytes = Converter.utf8ToBytes("The quick brown fox jumps over the lazy dog");
		const compressed = await compression.compress(bytes, "gzip");

		expect(compressed.length).toBeGreaterThanOrEqual(10);
		expect(compressed[9]).toEqual(3);
	});

	test("produces bytes the other implementation can decompress", async () => {
		const bytes = Converter.utf8ToBytes("cross implementation payload ".repeat(50));
		const gzip = await compression.compress(bytes, "gzip");
		const deflate = await compression.compress(bytes, "deflate");

		// Flip to the opposite implementation, so this really does cross the two.
		unregisterNodeZlib();
		if (!useNodeZlib) {
			expect(await NativeModules.init(["node:zlib"])).toEqual({});
		}
		vi.resetModules();
		const other = (await import("../../src/utils/compression.js")).Compression;

		try {
			expect(await other.decompress(gzip, "gzip")).toEqual(bytes);
			expect(await other.decompress(deflate, "deflate")).toEqual(bytes);
		} finally {
			// Put the registry back, as the remaining tests in this block rely on it.
			unregisterNodeZlib();
			if (useNodeZlib) {
				await NativeModules.init(["node:zlib"]);
			}
		}
	});
});
