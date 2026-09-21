// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { Converter } from "../../src/utils/converter.js";

describe.each([
	{ implementation: "native Buffer", hasBuffer: true },
	{ implementation: "pure JavaScript", hasBuffer: false }
])("Converter ($implementation)", ({ hasBuffer }) => {
	let converter: typeof Converter;
	let previousBuffer: unknown;

	beforeAll(async () => {
		const globalWithBuffer = globalThis as { Buffer?: unknown };
		previousBuffer = globalWithBuffer.Buffer;
		if (!hasBuffer) {
			delete globalWithBuffer.Buffer;
		}
		vi.resetModules();

		converter = (await import("../../src/utils/converter.js")).Converter;
	});

	afterAll(() => {
		(globalThis as { Buffer?: unknown }).Buffer = previousBuffer;
	});

	describe("bytesToUtf8 / utf8ToBytes", () => {
		test("Can round-trip an ASCII string", () => {
			const original = "Hello, world!";
			expect(converter.bytesToUtf8(converter.utf8ToBytes(original))).toEqual(original);
		});

		test("Can encode and decode a 2-byte UTF-8 character", () => {
			// £ = U+00A3 → 0xC2 0xA3
			const bytes = new Uint8Array([0xc2, 0xa3]);
			expect(converter.bytesToUtf8(bytes)).toEqual("£");
			expect(converter.utf8ToBytes("£")).toEqual(bytes);
		});

		test("Can encode and decode a 3-byte UTF-8 character", () => {
			// € = U+20AC → 0xE2 0x82 0xAC
			const bytes = new Uint8Array([0xe2, 0x82, 0xac]);
			expect(converter.bytesToUtf8(bytes)).toEqual("€");
			expect(converter.utf8ToBytes("€")).toEqual(bytes);
		});

		test("Can encode and decode a 4-byte UTF-8 character (surrogate pair)", () => {
			// 😀 = U+1F600 → 0xF0 0x9F 0x98 0x80
			const bytes = new Uint8Array([0xf0, 0x9f, 0x98, 0x80]);
			expect(converter.bytesToUtf8(bytes)).toEqual("😀");
			expect(converter.utf8ToBytes("😀")).toEqual(bytes);
		});

		test("Can handle an empty array", () => {
			expect(converter.bytesToUtf8(new Uint8Array())).toEqual("");
		});

		test("Can handle an empty string", () => {
			expect(converter.utf8ToBytes("")).toEqual(new Uint8Array());
		});

		test("Can decode a slice using startIndex and length", () => {
			// "abc" prefixed and suffixed with extra bytes
			const bytes = converter.utf8ToBytes("xabcx");
			expect(converter.bytesToUtf8(bytes, 1, 3)).toEqual("abc");
		});

		test("Can decode a slice of a view that does not start at the beginning of its buffer", () => {
			const backing = converter.utf8ToBytes("xabcx");
			const view = backing.subarray(1, 4);
			expect(converter.bytesToUtf8(view)).toEqual("abc");
		});

		test("Can round-trip a string mixing every UTF-8 sequence length", () => {
			const original = "a£€😀 mixed ¬ᴥ¬ 漢字 🎉";
			expect(converter.bytesToUtf8(converter.utf8ToBytes(original))).toEqual(original);
		});
	});

	describe("bytesToHex / hexToBytes", () => {
		test("Can encode bytes to a lowercase hex string", () => {
			expect(converter.bytesToHex(new Uint8Array([0xde, 0xad, 0xbe, 0xef]))).toEqual("deadbeef");
		});

		test("Can encode bytes to hex with 0x prefix", () => {
			expect(converter.bytesToHex(new Uint8Array([0xde, 0xad, 0xbe, 0xef]), true)).toEqual(
				"0xdeadbeef"
			);
		});

		test("Can encode bytes to hex in reverse", () => {
			expect(
				converter.bytesToHex(new Uint8Array([0x01, 0x02, 0x03]), false, undefined, undefined, true)
			).toEqual("030201");
		});

		test("Can encode a slice of bytes using startIndex and length", () => {
			expect(converter.bytesToHex(new Uint8Array([0xaa, 0xbb, 0xcc]), false, 1, 1)).toEqual("bb");
		});

		test("Can decode a hex string to bytes", () => {
			expect(converter.hexToBytes("deadbeef")).toEqual(new Uint8Array([0xde, 0xad, 0xbe, 0xef]));
		});

		test("Can decode a prefixed hex string to bytes", () => {
			expect(converter.hexToBytes("0xdeadbeef")).toEqual(new Uint8Array([0xde, 0xad, 0xbe, 0xef]));
		});

		test("Can decode a hex string to bytes in reverse", () => {
			expect(converter.hexToBytes("010203", true)).toEqual(new Uint8Array([0x03, 0x02, 0x01]));
		});

		test("Can round-trip bytes through hex", () => {
			const original = new Uint8Array([0x00, 0x01, 0x7f, 0x80, 0xff]);
			expect(converter.hexToBytes(converter.bytesToHex(original))).toEqual(original);
		});

		test("Can encode all-zero bytes", () => {
			expect(converter.bytesToHex(new Uint8Array([0x00, 0x00]))).toEqual("0000");
		});

		test("Can decode a hex string containing non hex characters", () => {
			expect(converter.hexToBytes("zz")).toEqual(new Uint8Array([0x00]));
		});

		test("Can decode a hex string of odd length by ignoring the trailing character", () => {
			expect(converter.hexToBytes("abc")).toEqual(new Uint8Array([0xab]));
		});

		test("Does not mutate the source bytes when encoding in reverse", () => {
			const original = new Uint8Array([0x01, 0x02, 0x03]);
			converter.bytesToHex(original, false, undefined, undefined, true);
			expect(original).toEqual(new Uint8Array([0x01, 0x02, 0x03]));
		});

		test("Can encode a slice of a view that does not start at the beginning of its buffer", () => {
			const backing = new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd]);
			const view = backing.subarray(1, 3);
			expect(converter.bytesToHex(view)).toEqual("bbcc");
		});

		test("Can round-trip every byte value through hex", () => {
			const original = new Uint8Array(256);
			for (let i = 0; i < 256; i++) {
				original[i] = i;
			}
			expect(converter.hexToBytes(converter.bytesToHex(original))).toEqual(original);
		});
	});

	describe("utf8ToHex / hexToUtf8", () => {
		test("Can convert a UTF-8 string to hex", () => {
			// "A" = 0x41
			expect(converter.utf8ToHex("A")).toEqual("41");
		});

		test("Can convert a UTF-8 string to hex with prefix", () => {
			expect(converter.utf8ToHex("A", true)).toEqual("0x41");
		});

		test("Can convert hex back to a UTF-8 string", () => {
			expect(converter.hexToUtf8("48656c6c6f")).toEqual("Hello");
		});

		test("Can round-trip a UTF-8 string through hex", () => {
			const original = "twin framework";
			expect(converter.hexToUtf8(converter.utf8ToHex(original))).toEqual(original);
		});
	});

	describe("bytesToBinary / binaryToBytes", () => {
		test("Can convert bytes to a binary string", () => {
			expect(converter.bytesToBinary(new Uint8Array([0xaa]))).toEqual("10101010");
		});

		test("Can convert multiple bytes to a binary string", () => {
			expect(converter.bytesToBinary(new Uint8Array([0xff, 0x00]))).toEqual("1111111100000000");
		});

		test("Can convert a binary string to bytes", () => {
			expect(converter.binaryToBytes("10101010")).toEqual(new Uint8Array([0xaa]));
		});

		test("Can round-trip bytes through binary", () => {
			const original = new Uint8Array([0x01, 0xfe, 0x80, 0x7f]);
			expect(converter.binaryToBytes(converter.bytesToBinary(original))).toEqual(original);
		});
	});

	describe("bytesToBase64 / base64ToBytes", () => {
		test("Can round-trip bytes through Base64", () => {
			const original = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
			expect(converter.base64ToBytes(converter.bytesToBase64(original))).toEqual(original);
		});

		test("Can encode known bytes to Base64", () => {
			// [0x00, 0x01, 0x02] → "AAEC"
			expect(converter.bytesToBase64(new Uint8Array([0x00, 0x01, 0x02]))).toEqual("AAEC");
		});

		test("Can decode a Base64 string to bytes", () => {
			expect(converter.base64ToBytes("AAEC")).toEqual(new Uint8Array([0x00, 0x01, 0x02]));
		});
	});

	describe("bytesToBase64Url / base64UrlToBytes", () => {
		test("Can round-trip bytes through Base64Url", () => {
			const original = new Uint8Array([0xfb, 0xff, 0xfe]);
			expect(converter.base64UrlToBytes(converter.bytesToBase64Url(original))).toEqual(original);
		});

		test("Can encode bytes that would produce + and / in Base64 to safe URL characters", () => {
			// 0xFB 0xFF produces "+/" in standard Base64, "-_" in Base64Url
			const encoded = converter.bytesToBase64Url(new Uint8Array([0xfb, 0xff]));
			expect(encoded).not.toContain("+");
			expect(encoded).not.toContain("/");
		});
	});

	describe("bytesToBase58 / base58ToBytes", () => {
		test("Can round-trip bytes through Base58", () => {
			const original = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
			expect(converter.base58ToBytes(converter.bytesToBase58(original))).toEqual(original);
		});

		test("Can encode known bytes to Base58", () => {
			// Single zero byte encodes to "1" in Base58
			expect(converter.bytesToBase58(new Uint8Array([0x00]))).toEqual("1");
		});
	});
});
