// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { SingleOccurrenceArrayDepthHelper } from "./singleOccurrenceArrayDepthHelper.js";

/**
 * Utility type to create a non-empty array with values of type T and exactly one value of type U.
 */
export type SingleOccurrenceArray<T = unknown, U = never> = SingleOccurrenceArrayDepthHelper<
	T,
	U,
	[]
>;
