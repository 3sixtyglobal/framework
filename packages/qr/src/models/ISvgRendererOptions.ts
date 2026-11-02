// Copyright 2026 3Sixty Trade Ltd.
// SPDX-License-Identifier: Apache-2.0.
import type { Color } from "@3sixty/image";
import type { IRendererOptions } from "./IRendererOptions.js";

/**
 * Options for rendering as SVG.
 */
export interface ISvgRendererOptions extends IRendererOptions {
	/**
	 * Background color, transparent when set to "transparent".
	 */
	background?: Color | string;

	/**
	 * Foreground color.
	 */
	foreground?: Color | string;
}
