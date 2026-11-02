// Copyright 2026 3Sixty Trade Ltd.
// SPDX-License-Identifier: Apache-2.0.
import { GeneralError, Guards } from "@3sixty/core";
import { Color } from "@3sixty/image";
import { nameof } from "@3sixty/nameof";
import type { IRendererOptions } from "../models/IRendererOptions.js";
import type { ISvgRendererOptions } from "../models/ISvgRendererOptions.js";
import type { QRCellData } from "../models/qrCellData.js";

/**
 * Class to render qr data as SVG, which stays sharp at any size.
 */
export class SvgRenderer {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<SvgRenderer>();

	/**
	 * Render the QR code data as SVG, with each run of dark cells in a row drawn as one rectangle of a single path.
	 * @param cellData The cell data for the QR code.
	 * @param options The options for rendering.
	 * @returns The SVG markup.
	 */
	public static async render(cellData: QRCellData, options?: ISvgRendererOptions): Promise<string> {
		Guards.array(SvgRenderer.CLASS_NAME, nameof(cellData), cellData);

		const cellSize = options?.cellSize ?? 5;
		const marginSize = options?.marginSize ?? 10;

		Guards.number(nameof<IRendererOptions>(), nameof(cellSize), cellSize);
		Guards.number(nameof<IRendererOptions>(), nameof(marginSize), marginSize);

		if (cellSize <= 0) {
			throw new GeneralError(nameof<IRendererOptions>(), "cellSizeZero", {
				cellSize
			});
		}
		if (marginSize <= 0) {
			throw new GeneralError(nameof<IRendererOptions>(), "marginSizeZero", {
				marginSize
			});
		}

		const transparent = options?.background === "transparent";
		const background = transparent
			? undefined
			: (Color.coerce(options?.background) ?? Color.fromHex("#FFFFFF"));
		const foreground = Color.coerce(options?.foreground) ?? Color.fromHex("#000000");

		const codeSize = cellData.length * cellSize;
		const dimensions = codeSize + marginSize + marginSize;

		// The cells are read as the bitmap renderers read them, so every renderer draws the same code.
		const path: string[] = [];
		for (let x = 0; x < cellData.length; x++) {
			const rowOffset = x * cellSize;
			const top = marginSize + rowOffset;
			let runStart = -1;
			for (let y = 0; y <= cellData[x].length; y++) {
				const on = y < cellData[x].length && cellData[y][x] === true;
				if (on && runStart === -1) {
					runStart = y;
				} else if (!on && runStart !== -1) {
					const runOffset = runStart * cellSize;
					const left = marginSize + runOffset;
					const width = (y - runStart) * cellSize;
					path.push(`M${left} ${top}h${width}v${cellSize}h-${width}z`);
					runStart = -1;
				}
			}
		}

		const parts = [
			`<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions}" height="${dimensions}" viewBox="0 0 ${dimensions} ${dimensions}" shape-rendering="crispEdges">`
		];
		if (background) {
			parts.push(
				`<rect width="${dimensions}" height="${dimensions}" ${SvgRenderer.fill(background)}/>`
			);
		}
		if (path.length > 0) {
			parts.push(`<path d="${path.join("")}" ${SvgRenderer.fill(foreground)}/>`);
		}
		parts.push("</svg>");
		return parts.join("");
	}

	/**
	 * Write the fill attributes for a color, with its opacity when it is not opaque.
	 * @param color The color.
	 * @returns The attributes.
	 * @internal
	 */
	private static fill(color: Color): string {
		const alpha = color.alpha();
		return alpha === 255
			? `fill="${color.hex()}"`
			: `fill="${color.hex()}" fill-opacity="${Math.round((alpha / 255) * 100) / 100}"`;
	}
}
