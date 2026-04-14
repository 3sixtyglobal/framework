// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ArrayHelper, GeneralError, Guards, Is } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import { HeaderTypes } from "../models/headerTypes.js";
import type { HttpLinkRelType } from "../models/httpLinkRelType.js";
import type { IHttpHeaders } from "../models/IHttpHeaders.js";
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
	 * Regex for valid correlation ID (alphanumeric, dash, underscore).
	 * Examples: `request_123`, `trace-id-456`, `ABC_789`.
	 * @internal
	 */
	private static readonly _CORRELATION_ID_REGEX = /^[\w-]+$/;

	/**
	 * Regex for valid Accept-Language tags and wildcard values.
	 * Supports wildcard entries and common BCP 47 style tags.
	 * Examples: `*`, `en`, `en-GB`, `es-419`, `zh-Hant`, `zh-Hant-TW`.
	 * @internal
	 */
	private static readonly _ACCEPT_LANGUAGE_TAG_REGEX = /^(\*|[A-Za-z]{1,8}(?:-[\dA-Za-z]{1,8})*)$/;

	/**
	 * Regex for valid Accept-Language quality parameters.
	 * Supports quality values from `0` to `1` with up to three decimal places.
	 * Examples: `q=1`, `q=0.9`, `q=0.875`, `q=0`, `q=1.0`.
	 * @internal
	 */
	private static readonly _ACCEPT_LANGUAGE_QUALITY_REGEX = /^q=(0(?:\.\d{1,3})?|1(?:\.0{1,3})?)$/i;

	/**
	 * Regex for valid IPv4 addresses.
	 * Examples: `127.0.0.1`, `192.168.1.10`, `255.255.255.255`.
	 * @internal
	 */
	private static readonly _IP_V4_REGEX =
		/^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

	/**
	 * Regex for valid IPv6 addresses.
	 * Examples: `2001:0db8:85a3:0000:0000:8a2e:0370:7334`, `2001:db8::`, `::1`.
	 * @internal
	 */
	private static readonly _IP_V6_REGEX =
		/^((?:[\dA-Fa-f]{1,4}:){7}[\dA-Fa-f]{1,4}|(?:[\dA-Fa-f]{1,4}:){1,7}:|:(?::[\dA-Fa-f]{1,4}){1,7})$/;

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
	 * Extract parsed language preferences from the Accept-Language header.
	 * @param headers The HTTP request headers.
	 * @returns The parsed language preferences ordered by highest quality first, or undefined if missing or invalid.
	 */
	public static extractAcceptLanguage(
		headers?: IHttpHeaders
	): { language: string; quality: number }[] | undefined {
		return HeaderHelper.parseAcceptLanguage(headers?.[HeaderTypes.AcceptLanguage]);
	}

	/**
	 * Parse one or more Accept-Language header values into language preferences.
	 * @param acceptLanguage The Accept-Language header value or values.
	 * @returns The parsed language preferences ordered by highest quality first, or undefined if missing or if any entry is invalid.
	 */
	public static parseAcceptLanguage(
		acceptLanguage: string | string[] | undefined
	): { language: string; quality: number }[] | undefined {
		let headerValues: string[] = [];

		if (Is.array(acceptLanguage)) {
			headerValues = acceptLanguage
				.map(headerValue => headerValue.trim())
				.filter(headerValue => headerValue.length > 0);
		} else if (Is.stringValue(acceptLanguage)) {
			headerValues = [acceptLanguage.trim()];
		}

		if (headerValues.length > 0) {
			const entries = headerValues
				.flatMap(headerValue => headerValue.split(","))
				.map(segment => segment.trim())
				.filter(segment => segment.length > 0);

			const parsedEntries: { language: string; quality: number }[] = [];

			for (const entry of entries) {
				const [languagePart, ...parameterParts] = entry.split(";").map(part => part.trim());

				if (!HeaderHelper._ACCEPT_LANGUAGE_TAG_REGEX.test(languagePart)) {
					return undefined;
				}

				let quality = 1;

				for (const parameterPart of parameterParts) {
					if (parameterPart.length > 0) {
						if (parameterPart.startsWith("q=") || parameterPart.startsWith("Q=")) {
							const qualityMatch = HeaderHelper._ACCEPT_LANGUAGE_QUALITY_REGEX.exec(parameterPart);
							if (!qualityMatch?.[1]) {
								return undefined;
							}

							quality = Number(qualityMatch[1]);
						}
					}
				}

				parsedEntries.push({
					language: languagePart,
					quality
				});
			}

			if (parsedEntries.length > 0) {
				return parsedEntries.sort((a, b) => b.quality - a.quality);
			}
		}
	}

	/**
	 * Extract client IP addresses from HTTP request headers.
	 * Checks all `X-Forwarded-For` and `X-Real-IP` header values for proxied requests.
	 * @param headers The HTTP request headers.
	 * @returns The extracted client IP addresses in header order.
	 */
	public static extractClientIps(headers?: IHttpHeaders): string[] {
		const ips: string[] = [];

		const forwardedForValues = HeaderHelper.getHeaderValues(headers?.["x-forwarded-for"]);
		for (const forwardedFor of forwardedForValues) {
			const forwardedIps = forwardedFor
				.split(",")
				.map(ip => ip.trim())
				.filter(ip => HeaderHelper.isIpAddress(ip));

			ips.push(...forwardedIps);
		}

		const realIpValues = HeaderHelper.getHeaderValues(headers?.["x-real-ip"]);
		for (const realIp of realIpValues) {
			if (HeaderHelper.isIpAddress(realIp)) {
				ips.push(realIp);
			}
		}

		return ips;
	}

	/**
	 * Extract the User-Agent header from the HTTP request context.
	 * @param headers The HTTP request headers.
	 * @param maxLength Optional maximum length for the User-Agent string to prevent excessively long values.
	 * @returns The user agent string or undefined if not available.
	 */
	public static extractUserAgent(headers?: IHttpHeaders, maxLength?: number): string | undefined {
		const headerValues = HeaderHelper.getHeaderValues(headers?.[HeaderTypes.UserAgent]);
		for (const headerValue of headerValues) {
			return Is.integer(maxLength) ? headerValue.slice(0, maxLength) : headerValue;
		}
	}

	/**
	 * Extract a correlation ID for request tracing from the X-Correlation-ID header.
	 * @param headers The HTTP request headers.
	 * @param maxLength Optional maximum length for the extracted correlation ID.
	 * @returns The correlation ID, or undefined if the header is missing or invalid.
	 */
	public static extractCorrelationId(
		headers?: IHttpHeaders,
		maxLength?: number
	): string | undefined {
		const headerValues = HeaderHelper.getHeaderValues(headers?.["x-correlation-id"]);
		for (const headerValue of headerValues) {
			if (HeaderHelper._CORRELATION_ID_REGEX.test(headerValue)) {
				return Is.integer(maxLength) ? headerValue.slice(0, maxLength) : headerValue;
			}
		}
	}

	/**
	 * Validate if a string is a valid IP address (IPv4 or IPv6).
	 * @param ip The IP address to validate.
	 * @returns True if valid, false otherwise.
	 */
	public static isIpAddress(ip: string): boolean {
		if (!Is.stringValue(ip)) {
			return false;
		}
		return HeaderHelper.isIpAddressV4(ip) || HeaderHelper.isIpAddressV6(ip);
	}

	/**
	 * Validate if a string is a valid IP address IPv4.
	 * @param ip The IP address to validate.
	 * @returns True if valid, false otherwise.
	 */
	public static isIpAddressV4(ip: string): boolean {
		if (!Is.stringValue(ip)) {
			return false;
		}
		return HeaderHelper._IP_V4_REGEX.test(ip);
	}

	/**
	 * Validate if a string is a valid IP address IPv6.
	 * @param ip The IP address to validate.
	 * @returns True if valid, false otherwise.
	 */
	public static isIpAddressV6(ip: string): boolean {
		if (!Is.stringValue(ip)) {
			return false;
		}
		return HeaderHelper._IP_V6_REGEX.test(ip);
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

	/**
	 * Get all non-empty values from a header that may be a string or string array.
	 * @param header The header value (string, string array, or undefined).
	 * @returns The trimmed non-empty string values.
	 * @internal
	 */
	private static getHeaderValues(header: string | string[] | undefined): string[] {
		let headerValues: string[] = [];

		if (Is.array(header)) {
			headerValues = header;
		} else if (Is.stringValue(header)) {
			headerValues = [header];
		}

		return headerValues
			.map(headerValue => headerValue.trim())
			.filter(headerValue => headerValue.length > 0);
	}
}
