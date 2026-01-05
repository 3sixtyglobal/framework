// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { CookieHelper } from "../../src/utils/cookieHelper.js";

describe("CookieHelper", () => {
	describe("getCookieFromHeaders", () => {
		it("should get a cookie value from a single header string", () => {
			const cookie = CookieHelper.getCookieFromHeaders("foo=bar; test=value", "test");
			expect(cookie).toBe("value");
		});

		it("should get a cookie value from an array of header strings", () => {
			const headers = ["foo=bar", "test=value; another=123"];
			const cookie = CookieHelper.getCookieFromHeaders(headers, "test");
			expect(cookie).toBe("value");
		});

		it("should return undefined if the cookie is not found", () => {
			const cookie = CookieHelper.getCookieFromHeaders("foo=bar; hello=world", "test");
			expect(cookie).toBeUndefined();
		});

		it("should handle undefined headers", () => {
			const cookie = CookieHelper.getCookieFromHeaders(undefined, "test");
			expect(cookie).toBeUndefined();
		});
	});

	describe("deleteCookie", () => {
		it("should create a cookie string with Max-Age=0", () => {
			const cookie = CookieHelper.deleteCookie("test");
			expect(cookie).toContain("test=");
			expect(cookie).toContain("Max-Age=0");
		});

		it("should create a cookie string with custom options and Max-Age=0", () => {
			const cookie = CookieHelper.deleteCookie("foo", {
				secure: false,
				httpOnly: false,
				sameSite: "None",
				path: "/bye"
			});
			expect(cookie).toContain("foo=");
			expect(cookie).not.toContain("Secure");
			expect(cookie).not.toContain("HttpOnly");
			expect(cookie).toContain("SameSite=None");
			expect(cookie).toContain("Path=/bye");
			expect(cookie).toContain("Max-Age=0");
		});
	});
	describe("createCookie", () => {
		it("should create a cookie with default options", () => {
			const cookie = CookieHelper.createCookie("test", "value");
			expect(cookie).toContain("test=value");
			expect(cookie).toContain("Secure");
			expect(cookie).toContain("HttpOnly");
			expect(cookie).toContain("SameSite=Strict");
			expect(cookie).toContain("Path=/");
		});

		it("should create a cookie with custom options", () => {
			const cookie = CookieHelper.createCookie("foo", "bar", {
				secure: false,
				httpOnly: false,
				sameSite: "Lax",
				path: "/custom"
			});
			expect(cookie).toContain("foo=bar");
			expect(cookie).not.toContain("Secure");
			expect(cookie).not.toContain("HttpOnly");
			expect(cookie).toContain("SameSite=Lax");
			expect(cookie).toContain("Path=/custom");
		});

		it("should correctly decode a cookie value with special characters", () => {
			const specialValue = "a=b;c d";
			const cookieHeader = CookieHelper.createCookie("test", specialValue);
			const retrievedValue = CookieHelper.getCookieFromHeaders(cookieHeader, "test");
			expect(retrievedValue).toBe(specialValue);
		});
	});
});
