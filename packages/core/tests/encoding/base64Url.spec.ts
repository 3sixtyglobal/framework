// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import testData from "./base64Url.json" with { type: "json" };
import { Base64Url } from "../../src/encoding/base64Url.js";
import { Converter } from "../../src/utils/converter.js";

/**
 * Round-trip every byte length from 0 to 260 through the given codec.
 * @param codec The codec to exercise.
 */
function expectRoundTripsAllLengths(codec: typeof Base64Url): void {
	for (let len = 0; len <= 260; len++) {
		const input = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
			input[i] = (i + len) % 256;
		}
		expect(codec.decode(codec.encode(input))).toEqual(input);
	}
}

/**
 * Load a fresh Base64Url with the given value installed as the global Buffer.
 * @param bufferOverride The global Buffer to expose while the module is evaluated.
 * @param fn The test body, given the freshly loaded class.
 */
async function withGlobalBuffer(
	bufferOverride: unknown,
	fn: (codec: typeof Base64Url) => void
): Promise<void> {
	const globalWithBuffer = globalThis as { Buffer?: unknown };
	const previousBuffer = globalWithBuffer.Buffer;
	if (bufferOverride === undefined) {
		delete globalWithBuffer.Buffer;
	} else {
		globalWithBuffer.Buffer = bufferOverride;
	}
	vi.resetModules();

	try {
		const { Base64Url: freshBase64Url } = await import("../../src/encoding/base64Url.js");
		fn(freshBase64Url);
	} finally {
		globalWithBuffer.Buffer = previousBuffer;
	}
}

describe("Base64Url", () => {
	test("Can encode bytes to base64", () => {
		expect(
			Base64Url.encode(
				new Uint8Array([
					62, 42, 58, 110, 71, 118, 42, 100, 41, 115, 114, 62, 85, 71, 58, 32, 97, 54, 110, 114, 63,
					49, 105, 95, 92
				])
			)
		).toEqual("Pio6bkd2KmQpc3I-VUc6IGE2bnI_MWlfXA");
	});

	test("Can decode base64 to bytes", () => {
		expect(Base64Url.decode("Pio6bkd2KmQpc3I-VUc6IGE2bnI_MWlfXA")).toEqual(
			new Uint8Array([
				62, 42, 58, 110, 71, 118, 42, 100, 41, 115, 114, 62, 85, 71, 58, 32, 97, 54, 110, 114, 63,
				49, 105, 95, 92
			])
		);
	});

	test("Can encode base64 strings to bytes", () => {
		for (const test of testData) {
			expect(Base64Url.encode(Converter.utf8ToBytes(test.decoded))).toEqual(test.encoded);
		}
	});

	test("Can decode base64 bytes to string", () => {
		for (const test of testData) {
			expect(Converter.bytesToUtf8(Base64Url.decode(test.encoded))).toEqual(test.decoded);
		}
	});

	test("Can round-trip every byte length from 0 to 260", () => {
		expectRoundTripsAllLengths(Base64Url);
	});

	test("Can encode and decode a large buffer without error", () => {
		const input = new Uint8Array(6 * 1024 * 1024);
		const encoded = Base64Url.encode(input);
		const decoded = Base64Url.decode(encoded);
		expect(decoded).toEqual(input);
	});

	test("Uses the pure JavaScript implementation when Buffer is not a global", async () => {
		await withGlobalBuffer(undefined, pureBase64Url => {
			for (const test of testData) {
				expect(pureBase64Url.encode(Converter.utf8ToBytes(test.decoded))).toEqual(test.encoded);
			}
			expectRoundTripsAllLengths(pureBase64Url);
		});
	});

	test("Uses the pure JavaScript implementation when the global Buffer has no base64url encoding", async () => {
		// Mirrors the browser buffer polyfill, which supports base64 but throws on base64url.
		const realBuffer = globalThis.Buffer;
		const rejectBase64Url = (encoding: unknown): void => {
			if (encoding === "base64url") {
				throw new TypeError("Unknown encoding: base64url");
			}
		};
		const polyfill = {
			isEncoding: (encoding: string) => encoding !== "base64url",
			from: (...args: unknown[]) => {
				rejectBase64Url(args[1]);
				const buffer = (realBuffer.from as (...fromArgs: unknown[]) => Buffer)(...args);
				return Object.assign(buffer, {
					toString: (encoding?: BufferEncoding) => {
						rejectBase64Url(encoding);
						return realBuffer.prototype.toString.call(buffer, encoding);
					}
				});
			}
		};

		await withGlobalBuffer(polyfill, polyfilledBase64Url => {
			for (const test of testData) {
				expect(polyfilledBase64Url.encode(Converter.utf8ToBytes(test.decoded))).toEqual(
					test.encoded
				);
			}
			expectRoundTripsAllLengths(polyfilledBase64Url);
		});
	});
});
