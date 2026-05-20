// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { HttpLinkRelType } from "./httpLinkRelType.js";

/**
 * Model used for Http link headers parameter.
 */
export interface IHttpLinkHeader {
	/**
	 * The URL of the link.
	 */
	url: string;

	/**
	 * Optional query parameters for the URL.
	 */
	urlQueryParams?: { [id: string]: string };

	/**
	 * The relation types of the link.
	 */
	rel: (string | HttpLinkRelType)[];

	/**
	 * Optional additional parameters for the link.
	 */
	params?: { [id: string]: string };
}
