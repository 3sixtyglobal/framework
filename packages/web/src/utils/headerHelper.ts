// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { GeneralError, Guards, Is } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";

/**
 * Class to helper with header operations.
 */
export class HeaderHelper {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<HeaderHelper>();

	/**
	 * Create a bearer token header.
	 * @param token The token to create the header for.
	 * @returns The bearer token header.
	 */
	public static createBearer(token: unknown): string {
		if (Is.stringValue(token)) {
			if (token.startsWith("Bearer ")) {
				return token;
			}
			return `Bearer ${token.trim()}`;
		}
		return "";
	}

	/**
	 * Extract the bearer token from a header.
	 * @param header The header value to extract the token from.
	 * @returns The extracted token if it exists.
	 */
	public static extractBearer(header: unknown): string {
		if (Is.stringValue(header) && header.startsWith("Bearer ")) {
			return header.slice(7, header.length).trim();
		}
		return "";
	}

	/**
	 * Extract the properties from a Link header.
	 * @param linkHeader The Link header value in format `<url>; rel="..."; param1=""; param2=""`.
	 * @returns The extracted URL, rel and optional params or undefined if invalid/missing.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link
	 */
	public static extractLinkHeader(linkHeader: unknown):
		| {
				url: string;
				urlQueryParams?: { [id: string]: string };
				rel: string;
				params?: { [id: string]: string };
		  }
		| undefined {
		if (!Is.stringValue(linkHeader)) {
			return undefined;
		}

		const parts = linkHeader.split(";");

		if (parts.length >= 2) {
			let url;
			let urlQueryParams: { [id: string]: string } | undefined;

			const urlMatch = /<([^>]+)>/.exec(parts[0]);
			if (Is.stringValue(urlMatch?.[1])) {
				url = urlMatch[1];

				const queryIndex = url.indexOf("?");
				if (queryIndex !== -1) {
					const urlParamsString = url.slice(queryIndex + 1);
					const queryParts = urlParamsString.split("&");

					for (const queryPart of queryParts) {
						const [key, value] = queryPart.split("=");
						if (Is.stringValue(key) && Is.stringValue(value)) {
							urlQueryParams ??= {};
							urlQueryParams[key] = decodeURIComponent(value);
						}
					}
				}
			}

			let rel;
			const params: { [id: string]: string } = {};

			for (let i = 1; i < parts.length; i++) {
				const relMatch = /rel="([^"]+)"/.exec(parts[i].trim());
				if (relMatch?.[1]) {
					rel = relMatch[1];
				} else {
					const paramMatch = /([^=]+)="([^"]+)"/.exec(parts[i].trim());
					if (paramMatch?.[1] && paramMatch?.[2]) {
						params[paramMatch[1]] = paramMatch[2];
					}
				}
			}

			if (Is.stringValue(url) && Is.stringValue(rel)) {
				return {
					url,
					urlQueryParams,
					rel,
					params: Object.keys(params).length > 0 ? params : undefined
				};
			}
		}

		return undefined;
	}

	/**
	 * Create a compliant Link header.
	 * @param url The URL to include in the Link header.
	 * @param urlQueryParams Optional query parameters to include in the URL.
	 * @param rel The relation type (e.g., "next", "prev", "self").
	 * @returns The formatted Link header string.
	 * @throws GeneralError if the URL or rel are invalid.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link
	 */
	public static createLinkHeader(
		url: string,
		urlQueryParams: { [id: string]: string } | undefined,
		rel: string,
		params?: { [id: string]: string }
	): string {
		Guards.stringValue(HeaderHelper.CLASS_NAME, nameof(url), url);
		Guards.stringValue(HeaderHelper.CLASS_NAME, nameof(rel), rel);

		if (url.includes(">")) {
			throw new GeneralError(HeaderHelper.CLASS_NAME, "invalidLinkHeaderURL");
		}
		if (rel.includes('"')) {
			throw new GeneralError(HeaderHelper.CLASS_NAME, "invalidLinkHeaderRel");
		}

		if (Is.objectValue(urlQueryParams)) {
			const queryParamsString = Object.entries(urlQueryParams)
				.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
				.join("&");
			const queryIndex = url.indexOf("?");
			if (queryIndex === -1) {
				url += `?${queryParamsString}`;
			} else if (queryIndex === url.length - 1) {
				url += queryParamsString;
			} else {
				url += `&${queryParamsString}`;
			}
		}

		return `<${url}>; rel="${rel}"${
			params
				? Object.entries(params)
						.map(([key, value]) => `; ${key}="${value}"`)
						.join("")
				: ""
		}`;
	}
}
