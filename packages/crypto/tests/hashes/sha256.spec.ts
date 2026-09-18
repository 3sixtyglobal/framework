// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter, NativeModules, SharedStore } from "@twin.org/core";
import testData from "./sha256.json" with { type: "json" };
import { Sha256 } from "../../src/hashes/sha256.js";

describe("Sha256", () => {
	test("Can perform a sha256 on short text", () => {
		const sha = new Sha256();
		sha.update(Converter.utf8ToBytes("abc"));
		const digest = sha.digest();
		expect(Converter.bytesToHex(digest)).toEqual(
			"ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
		);
	});

	test("Can perform a sha256 on empty text", () => {
		const sha = new Sha256();
		sha.update(Converter.utf8ToBytes(""));
		const digest = sha.digest();
		expect(Converter.bytesToHex(digest)).toEqual(
			"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
		);
	});

	test("Can perform a sha256 on sentence", () => {
		const sha = new Sha256();
		sha.update(Converter.utf8ToBytes("The quick brown fox jumps over the lazy dog"));
		const digest = sha.digest();
		expect(Converter.bytesToHex(digest)).toEqual(
			"d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592"
		);
	});

	test("Can verify sha256 padding block boundaries", () => {
		// SHA-256 pads at 56 bytes within a 64-byte block.
		const boundaries = [
			{ length: 55, hash: "463eb28e72f82e0a96c0a4cc53690c571281131f672aa229e0d45ae59b598b59" },
			{ length: 56, hash: "da2ae4d6b36748f2a318f23e7ab1dfdf45acdc9d049bd80e59de82a60895f562" },
			{ length: 63, hash: "29af2686fd53374a36b0846694cc342177e428d1647515f078784d69cdb9e488" },
			{ length: 64, hash: "fdeab9acf3710362bd2658cdc9a29e8f9c757fcf9811603a8c447cd1d9151108" },
			{ length: 65, hash: "4bfd2c8b6f1eec7a2afeb48b934ee4b2694182027e6d0fc075074f2fabb31781" }
		];
		for (const boundary of boundaries) {
			const block = new Uint8Array(boundary.length);
			for (let i = 0; i < boundary.length; i++) {
				block[i] = i % 256;
			}
			expect(Converter.bytesToHex(Sha256.sum256(block))).toEqual(boundary.hash);
		}
	});

	test("Can perform a sha224 (sum224) on short text", () => {
		expect(Converter.bytesToHex(Sha256.sum224(Converter.utf8ToBytes("abc")))).toEqual(
			"23097d223405d8228642a477bda255b32aadbce4bda0b3f7e36c9da7"
		);
	});

	test("Can verify with test vectors", () => {
		for (const test of testData) {
			expect(Converter.bytesToHex(Sha256.sum256(Converter.hexToBytes(test.input)))).toEqual(
				test.hash
			);
		}
	});

	test("Uses the native hash once node:crypto has been registered via init()", async () => {
		await NativeModules.init(["node:crypto"]);

		const nodeCrypto = NativeModules.getModule<{ createHash: (...args: unknown[]) => unknown }>(
			"node:crypto"
		);
		const realCreateHash = nodeCrypto?.createHash.bind(nodeCrypto);
		let createHashCalls = 0;

		const registry = SharedStore.get<{ [specifier: string]: unknown }>(
			"nativeModulesRegistry",
			() => ({})
		);
		const previousNodeCrypto = registry["node:crypto"];
		registry["node:crypto"] = {
			...nodeCrypto,
			createHash: (...args: unknown[]) => {
				createHashCalls++;
				return realCreateHash?.(...args);
			}
		};

		try {
			const digest = Sha256.sum256(Converter.utf8ToBytes("abc"));
			expect(Converter.bytesToHex(digest)).toEqual(
				"ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
			);
			expect(createHashCalls).toEqual(1);
			expect(digest.constructor).toEqual(Uint8Array);
		} finally {
			registry["node:crypto"] = previousNodeCrypto;
		}
	});
});
