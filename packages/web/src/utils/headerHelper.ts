// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ArrayHelper, GeneralError, Guards, Is } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import type { HttpLinkRelType } from "../models/httpLinkRelType.js";
import type { IHttpLinkHeader } from "../models/IHttpLinkHeader.js";

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
	 * Extract the first occurrence of properties from a Link header for a specific relation type.
	 * @param linkHeader The Link header value in format `<url>; rel="..."; param1=""; param2=""`.
	 * @param relation The relation type to extract.
	 * @returns The extracted URL, rel and optional params or undefined if invalid/missing.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link
	 */
	public static extractLinkHeaderRelation(
		linkHeader: unknown,
		relation: HttpLinkRelType | string | RegExp
	): IHttpLinkHeader | undefined {
		const headers = HeaderHelper.extractLinkHeaders(linkHeader);
		if (Is.arrayValue(headers)) {
			return headers.find(h => HeaderHelper.matchesLinkHeaderRelation(h.rel, relation));
		}
	}

	/**
	 * Extract multiple properties from a Link header for a specific relation type.
	 * @param linkHeader The Link header value in format `<url>; rel="..."; param1=""; param2=""`.
	 * @param relation The relation type to extract.
	 * @returns The extracted URL, rel and optional params or undefined if invalid/missing.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link
	 */
	public static extractLinkHeaderRelations(
		linkHeader: unknown,
		relation: HttpLinkRelType | string | RegExp
	): IHttpLinkHeader[] | undefined {
		const headers = HeaderHelper.extractLinkHeaders(linkHeader);
		if (Is.arrayValue(headers)) {
			return headers.filter(h => HeaderHelper.matchesLinkHeaderRelation(h.rel, relation));
		}
	}

	/**
	 * Extract the link headers.
	 * @param linkHeader The Link header value in format `<url>; rel="..."; param1=""; param2=""`.
	 * @returns The extracted possible array of URL, rel and optional params or undefined if invalid/missing.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link
	 */
	public static extractLinkHeaders(linkHeader: unknown): IHttpLinkHeader[] | undefined {
		const linkHeaderArray = ArrayHelper.fromObjectOrArray<string>(linkHeader as string | string[]);
		if (Is.arrayValue<string>(linkHeaderArray)) {
			const results = [];
			for (const singleLinkHeader of linkHeaderArray) {
				const segments = HeaderHelper.extractLinkHeaderSegments(singleLinkHeader);
				results.push(
					...segments.map(l => HeaderHelper.extractLinkHeader(l)).filter(h => !Is.empty(h))
				);
			}
			return results;
		}
		return undefined;
	}

	/**
	 * Split a combined Link header value into individual link-value segments, comma separated.
	 * @param linkHeader Raw Link header string.
	 * @returns Array of individual link-value segments.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link
	 */
	public static extractLinkHeaderSegments(linkHeader: string): string[] {
		if (!Is.stringValue(linkHeader)) {
			return [];
		}
		const trimmed = linkHeader.trim();
		if (Is.empty(trimmed)) {
			return [];
		}
		return trimmed
			.split(/,(?=\s*<)/)
			.map(s => s.trim())
			.filter(s => !Is.empty(s));
	}

	/**
	 * Extract the properties from a Link header.
	 * @param linkHeader The Link header value in format `<url>; rel="..."; param1=""; param2=""`.
	 * @returns The extracted URL, rel and optional params or undefined if invalid/missing.
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link
	 */
	public static extractLinkHeader(linkHeader: string): IHttpLinkHeader | undefined {
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

			let rel: string[] | undefined;
			const params: { [id: string]: string } = {};

			for (let i = 1; i < parts.length; i++) {
				const relMatch = /rel="([^"]+)"/.exec(parts[i].trim());
				if (relMatch?.[1]) {
					rel = HeaderHelper.normalizeLinkHeaderRelations(relMatch[1]);
				} else {
					const paramMatch = /([^=]+)="([^"]+)"/.exec(parts[i].trim());
					if (paramMatch?.[1] && paramMatch?.[2]) {
						params[paramMatch[1]] = paramMatch[2];
					}
				}
			}

			if (Is.stringValue(url) && Is.arrayValue(rel)) {
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
		rel: HttpLinkRelType | HttpLinkRelType[] | string | string[],
		params?: { [id: string]: string }
	): string {
		Guards.stringValue(HeaderHelper.CLASS_NAME, nameof(url), url);

		const relationValues = Is.string(rel)
			? HeaderHelper.normalizeLinkHeaderRelations(rel)
			: ArrayHelper.fromObjectOrArray(rel);

		Guards.arrayValue(HeaderHelper.CLASS_NAME, nameof(rel), relationValues);

		if (url.includes(">")) {
			throw new GeneralError(HeaderHelper.CLASS_NAME, "invalidLinkHeaderURL");
		}

		for (let i = 0; i < relationValues.length; i++) {
			Guards.stringValue(
				HeaderHelper.CLASS_NAME,
				`${nameof(rel)}.${i.toString()}`,
				relationValues[i]
			);
			if (relationValues[i].includes('"') || relationValues[i].includes(" ")) {
				throw new GeneralError(HeaderHelper.CLASS_NAME, "invalidLinkHeaderRel");
			}
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

		return `<${url}>; rel="${relationValues.join(" ")}"${
			params
				? Object.entries(params)
						.map(([key, value]) => `; ${key}="${value}"`)
						.join("")
				: ""
		}`;
	}

	/**
	 * Does the relation selector match any of the link header relations.
	 * @param relations The relations from the header.
	 * @param relation The relation selector to test.
	 * @returns True if the selector matches any relation.
	 * @internal
	 */
	private static matchesLinkHeaderRelation(
		relations: (HttpLinkRelType | string)[],
		relation: HttpLinkRelType | string | RegExp
	): boolean {
		if (Is.string(relation)) {
			return relations.includes(relation);
		}

		return relations.some(relValue => relation.test(relValue));
	}

	/**
	 * Normalize a relation string into tokens.
	 * @param relation The relation string.
	 * @returns The relation tokens.
	 * @internal
	 */
	private static normalizeLinkHeaderRelations(relation: string): HttpLinkRelType[] {
		return relation
			.split(/\s+/)
			.map(relValue => relValue.trim())
			.filter(relValue => !Is.empty(relValue)) as HttpLinkRelType[];
	}
}
