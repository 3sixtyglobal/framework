// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
/**
 * Internal helper with bounded recursion depth to keep type instantiation tractable.
 */
type SingleOccurrenceArrayInternal<T, U, Depth extends 0[]> = Depth["length"] extends 16
	? [U, ...T[]]
	: [U, ...T[]] | [T, ...SingleOccurrenceArrayInternal<T, U, [0, ...Depth]>];

/**
 * Utility type to create a non-empty array with values of type T and exactly one value of type U.
 */
export type SingleOccurrenceArray<T = unknown, U = never> = SingleOccurrenceArrayInternal<T, U, []>;
