// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter } from "../../src/utils/converter.js";

describe("Converter", () => {
	describe("bytesToUtf8 / utf8ToBytes", () => {
		test("Can round-trip an ASCII string", () => {
			const original = "Hello, world!";
			expect(Converter.bytesToUtf8(Converter.utf8ToBytes(original))).toEqual(original);
		});

		test("Can encode and decode a 2-byte UTF-8 character", () => {
			// £ = U+00A3 → 0xC2 0xA3
			const bytes = new Uint8Array([0xc2, 0xa3]);
			expect(Converter.bytesToUtf8(bytes)).toEqual("£");
			expect(Converter.utf8ToBytes("£")).toEqual(bytes);
		});

		test("Can encode and decode a 3-byte UTF-8 character", () => {
			// € = U+20AC → 0xE2 0x82 0xAC
			const bytes = new Uint8Array([0xe2, 0x82, 0xac]);
			expect(Converter.bytesToUtf8(bytes)).toEqual("€");
			expect(Converter.utf8ToBytes("€")).toEqual(bytes);
		});

		test("Can encode and decode a 4-byte UTF-8 character (surrogate pair)", () => {
			// 😀 = U+1F600 → 0xF0 0x9F 0x98 0x80
			const bytes = new Uint8Array([0xf0, 0x9f, 0x98, 0x80]);
			expect(Converter.bytesToUtf8(bytes)).toEqual("😀");
			expect(Converter.utf8ToBytes("😀")).toEqual(bytes);
		});

		test("Can handle an empty array", () => {
			expect(Converter.bytesToUtf8(new Uint8Array())).toEqual("");
		});

		test("Can handle an empty string", () => {
			expect(Converter.utf8ToBytes("")).toEqual(new Uint8Array());
		});

		test("Can decode a slice using startIndex and length", () => {
			// "abc" prefixed and suffixed with extra bytes
			const bytes = Converter.utf8ToBytes("xabcx");
			expect(Converter.bytesToUtf8(bytes, 1, 3)).toEqual("abc");
		});
	});

	describe("bytesToHex / hexToBytes", () => {
		test("Can encode bytes to a lowercase hex string", () => {
			expect(Converter.bytesToHex(new Uint8Array([0xde, 0xad, 0xbe, 0xef]))).toEqual("deadbeef");
		});

		test("Can encode bytes to hex with 0x prefix", () => {
			expect(Converter.bytesToHex(new Uint8Array([0xde, 0xad, 0xbe, 0xef]), true)).toEqual(
				"0xdeadbeef"
			);
		});

		test("Can encode bytes to hex in reverse", () => {
			expect(
				Converter.bytesToHex(new Uint8Array([0x01, 0x02, 0x03]), false, undefined, undefined, true)
			).toEqual("030201");
		});

		test("Can encode a slice of bytes using startIndex and length", () => {
			expect(Converter.bytesToHex(new Uint8Array([0xaa, 0xbb, 0xcc]), false, 1, 1)).toEqual("bb");
		});

		test("Can decode a hex string to bytes", () => {
			expect(Converter.hexToBytes("deadbeef")).toEqual(new Uint8Array([0xde, 0xad, 0xbe, 0xef]));
		});

		test("Can decode a prefixed hex string to bytes", () => {
			expect(Converter.hexToBytes("0xdeadbeef")).toEqual(new Uint8Array([0xde, 0xad, 0xbe, 0xef]));
		});

		test("Can decode a hex string to bytes in reverse", () => {
			expect(Converter.hexToBytes("010203", true)).toEqual(new Uint8Array([0x03, 0x02, 0x01]));
		});

		test("Can round-trip bytes through hex", () => {
			const original = new Uint8Array([0x00, 0x01, 0x7f, 0x80, 0xff]);
			expect(Converter.hexToBytes(Converter.bytesToHex(original))).toEqual(original);
		});

		test("Can encode all-zero bytes", () => {
			expect(Converter.bytesToHex(new Uint8Array([0x00, 0x00]))).toEqual("0000");
		});
	});

	describe("utf8ToHex / hexToUtf8", () => {
		test("Can convert a UTF-8 string to hex", () => {
			// "A" = 0x41
			expect(Converter.utf8ToHex("A")).toEqual("41");
		});

		test("Can convert a UTF-8 string to hex with prefix", () => {
			expect(Converter.utf8ToHex("A", true)).toEqual("0x41");
		});

		test("Can convert hex back to a UTF-8 string", () => {
			expect(Converter.hexToUtf8("48656c6c6f")).toEqual("Hello");
		});

		test("Can round-trip a UTF-8 string through hex", () => {
			const original = "twin framework";
			expect(Converter.hexToUtf8(Converter.utf8ToHex(original))).toEqual(original);
		});
	});

	describe("bytesToBinary / binaryToBytes", () => {
		test("Can convert bytes to a binary string", () => {
			expect(Converter.bytesToBinary(new Uint8Array([0xaa]))).toEqual("10101010");
		});

		test("Can convert multiple bytes to a binary string", () => {
			expect(Converter.bytesToBinary(new Uint8Array([0xff, 0x00]))).toEqual("1111111100000000");
		});

		test("Can convert a binary string to bytes", () => {
			expect(Converter.binaryToBytes("10101010")).toEqual(new Uint8Array([0xaa]));
		});

		test("Can round-trip bytes through binary", () => {
			const original = new Uint8Array([0x01, 0xfe, 0x80, 0x7f]);
			expect(Converter.binaryToBytes(Converter.bytesToBinary(original))).toEqual(original);
		});
	});

	describe("bytesToBase64 / base64ToBytes", () => {
		test("Can round-trip bytes through Base64", () => {
			const original = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
			expect(Converter.base64ToBytes(Converter.bytesToBase64(original))).toEqual(original);
		});

		test("Can encode known bytes to Base64", () => {
			// [0x00, 0x01, 0x02] → "AAEC"
			expect(Converter.bytesToBase64(new Uint8Array([0x00, 0x01, 0x02]))).toEqual("AAEC");
		});

		test("Can decode a Base64 string to bytes", () => {
			expect(Converter.base64ToBytes("AAEC")).toEqual(new Uint8Array([0x00, 0x01, 0x02]));
		});
	});

	describe("bytesToBase64Url / base64UrlToBytes", () => {
		test("Can round-trip bytes through Base64Url", () => {
			const original = new Uint8Array([0xfb, 0xff, 0xfe]);
			expect(Converter.base64UrlToBytes(Converter.bytesToBase64Url(original))).toEqual(original);
		});

		test("Can encode bytes that would produce + and / in Base64 to safe URL characters", () => {
			// 0xFB 0xFF produces "+/" in standard Base64, "-_" in Base64Url
			const encoded = Converter.bytesToBase64Url(new Uint8Array([0xfb, 0xff]));
			expect(encoded).not.toContain("+");
			expect(encoded).not.toContain("/");
		});
	});

	describe("bytesToBase58 / base58ToBytes", () => {
		test("Can round-trip bytes through Base58", () => {
			const original = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
			expect(Converter.base58ToBytes(Converter.bytesToBase58(original))).toEqual(original);
		});

		test("Can encode known bytes to Base58", () => {
			// Single zero byte encodes to "1" in Base58
			expect(Converter.bytesToBase58(new Uint8Array([0x00]))).toEqual("1");
		});
	});
});
