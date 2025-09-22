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

	test("can create an empty bearer header from an empty token", async () => {
		const header = HeaderHelper.createBearer("");
		expect(header).toBe("");
	});

	test("can create an empty bearer header from an undefined token", async () => {
		const header = HeaderHelper.createBearer(undefined);
		expect(header).toBe("");
	});

	test("can extract the bearer from a valid header", async () => {
		const token = HeaderHelper.extractBearer("Bearer my-token");
		expect(token).toBe("my-token");
	});

	test("can fail to extract the bearer from an undefined header", async () => {
		const token = HeaderHelper.extractBearer(undefined);
		expect(token).toBe("");
	});

	test("can fail to extract the bearer from an empty header", async () => {
		const token = HeaderHelper.extractBearer("");
		expect(token).toBe("");
	});

	test("can fail to extract the bearer from an invalid header", async () => {
		const token = HeaderHelper.extractBearer("bearer my-token");
		expect(token).toBe("");
	});
});
