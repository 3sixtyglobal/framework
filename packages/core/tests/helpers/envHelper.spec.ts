// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { EnvHelper } from "../../src/helpers/envHelper.js";

describe("EnvHelper", () => {
	describe("envVarKeyToJsonKey", () => {
		test("can convert an environment variable key to a JSON key", () => {
			expect(EnvHelper.envVarKeyToJsonKey("TEST_KEY")).toEqual("testKey");
		});

		test("can convert a multi-segment key", () => {
			expect(EnvHelper.envVarKeyToJsonKey("MY_LONG_ENV_KEY")).toEqual("myLongEnvKey");
		});

		test("can convert a single-segment key", () => {
			expect(EnvHelper.envVarKeyToJsonKey("FOO")).toEqual("foo");
		});

		test("strips the prefix before converting", () => {
			expect(EnvHelper.envVarKeyToJsonKey("APP_HOST_NAME", "APP_")).toEqual("hostName");
		});

		test("strips a multi-segment prefix", () => {
			expect(EnvHelper.envVarKeyToJsonKey("MY_APP_SERVER_PORT", "MY_APP_")).toEqual("serverPort");
		});

		test("returns full key as camelCase when prefix does not match", () => {
			expect(EnvHelper.envVarKeyToJsonKey("APP_HOST_NAME", "OTHER_")).toEqual("appHostName");
		});

		test("returns empty string when key equals prefix exactly", () => {
			expect(EnvHelper.envVarKeyToJsonKey("APP_", "APP_")).toEqual("");
		});

		test("preserves wildcard suffix on a bare key", () => {
			expect(EnvHelper.envVarKeyToJsonKey("REST_PATH_*")).toEqual("restPath*");
		});

		test("preserves wildcard suffix when prefix is stripped", () => {
			expect(EnvHelper.envVarKeyToJsonKey("TWIN_REST_PATH_*", "TWIN_")).toEqual("restPath*");
		});

		test("preserves wildcard suffix when prefix has multiple segments", () => {
			expect(EnvHelper.envVarKeyToJsonKey("APP_SERVER_HOST_*", "APP_SERVER_")).toEqual("host*");
		});

		test("handles wildcard with no underscore separator before asterisk", () => {
			expect(EnvHelper.envVarKeyToJsonKey("FOO*")).toEqual("foo*");
		});

		test("handles wildcard when only the prefix segment precedes the asterisk", () => {
			expect(EnvHelper.envVarKeyToJsonKey("APP_*", "APP_")).toEqual("app*");
		});
	});

	describe("jsonKeyToEnvVarKey", () => {
		test("can convert a camelCase key to UPPER_SNAKE_CASE", () => {
			expect(EnvHelper.jsonKeyToEnvVarKey("testKey")).toEqual("TEST_KEY");
		});

		test("can convert a multi-word camelCase key", () => {
			expect(EnvHelper.jsonKeyToEnvVarKey("myLongPropertyName")).toEqual("MY_LONG_PROPERTY_NAME");
		});

		test("can convert a single-word key", () => {
			expect(EnvHelper.jsonKeyToEnvVarKey("foo")).toEqual("FOO");
		});

		test("prepends a prefix when provided", () => {
			expect(EnvHelper.jsonKeyToEnvVarKey("hostName", "APP_")).toEqual("APP_HOST_NAME");
		});

		test("prepends a multi-segment prefix when provided", () => {
			expect(EnvHelper.jsonKeyToEnvVarKey("serverPort", "MY_APP_")).toEqual("MY_APP_SERVER_PORT");
		});

		test("does not prepend anything when prefix is undefined", () => {
			expect(EnvHelper.jsonKeyToEnvVarKey("hostName")).toEqual("HOST_NAME");
		});
	});

	describe("envToJson", () => {
		test("converts all env vars to camelCase properties when no prefix given", () => {
			const env = { HOST_NAME: "localhost", SERVER_PORT: "8080" };
			expect(EnvHelper.envToJson(env)).toEqual({ hostName: "localhost", serverPort: "8080" });
		});

		test("filters to only vars matching the prefix", () => {
			const env = { APP_HOST: "localhost", APP_PORT: "3000", OTHER_KEY: "ignored" };
			expect(EnvHelper.envToJson(env, "APP_")).toEqual({ host: "localhost", port: "3000" });
		});

		test("strips prefix before converting to camelCase", () => {
			const env = { MY_APP_HOST_NAME: "example.com" };
			expect(EnvHelper.envToJson(env, "MY_APP_")).toEqual({ hostName: "example.com" });
		});

		test("returns empty object when env vars is empty", () => {
			expect(EnvHelper.envToJson({})).toEqual({});
		});

		test("returns empty object when no vars match prefix", () => {
			const env = { HOST: "localhost" };
			expect(EnvHelper.envToJson(env, "APP_")).toEqual({});
		});

		test("excludes vars with undefined values", () => {
			expect(EnvHelper.envToJson({ HOST: "localhost", PORT: undefined })).toEqual({
				host: "localhost"
			});
		});

		test("returns empty object when input is not a valid object", () => {
			expect(EnvHelper.envToJson(null as unknown as {})).toEqual({});
		});
	});
});
