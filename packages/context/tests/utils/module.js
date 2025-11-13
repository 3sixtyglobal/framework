// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ContextIdStore } from '@twin.org/context';

export async function hasNodeContext() {
	const contextIds = await ContextIdStore.getContextIds();
	return contextIds['node'];
}

export class ContextIdChecker {
	async hasNodeContext() {
		const contextIds = await ContextIdStore.getContextIds();
		return contextIds['node'];
	}
}
