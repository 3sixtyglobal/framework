// Copyright 2026 3Sixty Trade Ltd.
// SPDX-License-Identifier: Apache-2.0.
import { Color } from "@3sixty/image";
import { ErrorCorrectLevel } from "../src/models/errorCorrectLevel.js";
import { QR } from "../src/qr.js";
import { SvgRenderer } from "../src/renderers/svgRenderer.js";

describe("SvgRenderer", () => {
	test("can draw each run of dark cells in a row as one rectangle", async () => {
		// Indexed as the bitmap renderers read the cells, column first.
		const svg = await SvgRenderer.render(
			[
				[true, false],
				[true, true]
			],
			{ cellSize: 2, marginSize: 1 }
		);
		expect(svg).toEqual(
			'<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" shape-rendering="crispEdges">' +
				'<rect width="6" height="6" fill="#FFFFFF"/>' +
				'<path d="M1 1h4v2h-4zM3 3h2v2h-2z" fill="#000000"/>' +
				"</svg>"
		);
	});

	test("can leave out the background and draw a translucent foreground", async () => {
		const svg = await SvgRenderer.render([[true]], {
			background: "transparent",
			foreground: new Color(128, 255, 0, 0)
		});
		expect(svg).not.toContain("<rect");
		expect(svg).toContain('fill="#FF0000" fill-opacity="0.5"');
	});

	test("can render a generated code with the same size as the bitmap renderers", async () => {
		const qr = new QR(2, ErrorCorrectLevel.M);
		qr.addText("https://example.org");
		const cells = qr.generate();
		const svg = await SvgRenderer.render(cells, { cellSize: 4, marginSize: 8 });
		const codeSize = cells.length * 4;
		const size = codeSize + 16;
		expect(svg).toContain(`viewBox="0 0 ${size} ${size}"`);
		expect(svg).toMatch(/<path d="(M\d+ \d+h\d+v4h-\d+z)+" fill="#000000"\/>/);
	});

	test("can fail with a cell size of zero", async () => {
		await expect(SvgRenderer.render([[true]], { cellSize: 0 })).rejects.toMatchObject({
			name: "GeneralError",
			message: "rendererOptions.cellSizeZero"
		});
	});

	test("can fail with a margin size of zero", async () => {
		await expect(SvgRenderer.render([[true]], { marginSize: 0 })).rejects.toMatchObject({
			name: "GeneralError",
			message: "rendererOptions.marginSizeZero"
		});
	});

	test("can fail with no cell data", async () => {
		await expect(SvgRenderer.render(undefined as unknown as boolean[][])).rejects.toMatchObject({
			name: "GuardError"
		});
	});
});
