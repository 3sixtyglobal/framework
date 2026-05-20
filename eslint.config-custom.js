// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
export function extendRules(allRules) {
	allRules.tsRules['@typescript-eslint/only-throw-error'] = [
		'error',
		{
			allow: ['BaseError', 'FetchError']
		}
	];
}
