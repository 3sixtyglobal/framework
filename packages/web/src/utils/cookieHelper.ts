// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Guards, Is } from "@3sixty/core";
import { nameof } from "@3sixty/nameof";

/**
 * Class to help with cookie operations.
 */
export class CookieHelper {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<CookieHelper>();

	/**
	 * Create a cookie string.
	 * @param cookieName The name of the cookie.
	 * @param cookieValue The value of the cookie.
	 * @param options Additional cookie options.
	 * @param options.secure Should this be a secure cookie.
	 * @param options.httpOnly Should this be an http only cookie.
	 * @param options.sameSite The same site option for the cookie.
	 * @param options.path The path for the cookie.
	 * @returns The created cookie string.
	 */
	public static createCookie(
		cookieName: string,
		cookieValue: string,
		options?: {
			secure?: boolean;
			httpOnly?: boolean;
			sameSite?: "Strict" | "Lax" | "None";
			path?: string;
		}
	): string {
		Guards.stringValue(CookieHelper.CLASS_NAME, nameof(cookieName), cookieName);
		Guards.string(CookieHelper.CLASS_NAME, nameof(cookieValue), cookieValue);

		const cookieParts = [`${cookieName}=${encodeURIComponent(cookieValue)}`];

		const localOptions = options ?? {};
		localOptions.secure ??= true;
		localOptions.httpOnly ??= true;
		localOptions.sameSite ??= "Strict";
		localOptions.path ??= "/";

		if (localOptions.secure) {
			cookieParts.push("Secure");
		}
		if (localOptions.httpOnly) {
			cookieParts.push("HttpOnly");
		}
		if (localOptions.sameSite) {
			cookieParts.push(`SameSite=${localOptions.sameSite}`);
		}
		if (localOptions.path) {
			cookieParts.push(`Path=${localOptions.path}`);
		}

		return cookieParts.join("; ");
	}

	/**
	 * Create a cookie string which will delete a cookie.
	 * @param cookieName The name of the cookie.
	 * @param options Additional cookie options.
	 * @param options.secure Should this be a secure cookie.
	 * @param options.httpOnly Should this be an http only cookie.
	 * @param options.sameSite The same site option for the cookie.
	 * @param options.path The path for the cookie.
	 * @returns The created cookie string.
	 */
	public static deleteCookie(
		cookieName: string,
		options?: {
			secure?: boolean;
			httpOnly?: boolean;
			sameSite?: "Strict" | "Lax" | "None";
			path?: string;
		}
	): string {
		return `${CookieHelper.createCookie(cookieName, "", options)}; Max-Age=0`;
	}

	/**
	 * Get cookies from headers.
	 * @param headers The headers to get cookies from.
	 * @param cookieName The name of the cookie to get.
	 * @returns The cookies found in the headers.
	 */
	public static getCookieFromHeaders(
		headers: string | string[] | undefined,
		cookieName: string
	): string | undefined {
		Guards.stringValue(CookieHelper.CLASS_NAME, nameof(cookieName), cookieName);

		if (!Is.empty(headers)) {
			const cookies = Is.arrayValue(headers) ? headers : [headers];
			for (const cookie of cookies) {
				if (Is.stringValue(cookie)) {
					const accessTokenCookie = cookie
						.split(";")
						.map(c => c.trim())
						.find(c => c.startsWith(`${cookieName}=`));

					if (Is.stringValue(accessTokenCookie)) {
						return decodeURIComponent(accessTokenCookie.slice(cookieName.length + 1).trim());
					}
				}
			}
		}
	}
}
