// Copyright 2024 IOTA Stiftung.
// Copyright 2026 3Sixty Trade Ltd.
// SPDX-License-Identifier: Apache-2.0.
import type { IPngFrame } from "./IPngFrame.js";

/**
 * Image data for the PNG encoder.
 * @internal
 */
export interface IPngImageData {
	/**
	 * @internal
	 */
	cType: number;
	/**
	 * @internal
	 */
	depth: number;
	/**
	 * @internal
	 */
	plte: number[];
	/**
	 * @internal
	 */
	gotAlpha: boolean;
	/**
	 * @internal
	 */
	frames: IPngFrame[];
}
