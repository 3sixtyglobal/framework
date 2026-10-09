// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { Color } from "@3sixty/image";
import type { IRendererOptions } from "./IRendererOptions.js";

/**
 * Options for rendering.
 */
export interface IBitmapRendererOptions extends IRendererOptions {
	/**
	 * Background color.
	 */
	background?: Color | string;

	/**
	 * Foreground color.
	 */
	foreground?: Color | string;
}
