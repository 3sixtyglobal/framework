// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HeaderHelper } from "../../src/utils/headerHelper.js";

describe("HeaderHelper", () => {
	test("can create a bearer header from a token", async () => {
		const header = HeaderHelper.createBearer("my-token");
		expect(header).toEqual("Bearer my-token");
	});

	test("can create a bearer header from a token with whitespace", async () => {
		const header = HeaderHelper.createBearer("my-token ");
		expect(header).toEqual("Bearer my-token");
	});

	test("can create a bearer header from an existing bearer token", async () => {
		const header = HeaderHelper.createBearer("Bearer my-token");
		expect(header).toEqual("Bearer my-token");
	});

	test("can create an empty bearer header from an empty token", async () => {
		const header = HeaderHelper.createBearer("");
		expect(header).toEqual("");
	});

	test("can create an empty bearer header from an undefined token", async () => {
		const header = HeaderHelper.createBearer(undefined);
		expect(header).toEqual("");
	});

	test("can extract the bearer from a valid header", async () => {
		const token = HeaderHelper.extractBearer("Bearer my-token");
		expect(token).toEqual("my-token");
	});

	test("can fail to extract the bearer from an undefined header", async () => {
		const token = HeaderHelper.extractBearer(undefined);
		expect(token).toEqual("");
	});

	test("can fail to extract the bearer from an empty header", async () => {
		const token = HeaderHelper.extractBearer("");
		expect(token).toEqual("");
	});

	test("can fail to extract the bearer from an invalid header", async () => {
		const token = HeaderHelper.extractBearer("bearer my-token");
		expect(token).toEqual("");
	});

	test("can parse accept-language header entries with quality values", async () => {
		const locale = HeaderHelper.parseAcceptLanguage("fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5");

		expect(locale).toEqual([
			{ language: "fr-CH", quality: 1 },
			{ language: "fr", quality: 0.9 },
			{ language: "en", quality: 0.8 },
			{ language: "de", quality: 0.7 },
			{ language: "*", quality: 0.5 }
		]);
	});

	test("can order parsed accept-language entries by highest quality first", async () => {
		const locale = HeaderHelper.parseAcceptLanguage("de;q=0.7, fr-CH, *;q=0.5, en;q=0.8, fr;q=0.9");

		expect(locale).toEqual([
			{ language: "fr-CH", quality: 1 },
			{ language: "fr", quality: 0.9 },
			{ language: "en", quality: 0.8 },
			{ language: "de", quality: 0.7 },
			{ language: "*", quality: 0.5 }
		]);
	});

	test("can parse a simple language code from an accept-language header", async () => {
		const locale = HeaderHelper.parseAcceptLanguage("fr");

		expect(locale).toEqual([{ language: "fr", quality: 1 }]);
	});

	test("can parse multiple accept-language header values", async () => {
		const locale = HeaderHelper.parseAcceptLanguage([
			"de;q=0.7, fr-CH",
			"*;q=0.5, en;q=0.8, fr;q=0.9"
		]);

		expect(locale).toEqual([
			{ language: "fr-CH", quality: 1 },
			{ language: "fr", quality: 0.9 },
			{ language: "en", quality: 0.8 },
			{ language: "de", quality: 0.7 },
			{ language: "*", quality: 0.5 }
		]);
	});

	test("can parse common accept-language tags with script and numeric region subtags", async () => {
		const locale = HeaderHelper.parseAcceptLanguage("zh-Hant-TW, es-419;q=0.9, en;q=0.8");

		expect(locale).toEqual([
			{ language: "zh-Hant-TW", quality: 1 },
			{ language: "es-419", quality: 0.9 },
			{ language: "en", quality: 0.8 }
		]);
	});

	test("can ignore unknown accept-language parameters while still parsing q values", async () => {
		const locale = HeaderHelper.parseAcceptLanguage(
			"en-GB;foo=bar;baz=qux, fr;q=0.9;test=value, de;custom=true"
		);

		expect(locale).toEqual([
			{ language: "en-GB", quality: 1 },
			{ language: "de", quality: 1 },
			{ language: "fr", quality: 0.9 }
		]);
	});

	test("returns undefined for an invalid accept-language header", async () => {
		const locale = HeaderHelper.parseAcceptLanguage("123-invalid");

		expect(locale).toBeUndefined();
	});

	test("returns undefined when any accept-language entry is invalid", async () => {
		const locale = HeaderHelper.parseAcceptLanguage("en-US, ***;q=0.5");

		expect(locale).toBeUndefined();
	});

	test("returns undefined for an empty accept-language header", async () => {
		const locale = HeaderHelper.parseAcceptLanguage(undefined);

		expect(locale).toBeUndefined();
	});

	test("can extract parsed languages from request headers", async () => {
		const locale = HeaderHelper.extractAcceptLanguage({
			"accept-language": "de-CH,de;q=0.9,en;q=0.8"
		});

		expect(locale).toEqual([
			{ language: "de-CH", quality: 1 },
			{ language: "de", quality: 0.9 },
			{ language: "en", quality: 0.8 }
		]);
	});

	test("can extract parsed languages from all accept-language header values", async () => {
		const locale = HeaderHelper.extractAcceptLanguage({
			"accept-language": ["es-MX,es;q=0.9", "en-GB,en;q=0.8"]
		});

		expect(locale).toEqual([
			{ language: "es-MX", quality: 1 },
			{ language: "en-GB", quality: 1 },
			{ language: "es", quality: 0.9 },
			{ language: "en", quality: 0.8 }
		]);
	});

	test("returns undefined when the request locale header is invalid", async () => {
		const locale = HeaderHelper.extractAcceptLanguage({
			"accept-language": "***"
		});

		expect(locale).toBeUndefined();
	});

	test("can parse a weighted header with a custom validator and return value, quality and params", async () => {
		const result = HeaderHelper.parseWeightedHeader("foo;q=0.8;ext=bar", /^foo$/);

		expect(result).toEqual([{ value: "foo", quality: 0.8, params: { ext: "bar" } }]);
	});

	test("can parse multiple weighted header entries and order by quality", async () => {
		const result = HeaderHelper.parseWeightedHeader("b;q=0.5, a, c;q=0.9", /^[a-z]$/);

		expect(result).toEqual([
			{ value: "a", quality: 1, params: {} },
			{ value: "c", quality: 0.9, params: {} },
			{ value: "b", quality: 0.5, params: {} }
		]);
	});

	test("can parse a weighted header array and merge all entries", async () => {
		const result = HeaderHelper.parseWeightedHeader(["a;q=0.8", "b;q=0.9"], /^[a-z]$/);

		expect(result).toEqual([
			{ value: "b", quality: 0.9, params: {} },
			{ value: "a", quality: 0.8, params: {} }
		]);
	});

	test("can parse multiple params from a weighted header entry", async () => {
		const result = HeaderHelper.parseWeightedHeader("foo;charset=UTF-8;boundary=edge", /^foo$/);

		expect(result).toEqual([
			{ value: "foo", quality: 1, params: { charset: "UTF-8", boundary: "edge" } }
		]);
	});

	test("returns undefined from a weighted header when the value fails the validator", async () => {
		const result = HeaderHelper.parseWeightedHeader("invalid", /^foo$/);

		expect(result).toBeUndefined();
	});

	test("returns undefined from a weighted header when any entry fails the validator", async () => {
		const result = HeaderHelper.parseWeightedHeader("foo, bar", /^foo$/);

		expect(result).toBeUndefined();
	});

	test("returns undefined from a weighted header when the quality value is out of range", async () => {
		const result = HeaderHelper.parseWeightedHeader("foo;q=1.5", /^foo$/);

		expect(result).toBeUndefined();
	});

	test("returns undefined from a weighted header for undefined input", async () => {
		const result = HeaderHelper.parseWeightedHeader(undefined, /^foo$/);

		expect(result).toBeUndefined();
	});

	test("can validate a valid IPv4 address", async () => {
		const isValid = HeaderHelper.isIpAddressV4("127.0.0.1");
		expect(isValid).toBe(true);
	});

	test("can reject an invalid IPv4 address", async () => {
		const isValid = HeaderHelper.isIpAddressV4("256.0.0.1");
		expect(isValid).toBe(false);
	});

	test("can validate a valid IPv6 address", async () => {
		const isValid = HeaderHelper.isIpAddressV6("2001:0db8:85a3:0000:0000:8a2e:0370:7334");
		expect(isValid).toBe(true);
	});

	test("can reject an invalid IPv6 address", async () => {
		const isValid = HeaderHelper.isIpAddressV6("2001:0db8:85a3:0000:0000:8a2e:0370:zzzz");
		expect(isValid).toBe(false);
	});

	test("can validate IPv4 and IPv6 addresses using isIpAddress", async () => {
		expect(HeaderHelper.isIpAddress("192.168.1.10")).toBe(true);
		expect(HeaderHelper.isIpAddress("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toBe(true);
		expect(HeaderHelper.isIpAddress("not-an-ip")).toBe(false);
	});

	test("can extract all valid client IPs from x-forwarded-for", async () => {
		const clientIp = HeaderHelper.extractClientIps({
			"x-forwarded-for": "203.0.113.10, 198.51.100.2",
			"x-real-ip": "198.51.100.20"
		});

		expect(clientIp).toEqual(["203.0.113.10", "198.51.100.2", "198.51.100.20"]);
	});

	test("can fall back to x-real-ip when x-forwarded-for is invalid", async () => {
		const clientIp = HeaderHelper.extractClientIps({
			"x-forwarded-for": "unknown, 198.51.100.2",
			"x-real-ip": ["198.51.100.20"]
		});

		expect(clientIp).toEqual(["198.51.100.2", "198.51.100.20"]);
	});

	test("can extract all valid client IPs across multiple forwarded-for header values", async () => {
		const clientIp = HeaderHelper.extractClientIps({
			"x-forwarded-for": ["unknown", "203.0.113.10, 198.51.100.2"],
			"x-real-ip": "198.51.100.20"
		});

		expect(clientIp).toEqual(["203.0.113.10", "198.51.100.2", "198.51.100.20"]);
	});

	test("returns an empty array when no valid client IP headers are present", async () => {
		const clientIp = HeaderHelper.extractClientIps({
			"x-forwarded-for": "unknown",
			"x-real-ip": "also-invalid"
		});

		expect(clientIp).toEqual([]);
	});

	test("can extract a user agent header", async () => {
		const userAgent = HeaderHelper.extractUserAgent({
			"user-agent": "Mozilla/5.0"
		});

		expect(userAgent).toBe("Mozilla/5.0");
	});

	test("can truncate a user agent header to the provided maximum length", async () => {
		const userAgent = HeaderHelper.extractUserAgent(
			{
				"user-agent": "a".repeat(600)
			},
			512
		);

		expect(userAgent).toBe("a".repeat(512));
	});

	test("can return the full user agent header when no maximum length is provided", async () => {
		const userAgent = HeaderHelper.extractUserAgent({
			"user-agent": "a".repeat(600)
		});

		expect(userAgent).toBe("a".repeat(600));
	});

	test("can extract the first non-empty user agent from multiple header values", async () => {
		const userAgent = HeaderHelper.extractUserAgent({
			"user-agent": ["   ", "Mozilla/5.0"]
		});

		expect(userAgent).toBe("Mozilla/5.0");
	});

	test("returns undefined when the user agent header is missing", async () => {
		const userAgent = HeaderHelper.extractUserAgent({});
		expect(userAgent).toBeUndefined();
	});

	test("can extract a valid correlation ID", async () => {
		const correlationId = HeaderHelper.extractCorrelationId({
			"x-correlation-id": "request_123-abc"
		});

		expect(correlationId).toBe("request_123-abc");
	});

	test("can extract a correlation ID from the first header value", async () => {
		const correlationId = HeaderHelper.extractCorrelationId({
			"x-correlation-id": ["trace-001", "trace-002"]
		});

		expect(correlationId).toBe("trace-001");
	});

	test("returns undefined for an invalid correlation ID", async () => {
		const correlationId = HeaderHelper.extractCorrelationId({
			"x-correlation-id": "trace id"
		});

		expect(correlationId).toBeUndefined();
	});

	test("returns undefined when the correlation ID header is missing", async () => {
		const correlationId = HeaderHelper.extractCorrelationId({});

		expect(correlationId).toBeUndefined();
	});

	test("can extract the first valid correlation ID from multiple header values", async () => {
		const correlationId = HeaderHelper.extractCorrelationId({
			"x-correlation-id": ["trace id", "trace-002"]
		});

		expect(correlationId).toBe("trace-002");
	});

	test("can truncate a correlation ID to the provided maximum length", async () => {
		const correlationId = HeaderHelper.extractCorrelationId(
			{
				"x-correlation-id": "a".repeat(65)
			},
			64
		);

		expect(correlationId).toBe("a".repeat(64));
	});

	test("can return the full correlation ID when no maximum length is provided", async () => {
		const correlationId = HeaderHelper.extractCorrelationId({
			"x-correlation-id": "a".repeat(65)
		});

		expect(correlationId).toBe("a".repeat(65));
	});
	test("can extract URL from a valid Link header", async () => {
		const url = HeaderHelper.extractLinkHeader(
			'<https://example.com/api?cursor=abc123>; rel="next"'
		);
		expect(url).toEqual({
			url: "https://example.com/api?cursor=abc123",
			urlQueryParams: {
				cursor: "abc123"
			},
			rel: ["next"]
		});
	});

	test("can extract URL from a Link header with different rel", async () => {
		const url = HeaderHelper.extractLinkHeader('<https://example.com/prev>; rel="prev"');
		expect(url).toEqual({ url: "https://example.com/prev", rel: ["prev"] });
	});

	test("can extract URL, rel and params from a Link header", async () => {
		const link = HeaderHelper.extractLinkHeader(
			'</terms>; rel="copyright"; anchor="#foo"; title="Example Title"'
		);
		expect(link).toEqual({
			url: "/terms",
			rel: ["copyright"],
			params: {
				anchor: "#foo",
				title: "Example Title"
			}
		});
	});

	test("can extract URL from a Link header with rel as URL", async () => {
		const link = HeaderHelper.extractLinkHeader('</>; rel="http://example.net/foo"');
		expect(link).toEqual({ url: "/", rel: ["http://example.net/foo"] });
	});

	test("can extract URL from a Link header with start rel", async () => {
		const link = HeaderHelper.extractLinkHeader('<https://example.org/>; rel="start"');
		expect(link).toEqual({ url: "https://example.org/", rel: ["start"] });
	});

	test("can extract URL from a Link header with index rel", async () => {
		const link = HeaderHelper.extractLinkHeader('<https://example.org/index>; rel="index"');
		expect(link).toEqual({ url: "https://example.org/index", rel: ["index"] });
	});

	test("can extract multiple relations from a Link header", async () => {
		const link = HeaderHelper.extractLinkHeader('<https://example.org/index>; rel="next prev"');
		expect(link).toEqual({ url: "https://example.org/index", rel: ["next", "prev"] });
	});

	test("returns undefined from a Link header without rel", async () => {
		const url = HeaderHelper.extractLinkHeader("<https://example.com/resource>");
		expect(url).toBeUndefined();
	});

	test("returns undefined for undefined Link header", async () => {
		const url = HeaderHelper.extractLinkHeader(undefined as unknown as string);
		expect(url).toBeUndefined();
	});

	test("returns undefined for empty Link header", async () => {
		const url = HeaderHelper.extractLinkHeader("");
		expect(url).toBeUndefined();
	});

	test("returns undefined for invalid Link header format", async () => {
		const url = HeaderHelper.extractLinkHeader("https://example.com/no-brackets");
		expect(url).toBeUndefined();
	});

	test("returns undefined for non-string Link header", async () => {
		const url = HeaderHelper.extractLinkHeader({
			header: '<https://example.com>; rel="next"'
		} as unknown as string);
		expect(url).toBeUndefined();
	});

	test("can extract link when rel appears after other params", async () => {
		const link = HeaderHelper.extractLinkHeader(
			'<https://example.com/resource>; title="Example Title"; rel="next"'
		);
		expect(link).toEqual({
			url: "https://example.com/resource",
			rel: ["next"],
			params: {
				title: "Example Title"
			}
		});
	});

	test("can extract link with whitespace around segments", async () => {
		const link = HeaderHelper.extractLinkHeader(
			' <https://example.com/api?cursor=abc123> ;  rel="next"  ;  anchor="#foo" '
		);
		expect(link).toEqual({
			url: "https://example.com/api?cursor=abc123",
			urlQueryParams: {
				cursor: "abc123"
			},
			rel: ["next"],
			params: {
				anchor: "#foo"
			}
		});
	});

	test("returns undefined when link header does not contain a bracketed URL", async () => {
		const link = HeaderHelper.extractLinkHeader('https://example.com/resource; rel="next"');
		expect(link).toBeUndefined();
	});

	test("uses the last rel if multiple rel segments are present", async () => {
		const link = HeaderHelper.extractLinkHeader(
			'<https://example.com/resource>; rel="next"; rel="prev"'
		);
		expect(link).toEqual({ url: "https://example.com/resource", rel: ["prev"] });
	});

	test("can extract link headers from a valid Link header string", async () => {
		const headers = HeaderHelper.extractLinkHeaders(
			'<https://example.com/api?cursor=abc123>; rel="next"; title="Example"'
		);
		expect(headers).toEqual([
			{
				url: "https://example.com/api?cursor=abc123",
				urlQueryParams: {
					cursor: "abc123"
				},
				rel: ["next"],
				params: {
					title: "Example"
				}
			}
		]);
	});

	test("can extract link headers from a comma separated Link header string", async () => {
		const headers = HeaderHelper.extractLinkHeaders(
			'<https://api.example.com/issues?page=2>; rel="prev", <https://api.example.com/issues?page=4>; rel="next", <https://api.example.com/issues?page=10>; rel="last", <https://api.example.com/issues?page=1>; rel="first"'
		);

		expect(headers).toEqual([
			{
				url: "https://api.example.com/issues?page=2",
				urlQueryParams: {
					page: "2"
				},
				rel: ["prev"]
			},
			{
				url: "https://api.example.com/issues?page=4",
				urlQueryParams: {
					page: "4"
				},
				rel: ["next"]
			},
			{
				url: "https://api.example.com/issues?page=10",
				urlQueryParams: {
					page: "10"
				},
				rel: ["last"]
			},
			{
				url: "https://api.example.com/issues?page=1",
				urlQueryParams: {
					page: "1"
				},
				rel: ["first"]
			}
		]);
	});

	test("can extract link headers from an array containing comma separated Link header strings", async () => {
		const headers = HeaderHelper.extractLinkHeaders([
			'<https://api.example.com/issues?page=2>; rel="prev", <https://api.example.com/issues?page=4>; rel="next"',
			'<https://api.example.com/issues?page=10>; rel="last", <https://api.example.com/issues?page=1>; rel="first"'
		]);

		expect(headers).toEqual([
			{
				url: "https://api.example.com/issues?page=2",
				urlQueryParams: {
					page: "2"
				},
				rel: ["prev"]
			},
			{
				url: "https://api.example.com/issues?page=4",
				urlQueryParams: {
					page: "4"
				},
				rel: ["next"]
			},
			{
				url: "https://api.example.com/issues?page=10",
				urlQueryParams: {
					page: "10"
				},
				rel: ["last"]
			},
			{
				url: "https://api.example.com/issues?page=1",
				urlQueryParams: {
					page: "1"
				},
				rel: ["first"]
			}
		]);
	});

	test("returns an empty array for an invalid Link header string", async () => {
		const headers = HeaderHelper.extractLinkHeaders("https://example.com/no-brackets");
		expect(headers).toEqual([]);
	});

	test("returns undefined for extractLinkHeaders when input is undefined", async () => {
		const headers = HeaderHelper.extractLinkHeaders(undefined);
		expect(headers).toBeUndefined();
	});

	test("can extract link headers from an array and skip invalid entries", async () => {
		const headers = HeaderHelper.extractLinkHeaders([
			'<https://example.com/api?cursor=abc123>; rel="next"',
			"https://example.com/no-brackets",
			'<https://example.com/api?page=2>; rel="prev"'
		]);

		expect(headers).toEqual([
			{
				url: "https://example.com/api?cursor=abc123",
				urlQueryParams: {
					cursor: "abc123"
				},
				rel: ["next"]
			},
			{
				url: "https://example.com/api?page=2",
				urlQueryParams: {
					page: "2"
				},
				rel: ["prev"]
			}
		]);
	});

	test("can extract a specific relation from a Link header string", async () => {
		const header = '<https://example.com/api?cursor=abc123>; rel="next"';
		const next = HeaderHelper.extractLinkHeaderRelation(header, "next");
		expect(next).toEqual({
			url: "https://example.com/api?cursor=abc123",
			urlQueryParams: {
				cursor: "abc123"
			},
			rel: ["next"]
		});
	});

	test("can extract a specific relation from an array of Link headers", async () => {
		const header = HeaderHelper.extractLinkHeaderRelation(
			[
				'<https://example.com/api?cursor=abc123>; rel="next"',
				'<https://example.com/api?page=2>; rel="prev"'
			],
			"prev"
		);

		expect(header).toEqual({
			url: "https://example.com/api?page=2",
			urlQueryParams: {
				page: "2"
			},
			rel: ["prev"]
		});
	});

	test("can extract a specific relation from a header with multiple relations", async () => {
		const header = HeaderHelper.extractLinkHeaderRelation(
			'<https://example.com/api?page=2>; rel="next prev"',
			"prev"
		);

		expect(header).toEqual({
			url: "https://example.com/api?page=2",
			urlQueryParams: {
				page: "2"
			},
			rel: ["next", "prev"]
		});
	});

	test("can extract matching relations from a comma separated Link header string", async () => {
		const headers = HeaderHelper.extractLinkHeaderRelations(
			'<https://api.example.com/issues?page=2>; rel="prev", <https://api.example.com/issues?page=4>; rel="next", <https://api.example.com/issues?page=10>; rel="last", <https://api.example.com/issues?page=1>; rel="first"',
			"next"
		);

		expect(headers).toEqual([
			{
				url: "https://api.example.com/issues?page=4",
				urlQueryParams: {
					page: "4"
				},
				rel: ["next"]
			}
		]);
	});

	test("can extract matching relations with a regex from a comma separated Link header string", async () => {
		const headers = HeaderHelper.extractLinkHeaderRelations(
			'<https://api.example.com/issues?page=2>; rel="prev", <https://api.example.com/issues?page=4>; rel="next", <https://api.example.com/issues?page=10>; rel="last", <https://api.example.com/issues?page=1>; rel="first"',
			/^(first|last)$/
		);

		expect(headers).toEqual([
			{
				url: "https://api.example.com/issues?page=10",
				urlQueryParams: {
					page: "10"
				},
				rel: ["last"]
			},
			{
				url: "https://api.example.com/issues?page=1",
				urlQueryParams: {
					page: "1"
				},
				rel: ["first"]
			}
		]);
	});

	test("returns undefined when extractLinkHeaderRelation can't find the relation", async () => {
		const header = HeaderHelper.extractLinkHeaderRelation(
			'<https://example.com/api?cursor=abc123>; rel="next"',
			"prev"
		);
		expect(header).toBeUndefined();
	});

	test("returns undefined when extractLinkHeaderRelation input is invalid", async () => {
		// @ts-expect-error - testing invalid input
		const header = HeaderHelper.extractLinkHeaderRelation({}, "next");
		expect(header).toBeUndefined();
	});

	test("can create a Link header with next rel", async () => {
		const header = HeaderHelper.createLinkHeader(
			"https://example.com/api",
			{ cursor: "abc123" },
			"next"
		);
		expect(header).toEqual('<https://example.com/api?cursor=abc123>; rel="next"');
	});

	test("can create a Link header when url already ends with ?", async () => {
		const header = HeaderHelper.createLinkHeader(
			"https://example.com/api?",
			{ cursor: "abc123" },
			"next"
		);
		expect(header).toEqual('<https://example.com/api?cursor=abc123>; rel="next"');
	});

	test("can create a Link header when url already contains query params", async () => {
		const header = HeaderHelper.createLinkHeader(
			"https://example.com/api?existing=1",
			{ cursor: "abc123" },
			"next"
		);
		expect(header).toEqual('<https://example.com/api?existing=1&cursor=abc123>; rel="next"');
	});

	test("can create a Link header with prev rel", async () => {
		const header = HeaderHelper.createLinkHeader("https://example.com/api", { page: "1" }, "prev");
		expect(header).toEqual('<https://example.com/api?page=1>; rel="prev"');
	});

	test("can create a Link header with multiple relations from an array", async () => {
		const header = HeaderHelper.createLinkHeader("https://example.com/api", { page: "1" }, [
			"next",
			"prev"
		]);
		expect(header).toEqual('<https://example.com/api?page=1>; rel="next prev"');
	});

	test("can create a Link header with multiple relations from a string", async () => {
		const header = HeaderHelper.createLinkHeader(
			"https://example.com/api",
			{ page: "1" },
			"next prev"
		);
		expect(header).toEqual('<https://example.com/api?page=1>; rel="next prev"');
	});

	test("can create a Link header with self rel", async () => {
		const header = HeaderHelper.createLinkHeader("https://example.com/resource", undefined, "self");
		expect(header).toEqual('<https://example.com/resource>; rel="self"');
	});

	test("can create a Link header with additional params", async () => {
		const header = HeaderHelper.createLinkHeader(
			"https://example.com/resource",
			undefined,
			"self",
			{
				anchor: "#foo",
				title: "Example Title"
			}
		);
		expect(header).toEqual(
			'<https://example.com/resource>; rel="self"; anchor="#foo"; title="Example Title"'
		);
	});

	test("throws error when creating Link header with undefined url", async () => {
		expect(() =>
			HeaderHelper.createLinkHeader(undefined as unknown as string, undefined, "next")
		).toThrow("guard.string");
	});

	test("throws error when creating Link header with empty url", async () => {
		expect(() => HeaderHelper.createLinkHeader("", undefined, "next")).toThrow("guard.stringEmpty");
	});

	test("throws error when creating Link header with url containing >", async () => {
		expect(() =>
			HeaderHelper.createLinkHeader("https://example.com/api>", { cursor: "abc123" }, "next")
		).toThrow("headerHelper.invalidLinkHeaderURL");
	});

	test("throws error when creating Link header with undefined rel", async () => {
		expect(() =>
			HeaderHelper.createLinkHeader(
				"https://example.com",
				undefined,
				undefined as unknown as string
			)
		).toThrow("guard.array");
	});

	test("throws error when creating Link header with empty rel", async () => {
		expect(() => HeaderHelper.createLinkHeader("https://example.com", undefined, "")).toThrow(
			"guard.stringEmpty"
		);
	});

	test('throws error when creating Link header with rel containing "', async () => {
		expect(() => HeaderHelper.createLinkHeader("https://example.com", undefined, 'n"ext')).toThrow(
			"headerHelper.invalidLinkHeaderRel"
		);
	});

	test("throws error when creating Link header with rel array entry containing spaces", async () => {
		expect(() =>
			HeaderHelper.createLinkHeader("https://example.com", undefined, ["next prev"])
		).toThrow("headerHelper.invalidLinkHeaderRel");
	});

	test("can parse accept header entries with quality values", async () => {
		const result = HeaderHelper.parseAccept(
			"text/html, application/xhtml+xml, application/xml;q=0.9, image/webp, */*;q=0.8"
		);

		expect(result).toEqual([
			{ mimeType: "text/html", quality: 1 },
			{ mimeType: "application/xhtml+xml", quality: 1 },
			{ mimeType: "image/webp", quality: 1 },
			{ mimeType: "application/xml", quality: 0.9 },
			{ mimeType: "*/*", quality: 0.8 }
		]);
	});

	test("can order parsed accept entries by highest quality first", async () => {
		const result = HeaderHelper.parseAccept(
			"application/xml;q=0.9, text/html, */*;q=0.8, image/webp"
		);

		expect(result).toEqual([
			{ mimeType: "text/html", quality: 1 },
			{ mimeType: "image/webp", quality: 1 },
			{ mimeType: "application/xml", quality: 0.9 },
			{ mimeType: "*/*", quality: 0.8 }
		]);
	});

	test("can parse a single media type from an accept header", async () => {
		const result = HeaderHelper.parseAccept("application/json");

		expect(result).toEqual([{ mimeType: "application/json", quality: 1 }]);
	});

	test("can parse a wildcard subtype from an accept header", async () => {
		const result = HeaderHelper.parseAccept("image/*");

		expect(result).toEqual([{ mimeType: "image/*", quality: 1 }]);
	});

	test("can parse a vendor extension media type from an accept header", async () => {
		const result = HeaderHelper.parseAccept("application/vnd.api+json");

		expect(result).toEqual([{ mimeType: "application/vnd.api+json", quality: 1 }]);
	});

	test("can parse accept header media type parameters and preserve them in params", async () => {
		const result = HeaderHelper.parseAccept("text/html;charset=UTF-8, application/json;q=0.9");

		expect(result).toEqual([
			{ mimeType: "text/html", quality: 1, params: { charset: "UTF-8" } },
			{ mimeType: "application/json", quality: 0.9 }
		]);
	});

	test("can parse multiple accept header values passed as an array", async () => {
		const result = HeaderHelper.parseAccept([
			"text/html, application/xml;q=0.9",
			"image/webp, */*;q=0.8"
		]);

		expect(result).toEqual([
			{ mimeType: "text/html", quality: 1 },
			{ mimeType: "image/webp", quality: 1 },
			{ mimeType: "application/xml", quality: 0.9 },
			{ mimeType: "*/*", quality: 0.8 }
		]);
	});

	test("returns undefined for an invalid media type in an accept header", async () => {
		const result = HeaderHelper.parseAccept("not-a-valid-type");

		expect(result).toBeUndefined();
	});

	test("returns undefined when any accept header entry is invalid", async () => {
		const result = HeaderHelper.parseAccept("text/html, invalid");

		expect(result).toBeUndefined();
	});

	test("returns undefined for an empty accept header", async () => {
		const result = HeaderHelper.parseAccept(undefined);

		expect(result).toBeUndefined();
	});

	test("can extract parsed media types from request headers", async () => {
		const result = HeaderHelper.extractAccept({
			accept: "text/html, application/json;q=0.9"
		});

		expect(result).toEqual([
			{ mimeType: "text/html", quality: 1 },
			{ mimeType: "application/json", quality: 0.9 }
		]);
	});

	test("can extract parsed media types from all accept header values", async () => {
		const result = HeaderHelper.extractAccept({
			accept: ["text/html, image/webp", "application/json;q=0.9"]
		});

		expect(result).toEqual([
			{ mimeType: "text/html", quality: 1 },
			{ mimeType: "image/webp", quality: 1 },
			{ mimeType: "application/json", quality: 0.9 }
		]);
	});

	test("returns undefined when the request accept header is invalid", async () => {
		const result = HeaderHelper.extractAccept({
			accept: "not-valid"
		});

		expect(result).toBeUndefined();
	});
});
