// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import testData from "./base64Url.json" with { type: "json" };
import type { Base64Url } from "../../src/encoding/base64Url.js";
import { Converter } from "../../src/utils/converter.js";
import { Is } from "../../src/utils/is.js";

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
 * Build a stand-in for the browser buffer polyfill, which supports base64 but throws on base64url.
 * @returns The polyfill to install as the global Buffer.
 */
function createBase64UrlLessBuffer(): unknown {
	const realBuffer = globalThis.Buffer;
	const rejectBase64Url = (encoding: unknown): void => {
		if (encoding === "base64url") {
			throw new TypeError("Unknown encoding: base64url");
		}
	};

	return {
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
}

describe.each([
	{ implementation: "native Buffer", createBuffer: (): unknown => globalThis.Buffer },
	{ implementation: "base64url-less Buffer", createBuffer: createBase64UrlLessBuffer },
	{ implementation: "pure JavaScript", createBuffer: (): unknown => undefined }
])("Base64Url ($implementation)", ({ createBuffer }) => {
	let base64Url: typeof Base64Url;
	let previousBuffer: unknown;

	beforeAll(async () => {
		const globalWithBuffer = globalThis as { Buffer?: unknown };
		previousBuffer = globalWithBuffer.Buffer;
		const override = createBuffer();
		if (Is.undefined(override)) {
			delete globalWithBuffer.Buffer;
		} else {
			globalWithBuffer.Buffer = override;
		}
		vi.resetModules();

		base64Url = (await import("../../src/encoding/base64Url.js")).Base64Url;
	});

	afterAll(() => {
		(globalThis as { Buffer?: unknown }).Buffer = previousBuffer;
	});

	test("Can encode bytes to base64", () => {
		expect(
			base64Url.encode(
				new Uint8Array([
					62, 42, 58, 110, 71, 118, 42, 100, 41, 115, 114, 62, 85, 71, 58, 32, 97, 54, 110, 114, 63,
					49, 105, 95, 92
				])
			)
		).toEqual("Pio6bkd2KmQpc3I-VUc6IGE2bnI_MWlfXA");
	});

	test("Can decode base64 to bytes", () => {
		expect(base64Url.decode("Pio6bkd2KmQpc3I-VUc6IGE2bnI_MWlfXA")).toEqual(
			new Uint8Array([
				62, 42, 58, 110, 71, 118, 42, 100, 41, 115, 114, 62, 85, 71, 58, 32, 97, 54, 110, 114, 63,
				49, 105, 95, 92
			])
		);
	});

	test("Can encode base64 strings to bytes", () => {
		for (const test of testData) {
			expect(base64Url.encode(Converter.utf8ToBytes(test.decoded))).toEqual(test.encoded);
		}
	});

	test("Can decode base64 bytes to string", () => {
		for (const test of testData) {
			expect(Converter.bytesToUtf8(base64Url.decode(test.encoded))).toEqual(test.decoded);
		}
	});

	test("Can round-trip every byte length from 0 to 260", () => {
		expectRoundTripsAllLengths(base64Url);
	});

	test("Can encode and decode a large buffer without error", () => {
		const input = new Uint8Array(6 * 1024 * 1024);
		const encoded = base64Url.encode(input);
		const decoded = base64Url.decode(encoded);
		// A deep equality assertion on 6 MiB of elements costs seconds, whereas scanning
		// for the first mismatch takes milliseconds and reports where the data diverged.
		expect(decoded.length).toEqual(input.length);
		expect(decoded.findIndex((value, index) => value !== input[index])).toEqual(-1);
	});
});
