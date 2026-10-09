// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter } from "@3sixty/core";
import { IntegrityHelper } from "../../src/helpers/integrityHelper.js";

describe("IntegrityHelper", () => {
	test("can fail if type is invalid", () => {
		expect(() => IntegrityHelper.generate("md5" as never, Converter.utf8ToBytes("hello"))).toThrow(
			expect.objectContaining({
				name: "GuardError",
				message: "guard.arrayOneOf"
			})
		);
	});

	test("can fail if content is invalid", () => {
		expect(() => IntegrityHelper.generate("sha256", undefined as never)).toThrow(
			expect.objectContaining({
				name: "GuardError",
				message: "guard.uint8Array"
			})
		);
	});

	test("can generate sha256 integrity for content", () => {
		const content = Converter.utf8ToBytes("hello");
		const integrity = IntegrityHelper.generate("sha256", content);
		expect(integrity).toEqual("sha256-LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=");
	});

	test("can generate sha384 integrity for content", () => {
		const content = Converter.utf8ToBytes("hello");
		const integrity = IntegrityHelper.generate("sha384", content);
		expect(integrity).toEqual(
			"sha384-WeF0h3dEjGnea4ANejO7+5/xtGPkQ1TDVTvNucZm+pASWjx5+QOXvfX2oT3oKGhP"
		);
	});

	test("can generate sha512 integrity for content", () => {
		const content = Converter.utf8ToBytes("hello");
		const integrity = IntegrityHelper.generate("sha512", content);
		expect(integrity).toEqual(
			"sha512-m3HSJL1i83hdltRq0+o9czGb+8KJDKra4t/3JRlnPKcjI8PZm6XBHXx6zG4UuMXaDEZjR1wuXDre9G9zvN7AQw=="
		);
	});

	test("verify can fail if integrity is invalid", () => {
		expect(() =>
			IntegrityHelper.verify(undefined as never, Converter.utf8ToBytes("hello"))
		).toThrow(
			expect.objectContaining({
				name: "GuardError",
				message: "guard.string"
			})
		);
	});

	test("verify can fail if content is invalid", () => {
		expect(() => IntegrityHelper.verify("sha256-abc", undefined as never)).toThrow(
			expect.objectContaining({
				name: "GuardError",
				message: "guard.uint8Array"
			})
		);
	});

	test("verify can return true for matching integrity", () => {
		const content = Converter.utf8ToBytes("hello");
		const integrity = IntegrityHelper.generate("sha256", content);
		expect(IntegrityHelper.verify(integrity, content)).toEqual(true);
	});

	test("verify can return false for mismatched integrity", () => {
		const content = Converter.utf8ToBytes("hello");
		const integrity = IntegrityHelper.generate("sha256", content);
		expect(IntegrityHelper.verify(`${integrity.slice(0, -1)}A`, content)).toEqual(false);
	});

	test("verify can return false for invalid integrity format", () => {
		const content = Converter.utf8ToBytes("hello");
		expect(IntegrityHelper.verify("sha256", content)).toEqual(false);
	});

	test("verify can throw for invalid algorithm in integrity format", () => {
		const content = Converter.utf8ToBytes("hello");
		expect(() => IntegrityHelper.verify("sha999-abc", content)).toThrow(
			expect.objectContaining({
				name: "GuardError",
				message: "guard.arrayOneOf"
			})
		);
	});

	test("verify can return true for matching sha256 integrity", () => {
		const content = Converter.utf8ToBytes("hello");
		expect(
			IntegrityHelper.verify("sha256-LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=", content)
		).toEqual(true);
	});

	test("verify can return true for matching sha384 integrity", () => {
		const content = Converter.utf8ToBytes("hello");
		expect(
			IntegrityHelper.verify(
				"sha384-WeF0h3dEjGnea4ANejO7+5/xtGPkQ1TDVTvNucZm+pASWjx5+QOXvfX2oT3oKGhP",
				content
			)
		).toEqual(true);
	});

	test("verify can return true for matching sha512 integrity", () => {
		const content = Converter.utf8ToBytes("hello");
		expect(
			IntegrityHelper.verify(
				"sha512-m3HSJL1i83hdltRq0+o9czGb+8KJDKra4t/3JRlnPKcjI8PZm6XBHXx6zG4UuMXaDEZjR1wuXDre9G9zvN7AQw==",
				content
			)
		).toEqual(true);
	});

	test("verify can return false for wrong content", () => {
		const content1 = Converter.utf8ToBytes("hello");
		const content2 = Converter.utf8ToBytes("world");
		const integrity = IntegrityHelper.generate("sha256", content1);
		expect(IntegrityHelper.verify(integrity, content2)).toEqual(false);
	});

	test("verify can return false for integrity with missing separator", () => {
		const content = Converter.utf8ToBytes("hello");
		expect(IntegrityHelper.verify("sha256", content)).toEqual(false);
		expect(IntegrityHelper.verify("LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=", content)).toEqual(
			false
		);
	});

	test("verify can throw for integrity with empty hash part", () => {
		const content = Converter.utf8ToBytes("hello");
		expect(() => IntegrityHelper.verify("sha256-", content)).toThrow(
			expect.objectContaining({
				name: "GuardError",
				message: "guard.stringEmpty"
			})
		);
	});

	test("verify can throw for integrity with empty algorithm part", () => {
		const content = Converter.utf8ToBytes("hello");
		expect(() =>
			IntegrityHelper.verify("-LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=", content)
		).toThrow(
			expect.objectContaining({
				name: "GuardError",
				message: "guard.arrayOneOf"
			})
		);
	});

	test("verify can throw for unsupported hash algorithm", () => {
		const content = Converter.utf8ToBytes("hello");
		expect(() => IntegrityHelper.verify("md5-abc123", content)).toThrow(
			expect.objectContaining({
				name: "GuardError",
				message: "guard.arrayOneOf"
			})
		);
		expect(() => IntegrityHelper.verify("sha1-abc123", content)).toThrow(
			expect.objectContaining({
				name: "GuardError",
				message: "guard.arrayOneOf"
			})
		);
	});

	test("verify can work with different content sizes", () => {
		const smallContent = Converter.utf8ToBytes("a");
		const largeContent = Converter.utf8ToBytes("a".repeat(10000));

		const smallIntegrity = IntegrityHelper.generate("sha256", smallContent);
		const largeIntegrity = IntegrityHelper.generate("sha512", largeContent);

		expect(IntegrityHelper.verify(smallIntegrity, smallContent)).toEqual(true);
		expect(IntegrityHelper.verify(largeIntegrity, largeContent)).toEqual(true);
		expect(IntegrityHelper.verify(smallIntegrity, largeContent)).toEqual(false);
		expect(IntegrityHelper.verify(largeIntegrity, smallContent)).toEqual(false);
	});

	test("verify can work with empty content", () => {
		const emptyContent = new Uint8Array(0);
		const integrity = IntegrityHelper.generate("sha256", emptyContent);
		expect(IntegrityHelper.verify(integrity, emptyContent)).toEqual(true);
	});
});
