// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { NumberHelper } from "../../src/helpers/numberHelper.js";

// The clamp method adjusts a value only if bounds are defined and violated.
// It leaves the value unchanged when a bound is undefined.
// These tests cover typical boundary conditions and edge cases.

describe("NumberHelper", () => {
	test("clamp returns value when within inclusive range", () => {
		expect(NumberHelper.clamp(5, 0, 10)).toEqual(5);
	});

	test("clamp returns min when value below min", () => {
		expect(NumberHelper.clamp(-1, 0, 10)).toEqual(0);
	});

	test("clamp returns max when value above max", () => {
		expect(NumberHelper.clamp(11, 0, 10)).toEqual(10);
	});

	test("clamp with undefined min only clamps to max", () => {
		expect(NumberHelper.clamp(20, undefined, 10)).toEqual(10);
		expect(NumberHelper.clamp(5, undefined, 10)).toEqual(5);
	});

	test("clamp with undefined max only clamps to min", () => {
		expect(NumberHelper.clamp(-5, 0, undefined)).toEqual(0);
		expect(NumberHelper.clamp(5, 0, undefined)).toEqual(5);
	});

	test("clamp leaves value when both bounds undefined", () => {
		expect(NumberHelper.clamp(123, undefined, undefined)).toEqual(123);
	});

	test("clamp handles negative range correctly", () => {
		expect(NumberHelper.clamp(-5, -10, -1)).toEqual(-5);
		expect(NumberHelper.clamp(-15, -10, -1)).toEqual(-10);
		expect(NumberHelper.clamp(0, -10, -1)).toEqual(-1);
	});

	test("clamp when min equals max returns that constant", () => {
		expect(NumberHelper.clamp(5, 3, 3)).toEqual(3);
		expect(NumberHelper.clamp(3, 3, 3)).toEqual(3);
		expect(NumberHelper.clamp(-10, -10, -10)).toEqual(-10);
	});

	test("clamp ignores inverted bounds (min > max) applying them sequentially", () => {
		// Behavior: first lower bound applied (minValue) then upper (maxValue) if greater.
		// For inverted bounds value < min triggers clamp to min, then since min > max, second condition clamps to max.
		// Documenting current behavior rather than enforcing corrected logic.
		expect(NumberHelper.clamp(0, 10, 5)).toEqual(5);
		// Value above min: min not applied, then capped by max.
		expect(NumberHelper.clamp(12, 10, 5)).toEqual(5);
		// Value between inverted bounds: min not applied, final clamp uses max.
		expect(NumberHelper.clamp(7, 10, 5)).toEqual(5);
	});

	test("clamp with Infinity bounds behaves as numeric comparison", () => {
		expect(NumberHelper.clamp(5, -Infinity, Infinity)).toEqual(5);
		expect(NumberHelper.clamp(-1, 0, Infinity)).toEqual(0);
		expect(NumberHelper.clamp(999, -Infinity, 100)).toEqual(100);
	});

	test("clamp throws with NaN value", () => {
		expect(() => NumberHelper.clamp(Number.NaN, 0, 10)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.number" })
		);
	});

	test("clamp throws with positive infinity value", () => {
		expect(() => NumberHelper.clamp(Number.POSITIVE_INFINITY, 0, 10)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.number" })
		);
	});

	test("clamp throws with negative infinity value", () => {
		expect(() => NumberHelper.clamp(Number.NEGATIVE_INFINITY, 0, 10)).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.number" })
		);
	});

	test("clamp handles floating point values within range", () => {
		expect(NumberHelper.clamp(0.5, 0.1, 0.9)).toEqual(0.5);
	});

	test("clamp handles floating point below min", () => {
		expect(NumberHelper.clamp(0.05, 0.1, 0.9)).toEqual(0.1);
	});

	test("clamp handles floating point above max", () => {
		expect(NumberHelper.clamp(0.95, 0.1, 0.9)).toEqual(0.9);
	});

	test("clamp includes floating point boundary values", () => {
		expect(NumberHelper.clamp(0.1, 0.1, 0.9)).toEqual(0.1);
		expect(NumberHelper.clamp(0.9, 0.1, 0.9)).toEqual(0.9);
	});

	test("clamp floating point with undefined min only clamps to max", () => {
		expect(NumberHelper.clamp(0.95, undefined, 0.9)).toEqual(0.9);
		expect(NumberHelper.clamp(0.5, undefined, 0.9)).toEqual(0.5);
	});

	test("clamp floating point with undefined max only clamps to min", () => {
		expect(NumberHelper.clamp(0.05, 0.1, undefined)).toEqual(0.1);
		expect(NumberHelper.clamp(0.5, 0.1, undefined)).toEqual(0.5);
	});
});
