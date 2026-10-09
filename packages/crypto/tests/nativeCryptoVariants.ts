// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { NativeModules } from "@3sixty/core";
import { NativeModulesCrypto } from "../src/helpers/nativeModulesCrypto.js";

/**
 * The implementations every class with a node:crypto backed path must behave identically under.
 */
export const NATIVE_CRYPTO_VARIANTS: { implementation: string; useNodeCrypto: boolean }[] = [
	{ implementation: "node:crypto", useNodeCrypto: true },
	{ implementation: "pure JavaScript", useNodeCrypto: false }
];

/**
 * Drop node:crypto from the NativeModules registry so the pure JavaScript path is used.
 */
export function unregisterNodeCrypto(): void {
	delete NativeModules.getRegistry()["node:crypto"];
	// Ed25519 support is cached after the first probe, so it has to be forgotten too
	NativeModulesCrypto.reset();
}

/**
 * Put the registry into the state the variant needs, asserting it took effect so a
 * variant cannot silently run against the implementation it is not naming.
 * @param useNodeCrypto True to register node:crypto, false to leave it unregistered.
 */
export async function useNativeCryptoVariant(useNodeCrypto: boolean): Promise<void> {
	unregisterNodeCrypto();

	if (useNodeCrypto) {
		expect(await NativeModules.init(["node:crypto"])).toEqual({});
		expect(NativeModules.getModule("node:crypto")).toBeDefined();
	} else {
		expect(NativeModules.getModule("node:crypto")).toBeUndefined();
	}
}
