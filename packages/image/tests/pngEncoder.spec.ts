// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter } from "@3sixty/core";
import { PngEncoder } from "../src/encoders/pngEncoder.js";

describe("PngEncoder", () => {
	test("Can encode an empty image", async () => {
		const encoder = new PngEncoder();
		const results = await encoder.encode([new Uint8Array().buffer], 0, 0);
		expect(Converter.bytesToBase64(results)).toEqual(
			"iVBORw0KGgoAAAANSUhEUgAAAAAAAAAAAQMAAAABRe5RAAAAAXNSR0IB2cksfwAAAANQTFRFAAAAp3o92gAAAAF0Uk5TAEDm2GYAAAAISURBVHicAwAAAAABSAaJ0gAAAABJRQ=="
		);
	});

	test("Can encode an image", async () => {
		const encoder = new PngEncoder();
		const results = await encoder.encode(
			[
				new Uint8Array([
					255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
					255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0,
					0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
				]).buffer
			],
			8,
			2
		);
		expect(Converter.bytesToBase64(results)).toEqual(
			"iVBORw0KGgoAAAANSUhEUgAAAAgAAAACAgMAAAAY+nV+AAAAAXNSR0IB2cksfwAAAAlQTFRFAAAA////AAAAc8aDcQAAAAN0Uk5TAP8AaVI5rAAAABFJREFUeJxjCA1lWLWKAQkAABz1Af/kHSEGAAAAAElFTkSuQmCC"
		);
	});
});
