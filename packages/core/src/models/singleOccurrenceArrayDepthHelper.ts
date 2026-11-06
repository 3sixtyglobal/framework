// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
/**
 * Helper with bounded recursion depth to keep type instantiation tractable.
 */
export type SingleOccurrenceArrayDepthHelper<T, U, Depth extends 0[]> = Depth["length"] extends 16
	? [U, ...T[]]
	: [U, ...T[]] | [T, ...SingleOccurrenceArrayDepthHelper<T, U, [0, ...Depth]>];
