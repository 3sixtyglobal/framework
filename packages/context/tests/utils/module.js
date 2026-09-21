// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

// This module deliberately does not import @twin.org/context. It reaches the shared
// AsyncLocalStorage through the global shared store, which is the same route a
// separately loaded copy of the package takes, so the context bridge is still
// exercised from outside the package without depending on its build output.
async function getContextIds() {
	const stored = await globalThis.__TWIN_SHARED__?.asyncHooks;

	// Back-compat with context@0.9.0, which stored { contextIds: AsyncLocalStorage }.
	const storage = typeof stored?.getStore === 'function' ? stored : stored?.contextIds;

	return storage?.getStore();
}

export async function hasNodeContext() {
	const contextIds = await getContextIds();
	return contextIds['node'];
}

export class ContextIdChecker {
	async hasNodeContext() {
		const contextIds = await getContextIds();
		return contextIds['node'];
	}
}
