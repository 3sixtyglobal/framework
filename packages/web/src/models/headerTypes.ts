// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Common http header types.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const HeaderTypes = {
	/**
	 * Content Type.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type
	 */
	ContentType: "content-type",

	/**
	 * Content Length.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Length
	 */
	ContentLength: "content-length",

	/**
	 * Content Disposition.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition
	 */
	ContentDisposition: "content-disposition",

	/**
	 * Content Encoding.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding
	 */
	ContentEncoding: "content-encoding",

	/**
	 * Accept.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept
	 */
	Accept: "accept",

	/**
	 * Accept-Language.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept-Language
	 */
	AcceptLanguage: "accept-language",

	/**
	 * Accept-Encoding.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept-Encoding
	 */
	AcceptEncoding: "accept-encoding",

	/**
	 * Authorization.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Authorization
	 */
	Authorization: "authorization",

	/**
	 * Cookie.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cookie
	 */
	Cookie: "cookie",

	/**
	 * Set Cookie.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie
	 */
	SetCookie: "set-cookie",

	/**
	 * Location
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Location
	 */
	Location: "location",

	/**
	 * Link
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link
	 */
	Link: "link",

	/**
	 * User-Agent
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent
	 */
	UserAgent: "user-agent"
} as const;

/**
 * Common http header types.
 */
export type HeaderTypes = (typeof HeaderTypes)[keyof typeof HeaderTypes];
