// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter } from "@3sixty/core";
import { Sha3 } from "../../src/hashes/sha3.js";
import {
	NATIVE_CRYPTO_VARIANTS,
	unregisterNodeCrypto,
	useNativeCryptoVariant
} from "../nativeCryptoVariants.js";

// Vectors from the NIST SHA-3 examples.
const ABC = {
	224: "e642824c3f8cf24ad09234ee7d3c766fc9a3a5168d0c94ad73b46fdf",
	256: "3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532",
	384: "ec01498288516fc926459f58e2c6ad8df9b473cb0fc08c2596da7cf0e49be4b298d88cea927ac7f539f1edf228376d25",
	512:
		"b751850b1a57168a5693cd924b6b096e08f621827444f70d884f5d0240d2712e" +
		"10e116e9192af3c91a7ec57647e3934057340b4cf408d5a56592f8274eec53f0"
};

const EMPTY = {
	224: "6b4e03423667dbb73b6e15454f0eb1abd4597f9a1b078e3f5b5a6bc7",
	256: "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
	384: "0c63a75b845e4f7d01107d852e4c2485c51a50aaaa94fc61995e71bbee983a2ac3713831264adb47fb6bd1e058d5f004",
	512:
		"a69f73cca23a9ac5c8b567dc185a756e97c982164fe25859e0d1dcc1475c80a6" +
		"15b2123af1f5f94c11e3e9402c3ac558f500199d95b6d3e301758586281dcd26"
};

const FOX = "The quick brown fox jumps over the lazy dog";
const FOX_256 = "69070dda01975c8c120c3aada1b282394e7f032fa9cf32f4cb2259a0897dfc04";

describe.each(NATIVE_CRYPTO_VARIANTS)("Sha3 ($implementation)", ({ useNodeCrypto }) => {
	beforeAll(async () => {
		await useNativeCryptoVariant(useNodeCrypto);
	});

	afterAll(() => {
		unregisterNodeCrypto();
	});

	test("Can perform each size on short text", () => {
		expect(Converter.bytesToHex(Sha3.sum224(Converter.utf8ToBytes("abc")))).toEqual(ABC[224]);
		expect(Converter.bytesToHex(Sha3.sum256(Converter.utf8ToBytes("abc")))).toEqual(ABC[256]);
		expect(Converter.bytesToHex(Sha3.sum384(Converter.utf8ToBytes("abc")))).toEqual(ABC[384]);
		expect(Converter.bytesToHex(Sha3.sum512(Converter.utf8ToBytes("abc")))).toEqual(ABC[512]);
	});

	test("Can perform each size on empty text", () => {
		expect(Converter.bytesToHex(Sha3.sum224(new Uint8Array()))).toEqual(EMPTY[224]);
		expect(Converter.bytesToHex(Sha3.sum256(new Uint8Array()))).toEqual(EMPTY[256]);
		expect(Converter.bytesToHex(Sha3.sum384(new Uint8Array()))).toEqual(EMPTY[384]);
		expect(Converter.bytesToHex(Sha3.sum512(new Uint8Array()))).toEqual(EMPTY[512]);
	});

	test("Can perform a sha3 on a sentence", () => {
		const sha = new Sha3();
		sha.update(Converter.utf8ToBytes(FOX));
		expect(Converter.bytesToHex(sha.digest())).toEqual(FOX_256);
	});

	test("Can accumulate multiple updates into one digest", () => {
		const chunked = new Sha3();
		chunked.update(Converter.utf8ToBytes("The quick brown fox "));
		chunked.update(Converter.utf8ToBytes("jumps over the lazy dog"));

		expect(Converter.bytesToHex(chunked.digest())).toEqual(FOX_256);
	});

	test("Can chain update calls", () => {
		const sha = new Sha3();
		expect(sha.update(Converter.utf8ToBytes("a"))).toBe(sha);
	});

	test("Can hash a block spanning multiple sponge absorptions", () => {
		const block = new Uint8Array(4096);
		for (let i = 0; i < block.length; i++) {
			block[i] = i % 256;
		}

		expect(Sha3.sum256(block).length).toEqual(32);
		expect(Converter.bytesToHex(Sha3.sum256(block))).toEqual(
			Converter.bytesToHex(new Sha3(Sha3.SIZE_256).update(block).digest())
		);
	});

	test("Returns a plain Uint8Array rather than a platform buffer type", () => {
		expect(Sha3.sum256(Converter.utf8ToBytes("abc")).constructor).toEqual(Uint8Array);
	});

	test("Throws for an unsupported bit size", () => {
		expect(() => new Sha3(128)).toThrow(
			expect.objectContaining({ name: "GeneralError", message: "sha3.bitSize" })
		);
	});

	test("Produces the same digest as the other implementation", async () => {
		const block = Converter.utf8ToBytes("cross implementation sha3 ".repeat(20));
		const digest = Sha3.sum512(block);

		unregisterNodeCrypto();
		if (!useNodeCrypto) {
			await useNativeCryptoVariant(true);
		}

		try {
			expect(Sha3.sum512(block)).toEqual(digest);
		} finally {
			await useNativeCryptoVariant(useNodeCrypto);
		}
	});
});
