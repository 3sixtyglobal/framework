// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The names of the HTTP Methods.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const HttpMethod = {
	/**
	 * Retrieve a representation of the resource.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET
	 */
	GET: "GET",
	/**
	 * Submit an entity to the specified resource.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST
	 */
	POST: "POST",
	/**
	 * Replace all current representations of the target resource.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PUT
	 */
	PUT: "PUT",
	/**
	 * Apply partial modifications to a resource.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PATCH
	 */
	PATCH: "PATCH",
	/**
	 * Delete the specified resource.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/DELETE
	 */
	DELETE: "DELETE",
	/**
	 * Describe the communication options for the target resource.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS
	 */
	OPTIONS: "OPTIONS",
	/**
	 * Ask for a response identical to GET, but without the response body.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/HEAD
	 */
	HEAD: "HEAD",
	/**
	 * Establish a tunnel to the server identified by the target resource.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/CONNECT
	 */
	CONNECT: "CONNECT",
	/**
	 * Perform a message loop-back test along the path to the target resource.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/TRACE
	 */
	TRACE: "TRACE"
} as const;

/**
 * The HTTP Methods.
 */
export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod];
