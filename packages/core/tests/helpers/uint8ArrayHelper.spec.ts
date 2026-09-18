// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Uint8ArrayHelper } from "../../src/helpers/uint8ArrayHelper.js";

describe("Uint8ArrayHelper", () => {
	test("concat returns an empty array for an empty list", () => {
		expect(Uint8ArrayHelper.concat([])).toEqual(new Uint8Array());
	});

	test("concat returns a copy of a single array", () => {
		expect(Uint8ArrayHelper.concat([new Uint8Array([1, 2, 3])])).toEqual(new Uint8Array([1, 2, 3]));
	});

	test("concat joins multiple arrays in order", () => {
		expect(Uint8ArrayHelper.concat([new Uint8Array([1, 2]), new Uint8Array([3, 4, 5])])).toEqual(
			new Uint8Array([1, 2, 3, 4, 5])
		);
	});

	test("concat skips over an empty array in the middle", () => {
		expect(
			Uint8ArrayHelper.concat([new Uint8Array([1]), new Uint8Array([]), new Uint8Array([2])])
		).toEqual(new Uint8Array([1, 2]));
	});
});
