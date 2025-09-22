// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { HeaderHelper } from "../../src/utils/headerHelper";

describe("HeaderHelper", () => {
	test("can create a bearer header from a token", async () => {
		const header = HeaderHelper.createBearer("my-token");
		expect(header).toBe("Bearer my-token");
	});

	test("can create a bearer header from a token with whitespace", async () => {
		const header = HeaderHelper.createBearer("my-token ");
		expect(header).toBe("Bearer my-token");
	});

	test("can create a bearer header from an existing bearer token", async () => {
		const header = HeaderHelper.createBearer("Bearer my-token");
		expect(header).toBe("Bearer my-token");
	});

	test("can extract the bearer from a valid header", async () => {
		const token = HeaderHelper.extractBearerToken("Bearer my-token");
		expect(token).toBe("my-token");
	});

	test("can fail to extract the bearer from an undefined header", async () => {
		const token = HeaderHelper.extractBearerToken(undefined);
		expect(token).toBeUndefined();
	});

	test("can fail to extract the bearer from an empty header", async () => {
		const token = HeaderHelper.extractBearerToken("");
		expect(token).toBeUndefined();
	});

	test("can fail to extract the bearer from an invalid header", async () => {
		const token = HeaderHelper.extractBearerToken("bearer my-token");
		expect(token).toBeUndefined();
	});
});
