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
	 * Content Language.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Language
	 */
	ContentLanguage: "content-language",

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
	 * Cache Control.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
	 */
	CacheControl: "cache-control",

	/**
	 * ETag.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag
	 */
	ETag: "etag",

	/**
	 * If-None-Match.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-None-Match
	 */
	IfNoneMatch: "if-none-match",

	/**
	 * Last-Modified.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Last-Modified
	 */
	LastModified: "last-modified",

	/**
	 * If-Modified-Since.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Modified-Since
	 */
	IfModifiedSince: "if-modified-since",

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
	 * WWW-Authenticate.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/WWW-Authenticate
	 */
	WwwAuthenticate: "www-authenticate",

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
	 * Origin.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin
	 */
	Origin: "origin",

	/**
	 * Referer.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer
	 */
	Referer: "referer",

	/**
	 * Link
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link
	 */
	Link: "link",

	/**
	 * Vary.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Vary
	 */
	Vary: "vary",

	/**
	 * Access-Control-Allow-Origin.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
	 */
	AccessControlAllowOrigin: "access-control-allow-origin",

	/**
	 * Access-Control-Allow-Methods.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Methods
	 */
	AccessControlAllowMethods: "access-control-allow-methods",

	/**
	 * Access-Control-Allow-Headers.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers
	 */
	AccessControlAllowHeaders: "access-control-allow-headers",

	/**
	 * Access-Control-Expose-Headers.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers
	 */
	AccessControlExposeHeaders: "access-control-expose-headers",

	/**
	 * Access-Control-Max-Age.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Max-Age
	 */
	AccessControlMaxAge: "access-control-max-age",

	/**
	 * Access-Control-Allow-Credentials.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials
	 */
	AccessControlAllowCredentials: "access-control-allow-credentials",

	/**
	 * Range.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Range
	 */
	Range: "range",

	/**
	 * Accept-Ranges.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Ranges
	 */
	AcceptRanges: "accept-ranges",

	/**
	 * Content-Range.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Range
	 */
	ContentRange: "content-range",

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
