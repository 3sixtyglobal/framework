// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import testData from "./base64.json" with { type: "json" };
import { Base64 } from "../../src/encoding/base64.js";
import { Converter } from "../../src/utils/converter.js";

// Test vectors
// https://datatracker.ietf.org/doc/html/rfc4648#section-10
describe("Base64", () => {
	test("Can encode bytes to base64", () => {
		expect(Base64.encode(new Uint8Array([1, 2, 3, 4]))).toEqual("AQIDBA==");
	});

	test("Can decode base64 to bytes", () => {
		expect(Base64.decode("AQIDBA==")).toEqual(new Uint8Array([1, 2, 3, 4]));
	});

	test("Can encode base64 strings to bytes", () => {
		for (const test of testData) {
			expect(Base64.encode(Converter.utf8ToBytes(test.decoded))).toEqual(test.encoded);
		}
	});

	test("Can decode base64 bytes to string", () => {
		for (const test of testData) {
			expect(Converter.bytesToUtf8(Base64.decode(test.encoded))).toEqual(test.decoded);
		}
	});

	test("Can encode and decode a large buffer without error", () => {
		const input = new Uint8Array(6 * 1024 * 1024);
		const encoded = Base64.encode(input);
		expect(encoded.length).toEqual(8 * 1024 * 1024);
		const decoded = Base64.decode(encoded);
		expect(decoded).toEqual(input);
	});
});
