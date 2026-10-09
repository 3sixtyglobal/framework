// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type * as NodeCrypto from "node:crypto";
import { Is, NativeModules } from "@3sixty/core";

/**
 * Resolve node:crypto for callers which can only use it when the platform also
 * supports the specific algorithm being asked for.
 */
export class NativeModulesCrypto {
	/**
	 * Whether the resolved node:crypto can work with Ed25519 keys, cached after the
	 * first probe as building a key to find out is not free.
	 * @internal
	 */
	private static _ed25519Supported: boolean | undefined;

	/**
	 * Get node:crypto, but only when this build's OpenSSL actually lists the cipher
	 * as supported, so a restricted build falls back rather than failing at call time.
	 * @param cipher The cipher to check for, e.g. "chacha20-poly1305".
	 * @returns The module to use natively, or undefined to use a pure JavaScript fallback.
	 */
	public static getNodeCryptoCipher(cipher: string): typeof NodeCrypto | undefined {
		const nodeCrypto = NativeModules.getModule<typeof NodeCrypto>("node:crypto");
		return nodeCrypto?.getCiphers().includes(cipher) ? nodeCrypto : undefined;
	}

	/**
	 * Get node:crypto, but only when this build's OpenSSL actually lists the hash
	 * as supported, so a restricted build falls back rather than failing at call time.
	 * @param hash The hash to check for, e.g. "sha3-256".
	 * @returns The module to use natively, or undefined to use a pure JavaScript fallback.
	 */
	public static getNodeCryptoHash(hash: string): typeof NodeCrypto | undefined {
		const nodeCrypto = NativeModules.getModule<typeof NodeCrypto>("node:crypto");
		return nodeCrypto?.getHashes().includes(hash) ? nodeCrypto : undefined;
	}

	/**
	 * Get node:crypto, but only when this build's OpenSSL actually lists the elliptic
	 * curve as supported, so a restricted build falls back rather than failing at call time.
	 * @param curve The curve to check for, e.g. "secp256k1".
	 * @returns The module to use natively, or undefined to use a pure JavaScript fallback.
	 */
	public static getNodeCryptoCurve(curve: string): typeof NodeCrypto | undefined {
		const nodeCrypto = NativeModules.getModule<typeof NodeCrypto>("node:crypto");
		return nodeCrypto?.getCurves().includes(curve) ? nodeCrypto : undefined;
	}

	/**
	 * Get node:crypto, but only when it exposes Argon2, which was added in Node 24.
	 * @returns The module to use natively, or undefined to use a pure JavaScript fallback.
	 */
	public static getNodeCryptoArgon2(): typeof NodeCrypto | undefined {
		const nodeCrypto = NativeModules.getModule<typeof NodeCrypto>("node:crypto");
		return Is.function(nodeCrypto?.argon2) ? nodeCrypto : undefined;
	}

	/**
	 * Get node:crypto, but only when it can work with Ed25519 keys. Ed25519 is absent from
	 * getCurves(), so the only reliable check is to build a key and see whether it throws.
	 * @returns The module to use natively, or undefined to use a pure JavaScript fallback.
	 */
	public static getNodeCryptoEd25519(): typeof NodeCrypto | undefined {
		const nodeCrypto = NativeModules.getModule<typeof NodeCrypto>("node:crypto");
		if (Is.undefined(nodeCrypto)) {
			return undefined;
		}

		if (Is.undefined(NativeModulesCrypto._ed25519Supported)) {
			try {
				nodeCrypto.generateKeyPairSync("ed25519");
				NativeModulesCrypto._ed25519Supported = true;
			} catch {
				NativeModulesCrypto._ed25519Supported = false;
			}
		}

		return NativeModulesCrypto._ed25519Supported ? nodeCrypto : undefined;
	}

	/**
	 * Clear the cached Ed25519 capability, so the next call probes again.
	 * Intended for tests which swap the registered node:crypto.
	 */
	public static reset(): void {
		NativeModulesCrypto._ed25519Supported = undefined;
	}
}
