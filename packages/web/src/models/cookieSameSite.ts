// Copyright 2026 3Sixty Trade Ltd.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The values of the SameSite attribute of a cookie.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#samesitesamesite-value
 */
export const CookieSameSite = {
	/**
	 * Only sent with requests from the site that set the cookie.
	 */
	Strict: "Strict",

	/**
	 * Also sent when navigating to the site from another site, but not with requests other sites make.
	 */
	Lax: "Lax",

	/**
	 * Sent with every request, including those other sites make, the cookie must be Secure.
	 */
	None: "None"
} as const;

/**
 * The values of the SameSite attribute of a cookie.
 */
export type CookieSameSite = (typeof CookieSameSite)[keyof typeof CookieSameSite];
