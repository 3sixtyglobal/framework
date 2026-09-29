// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { RandomHelper } from "../../src/helpers/randomHelper.js";

describe("RandomHelper", () => {
	describe("generate", () => {
		it("should generate an empty array for a zero length", () => {
			expect(RandomHelper.generate(0)).toEqual(new Uint8Array());
		});

		it("should generate the requested length", () => {
			expect(RandomHelper.generate(32).length).toEqual(32);
		});

		it("should generate up to the maximum length", () => {
			expect(RandomHelper.generate(65536).length).toEqual(65536);
		});

		it("should throw when the length is above the maximum", () => {
			expect(() => RandomHelper.generate(65537)).toThrow(
				expect.objectContaining({ name: "GeneralError", message: "randomHelper.maxLength" })
			);
		});

		it("should generate different values on each call", () => {
			const first = RandomHelper.generate(64);
			const second = RandomHelper.generate(64);
			expect(first).not.toEqual(second);
		});
	});

	describe("generateUuidV7", () => {
		it("should generate a valid UUIDv7 string format", () => {
			const uuid = RandomHelper.generateUuidV7();
			expect(uuid).toMatch(/^[\da-f]{8}-[\da-f]{4}-7[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i);
		});

		it("should generate a valid UUIDv7 string format in compact form", () => {
			const uuid = RandomHelper.generateUuidV7("compact");
			expect(uuid).toMatch(/^[\da-f]{32}$/i);
		});

		it("should generate unique UUIDs on multiple calls", () => {
			const uuids = new Set(Array.from({ length: 100 }, () => RandomHelper.generateUuidV7()));
			expect(uuids.size).toBe(100);
		});

		it("should encode the current timestamp in the first 12 hex digits", () => {
			const uuid = RandomHelper.generateUuidV7();
			const tsHex = uuid.slice(0, 13).replace(/-/g, "");
			const ts = Number.parseInt(tsHex, 16);
			const now = Date.now();
			// Allow a small time drift
			expect(Math.abs(ts - now)).toBeLessThan(1000);
		});
	});

	describe("uuidv7ExtractTimestamp", () => {
		it("should extract a timestamp close to now", () => {
			const uuid = RandomHelper.generateUuidV7();
			const ts = RandomHelper.uuidV7ExtractTimestamp(uuid);
			const now = Date.now();
			expect(Math.abs(ts - now)).toBeLessThan(1000);
		});

		it("should throw for non-uuidv7 input", () => {
			expect(() => RandomHelper.uuidV7ExtractTimestamp("not-a-uuid")).toThrow();
		});
	});
});
