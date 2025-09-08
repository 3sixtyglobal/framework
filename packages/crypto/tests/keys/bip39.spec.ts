// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter } from "@twin.org/core";
import testData from "./bip39.json";
import { Bip39 } from "../../src/keys/bip39";

describe("Bip39", () => {
	test("Can generate a random mnemonic with default length", () => {
		const mnemonic = Bip39.randomMnemonic();
		expect(mnemonic.split(" ").length).toEqual(24);
	});

	test("Can generate a random mnemonic with custom length", () => {
		const mnemonic = Bip39.randomMnemonic(128);
		expect(mnemonic.split(" ").length).toEqual(12);
	});

	test("Can verify with test vectors", () => {
		for (const test of testData) {
			const entropyBytes = Converter.hexToBytes(test.entropy);

			expect(Bip39.entropyToMnemonic(entropyBytes)).toEqual(test.mnemonic);

			expect(Converter.bytesToHex(Bip39.mnemonicToEntropy(test.mnemonic))).toEqual(test.entropy);

			expect(Converter.bytesToHex(Bip39.mnemonicToSeed(test.mnemonic, test.password))).toEqual(
				test.seed
			);
		}
	});

	it("should return true for a valid 24-word mnemonic", () => {
		const mnemonic = Bip39.randomMnemonic();
		expect(Bip39.validateMnemonic(mnemonic)).toBe(true);
	});

	it("should return false for a mnemonic with wrong word count", () => {
		const mnemonic = Bip39.randomMnemonic(128); // 12 words
		expect(Bip39.validateMnemonic(mnemonic)).toBe(false);
		expect(Bip39.validateMnemonic(mnemonic, 12)).toBe(true);
	});

	it("should return false for a mnemonic with invalid words", () => {
		const invalidMnemonic =
			"foo bar baz qux quux corge grault garply waldo fred plugh xyzzy thud wobble wibble flobble flibble blibble blabble blubble blibble blabble blubble blibble";
		expect(Bip39.validateMnemonic(invalidMnemonic)).toBe(false);
	});

	it("should return false for an empty string", () => {
		expect(Bip39.validateMnemonic("")).toBe(false);
	});

	it("should return false for a mnemonic with extra spaces", () => {
		const mnemonic = Bip39.randomMnemonic();
		const spaced = `  ${mnemonic}   `;
		expect(Bip39.validateMnemonic(spaced)).toBe(false);
	});
});
