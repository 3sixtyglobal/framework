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
	test("can extract URL from a valid Link header", async () => {
		const url = HeaderHelper.extractLinkHeader(
			'<https://example.com/api?cursor=abc123>; rel="next"'
		);
		expect(url).toEqual({
			url: "https://example.com/api?cursor=abc123",
			urlQueryParams: {
				cursor: "abc123"
			},
			rel: "next"
		});
	});

	test("can extract URL from a Link header with different rel", async () => {
		const url = HeaderHelper.extractLinkHeader('<https://example.com/prev>; rel="prev"');
		expect(url).toEqual({ url: "https://example.com/prev", rel: "prev" });
	});

	test("can extract URL, rel and params from a Link header", async () => {
		const link = HeaderHelper.extractLinkHeader(
			'</terms>; rel="copyright"; anchor="#foo"; title="Example Title"'
		);
		expect(link).toEqual({
			url: "/terms",
			rel: "copyright",
			params: {
				anchor: "#foo",
				title: "Example Title"
			}
		});
	});

	test("can extract URL from a Link header with rel as URL", async () => {
		const link = HeaderHelper.extractLinkHeader('</>; rel="http://example.net/foo"');
		expect(link).toEqual({ url: "/", rel: "http://example.net/foo" });
	});

	test("can extract URL from a Link header with start rel", async () => {
		const link = HeaderHelper.extractLinkHeader('<https://example.org/>; rel="start"');
		expect(link).toEqual({ url: "https://example.org/", rel: "start" });
	});

	test("can extract URL from a Link header with index rel", async () => {
		const link = HeaderHelper.extractLinkHeader('<https://example.org/index>; rel="index"');
		expect(link).toEqual({ url: "https://example.org/index", rel: "index" });
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
			rel: "next",
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
			rel: "next",
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
		expect(link).toEqual({ url: "https://example.com/resource", rel: "prev" });
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
				rel: "next",
				params: {
					title: "Example"
				}
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
				rel: "next"
			},
			{
				url: "https://example.com/api?page=2",
				urlQueryParams: {
					page: "2"
				},
				rel: "prev"
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
			rel: "next"
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
			rel: "prev"
		});
	});

	test("returns undefined when extractLinkHeaderRelation can't find the relation", async () => {
		const header = HeaderHelper.extractLinkHeaderRelation(
			'<https://example.com/api?cursor=abc123>; rel="next"',
			"prev"
		);
		expect(header).toBeUndefined();
	});

	test("returns undefined when extractLinkHeaderRelation input is invalid", async () => {
		const header = HeaderHelper.extractLinkHeaderRelation({} as unknown, "next");
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
		).toThrow("guard.string");
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
});
