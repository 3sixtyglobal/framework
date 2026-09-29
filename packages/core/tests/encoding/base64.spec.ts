// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import testData from "./base64.json" with { type: "json" };
import type { Base64 } from "../../src/encoding/base64.js";
import { Converter } from "../../src/utils/converter.js";

/**
 * Round-trip every byte length from 0 to 260 through the given codec.
 * @param codec The codec to exercise.
 */
function expectRoundTripsAllLengths(codec: typeof Base64): void {
	for (let len = 0; len <= 260; len++) {
		const input = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
			input[i] = (i + len) % 256;
		}
		expect(codec.decode(codec.encode(input))).toEqual(input);
	}
}

// Test vectors
// https://datatracker.ietf.org/doc/html/rfc4648#section-10
describe.each([
	{ implementation: "native Buffer", hasBuffer: true },
	{ implementation: "pure JavaScript", hasBuffer: false }
])("Base64 ($implementation)", ({ hasBuffer }) => {
	let base64: typeof Base64;
	let previousBuffer: unknown;

	beforeAll(async () => {
		const globalWithBuffer = globalThis as { Buffer?: unknown };
		previousBuffer = globalWithBuffer.Buffer;
		if (!hasBuffer) {
			delete globalWithBuffer.Buffer;
		}
		vi.resetModules();

		base64 = (await import("../../src/encoding/base64.js")).Base64;
	});

	afterAll(() => {
		(globalThis as { Buffer?: unknown }).Buffer = previousBuffer;
	});

	test("Can encode bytes to base64", () => {
		expect(base64.encode(new Uint8Array([1, 2, 3, 4]))).toEqual("AQIDBA==");
	});

	test("Can decode base64 to bytes", () => {
		expect(base64.decode("AQIDBA==")).toEqual(new Uint8Array([1, 2, 3, 4]));
	});

	test("Can encode base64 strings to bytes", () => {
		for (const test of testData) {
			expect(base64.encode(Converter.utf8ToBytes(test.decoded))).toEqual(test.encoded);
		}
	});

	test("Can decode base64 bytes to string", () => {
		for (const test of testData) {
			expect(Converter.bytesToUtf8(base64.decode(test.encoded))).toEqual(test.decoded);
		}
	});

	test("Can round-trip every byte length from 0 to 260", () => {
		expectRoundTripsAllLengths(base64);
	});

	test("Throws when the base64 string length is not a multiple of 4", () => {
		expect(() => base64.decode("abc")).toThrow(
			expect.objectContaining({ name: "GeneralError", message: "base64.length4Multiple" })
		);
	});

	test("Can encode and decode a large buffer without error", () => {
		const input = new Uint8Array(6 * 1024 * 1024);
		const encoded = base64.encode(input);
		expect(encoded.length).toEqual(8 * 1024 * 1024);
		const decoded = base64.decode(encoded);
		// A deep equality assertion on 6 MiB of elements costs seconds, whereas scanning
		// for the first mismatch takes milliseconds and reports where the data diverged.
		expect(decoded.length).toEqual(input.length);
		expect(decoded.findIndex((value, index) => value !== input[index])).toEqual(-1);
	});
});
