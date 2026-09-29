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

	describe("envString", () => {
		test("returns undefined when the env var is absent and no default given", () => {
			expect(EnvHelper.envString<{ host?: string }>({}, "host")).toBeUndefined();
		});

		test("returns defaultValue when the env var is absent", () => {
			expect(EnvHelper.envString<{ host?: string }>({}, "host", "localhost")).toBe("localhost");
		});

		test("returns defaultValue when the env var is an empty string", () => {
			expect(EnvHelper.envString({ host: "" }, "host", "localhost")).toBe("localhost");
		});

		test("returns the value when the env var is set", () => {
			expect(EnvHelper.envString({ host: "smtp.example.com" }, "host")).toBe("smtp.example.com");
		});
	});

	describe("envChoice", () => {
		const choices = ["memory", "file"] as const;

		test("returns undefined when the env var is absent and no default given", () => {
			expect(
				EnvHelper.envChoice<{ store?: string }, "memory" | "file">({}, "store", choices)
			).toBeUndefined();
		});

		test("returns defaultValue when the env var is absent", () => {
			expect(
				EnvHelper.envChoice<{ store?: string }, "memory" | "file">({}, "store", choices, "memory")
			).toBe("memory");
		});

		test("returns defaultValue when the env var is an empty string", () => {
			expect(EnvHelper.envChoice({ store: "" }, "store", choices, "file")).toBe("file");
		});

		test("returns the value when it is one of the choices", () => {
			expect(EnvHelper.envChoice({ store: "file" }, "store", choices)).toBe("file");
		});

		test("throws GeneralError naming the env var when the value is not a choice", () => {
			expect(() => EnvHelper.envChoice({ store: "dynamodb" }, "store", choices)).toThrow(
				expect.objectContaining({
					name: "GeneralError",
					source: "EnvHelper",
					properties: expect.objectContaining({
						key: "store",
						value: "dynamodb",
						type: "memory | file"
					})
				})
			);
		});
	});

	describe("envBoolean", () => {
		test("returns defaultValue when env var is undefined", () => {
			expect(EnvHelper.envBoolean<{ debug?: boolean }>({}, "debug", false)).toBe(false);
			expect(EnvHelper.envBoolean<{ debug?: boolean }>({}, "debug", true)).toBe(true);
		});

		test("returns undefined when env var is absent and no default is given", () => {
			expect(EnvHelper.envBoolean<{ debug?: boolean }>({}, "debug")).toBeUndefined();
		});

		test("returns true for 'true' string", () => {
			expect(EnvHelper.envBoolean({ debug: "true" }, "debug", false)).toBe(true);
		});

		test("returns true for 'true' string with no default", () => {
			expect(EnvHelper.envBoolean({ debug: "true" }, "debug")).toBe(true);
		});

		test("returns false for 'false' string", () => {
			expect(EnvHelper.envBoolean({ debug: "false" }, "debug", true)).toBe(false);
		});

		test("returns false for 'false' string with no default", () => {
			expect(EnvHelper.envBoolean({ debug: "false" }, "debug")).toBe(false);
		});

		test("throws GeneralError for an invalid boolean string", () => {
			expect(() => EnvHelper.envBoolean({ debug: "notabool" }, "debug", false)).toThrow();
		});

		test("throws GeneralError for an invalid boolean string with no default", () => {
			expect(() => EnvHelper.envBoolean({ debug: "notabool" }, "debug")).toThrow();
		});
	});

	describe("envMs", () => {
		test("returns undefined when env var is absent and no default given", () => {
			expect(EnvHelper.envMs<{ timeout?: number }>({}, "timeout")).toBeUndefined();
		});

		test("returns defaultValue when env var is absent", () => {
			expect(EnvHelper.envMs<{ timeout?: number }>({}, "timeout", 1000)).toBe(1000);
		});

		test("returns integer value for a valid numeric string", () => {
			expect(EnvHelper.envMs({ timeout: "5000" }, "timeout")).toBe(5000);
		});

		test("returns integer value for a valid numeric string when default given", () => {
			expect(EnvHelper.envMs({ timeout: "5000" }, "timeout", 1000)).toBe(5000);
		});

		test("throws GeneralError for a non-numeric string", () => {
			expect(() => EnvHelper.envMs({ timeout: "bad" }, "timeout")).toThrow();
		});
	});

	describe("envCount", () => {
		test("returns undefined when env var is absent and no default given", () => {
			expect(EnvHelper.envCount<{ count?: string }>({}, "count")).toBeUndefined();
		});

		test("returns defaultValue when env var is absent", () => {
			expect(EnvHelper.envCount<{ count?: string }>({}, "count", 50)).toBe(50);
		});

		test("returns integer value for a valid numeric string", () => {
			expect(EnvHelper.envCount<{ count?: string }>({ count: "100" }, "count")).toBe(100);
		});

		test("returns integer value for a valid numeric string when default given", () => {
			expect(EnvHelper.envCount<{ count?: string }>({ count: "100" }, "count", 50)).toBe(100);
		});

		test("throws GeneralError for a non-numeric string", () => {
			expect(() => EnvHelper.envCount<{ count?: string }>({ count: "xyz" }, "count")).toThrow();
		});
	});

	describe("envInteger", () => {
		test("returns undefined when env var is absent and no default given", () => {
			expect(EnvHelper.envInteger<{ port?: string }>({}, "port")).toBeUndefined();
		});

		test("returns defaultValue when env var is absent", () => {
			expect(EnvHelper.envInteger<{ port?: string }>({}, "port", 5432)).toBe(5432);
		});

		test("returns integer value for a valid numeric string", () => {
			expect(EnvHelper.envInteger({ port: "3306" }, "port")).toBe(3306);
		});

		test("returns integer value for a valid numeric string when default given", () => {
			expect(EnvHelper.envInteger({ port: "3306" }, "port", 5432)).toBe(3306);
		});

		test("throws GeneralError for a non-numeric string", () => {
			expect(() => EnvHelper.envInteger({ port: "not-a-port" }, "port")).toThrow();
		});
	});

	describe("envSeconds", () => {
		test("returns undefined when env var is absent and no default given", () => {
			expect(EnvHelper.envSeconds<{ duration?: string }>({}, "duration")).toBeUndefined();
		});

		test("returns defaultValue when env var is absent", () => {
			expect(EnvHelper.envSeconds<{ duration?: string }>({}, "duration", 60)).toBe(60);
		});

		test("returns raw seconds value for a valid numeric string", () => {
			expect(EnvHelper.envSeconds<{ duration?: string }>({ duration: "30" }, "duration")).toBe(30);
		});

		test("returns raw seconds value for a valid numeric string when default given", () => {
			expect(EnvHelper.envSeconds<{ duration?: string }>({ duration: "30" }, "duration", 60)).toBe(
				30
			);
		});

		test("throws GeneralError for a non-numeric string", () => {
			expect(() =>
				EnvHelper.envSeconds<{ duration?: string }>({ duration: "thirty" }, "duration")
			).toThrow();
		});
	});

	describe("envMinutes", () => {
		test("returns undefined when env var is absent and no default given", () => {
			expect(EnvHelper.envMinutes<{ interval?: string }>({}, "interval")).toBeUndefined();
		});

		test("returns defaultValue when env var is absent", () => {
			expect(EnvHelper.envMinutes<{ interval?: string }>({}, "interval", 5)).toBe(5);
		});

		test("returns raw minutes value for a valid numeric string", () => {
			expect(EnvHelper.envMinutes<{ interval?: string }>({ interval: "15" }, "interval")).toBe(15);
		});

		test("returns raw minutes value for a valid numeric string when default given", () => {
			expect(EnvHelper.envMinutes<{ interval?: string }>({ interval: "15" }, "interval", 5)).toBe(
				15
			);
		});

		test("throws GeneralError for a non-numeric string", () => {
			expect(() =>
				EnvHelper.envMinutes<{ interval?: string }>({ interval: "fifteen" }, "interval")
			).toThrow();
		});
	});

	describe("envDateTime", () => {
		test("returns undefined when env var is absent and no default given", () => {
			expect(EnvHelper.envDateTime<{ dt?: string }>({}, "dt")).toBeUndefined();
		});

		test("returns defaultValue when env var is absent", () => {
			expect(EnvHelper.envDateTime<{ dt?: string }>({}, "dt", "2020-01-01T00:00:00.000Z")).toBe(
				"2020-01-01T00:00:00.000Z"
			);
		});

		test("returns the ISO string for a valid datetime input", () => {
			expect(EnvHelper.envDateTime({ dt: "2024-01-15T10:30:00Z" }, "dt")).toBe(
				"2024-01-15T10:30:00.000Z"
			);
		});

		test("returns midnight UTC ISO string for a date-only input", () => {
			expect(EnvHelper.envDateTime({ dt: "2024-01-15" }, "dt")).toBe("2024-01-15T00:00:00.000Z");
		});

		test("throws GeneralError for a non-datetime string", () => {
			expect(() => EnvHelper.envDateTime({ dt: "not-a-date" }, "dt")).toThrow();
		});
	});

	describe("envSecToMs", () => {
		test("returns undefined when env var is absent and no default given", () => {
			expect(EnvHelper.envSecToMs<{ secs?: string }>({}, "secs")).toBeUndefined();
		});

		test("returns defaultValue when env var is absent", () => {
			expect(EnvHelper.envSecToMs<{ secs?: string }>({}, "secs", 3000)).toBe(3000);
		});

		test("converts seconds to milliseconds", () => {
			expect(EnvHelper.envSecToMs<{ secs?: string }>({ secs: "5" }, "secs")).toBe(5000);
		});

		test("converts seconds to milliseconds when default given", () => {
			expect(EnvHelper.envSecToMs<{ secs?: string }>({ secs: "5" }, "secs", 3000)).toBe(5000);
		});

		test("returns zero unchanged", () => {
			expect(EnvHelper.envSecToMs<{ secs?: string }>({ secs: "0" }, "secs")).toBe(0);
		});

		test("returns a negative sentinel unchanged", () => {
			expect(EnvHelper.envSecToMs<{ secs?: string }>({ secs: "-1" }, "secs", 3000)).toBe(-1);
		});

		test("throws GeneralError for a non-numeric string", () => {
			expect(() => EnvHelper.envSecToMs<{ secs?: string }>({ secs: "five" }, "secs")).toThrow();
		});
	});

	describe("envMinToMs", () => {
		test("returns undefined when env var is absent and no default given", () => {
			expect(EnvHelper.envMinToMs<{ mins?: string }>({}, "mins")).toBeUndefined();
		});

		test("returns defaultValue when env var is absent", () => {
			expect(EnvHelper.envMinToMs<{ mins?: string }>({}, "mins", 60_000)).toBe(60_000);
		});

		test("converts minutes to milliseconds", () => {
			expect(EnvHelper.envMinToMs<{ mins?: string }>({ mins: "2" }, "mins")).toBe(120_000);
		});

		test("converts minutes to milliseconds when default given", () => {
			expect(EnvHelper.envMinToMs<{ mins?: string }>({ mins: "2" }, "mins", 60_000)).toBe(120_000);
		});

		test("returns zero unchanged", () => {
			expect(EnvHelper.envMinToMs<{ mins?: string }>({ mins: "0" }, "mins")).toBe(0);
		});

		test("returns a negative sentinel unchanged", () => {
			expect(EnvHelper.envMinToMs<{ mins?: string }>({ mins: "-1" }, "mins", 60_000)).toBe(-1);
		});

		test("throws GeneralError for a non-numeric string", () => {
			expect(() => EnvHelper.envMinToMs<{ mins?: string }>({ mins: "two" }, "mins")).toThrow();
		});
	});

	describe("envObject", () => {
		test("returns undefined when env var is absent and no default given", () => {
			expect(EnvHelper.envObject<{ rules?: string }, {}>({}, "rules")).toBeUndefined();
		});

		test("returns defaultValue when env var is absent", () => {
			const def = { allow: [] };
			expect(EnvHelper.envObject<{ rules?: string }, {}>({}, "rules", def)).toBe(def);
		});

		test("returns the parsed object when the var holds a pre-parsed object", () => {
			const rules = { allow: ["read"] };
			expect(
				EnvHelper.envObject<{ rules?: string }, {}>({ rules: rules as unknown as string }, "rules")
			).toEqual(rules);
		});

		test("parses a JSON object string", () => {
			expect(
				EnvHelper.envObject<{ rules?: string }, { x: number }>({ rules: '{"x":1}' }, "rules")
			).toEqual({
				x: 1
			});
		});

		test("returns undefined for a non-object string when no default given", () => {
			expect(
				EnvHelper.envObject<{ rules?: string }, {}>({ rules: "not-json" }, "rules")
			).toBeUndefined();
		});

		test("returns defaultValue for a non-object string when default given", () => {
			const def = { allow: [] };
			expect(EnvHelper.envObject<{ rules?: string }, {}>({ rules: "not-json" }, "rules", def)).toBe(
				def
			);
		});
	});

	describe("envArray", () => {
		test("returns undefined when env var is absent and no default given", () => {
			expect(EnvHelper.envArray<{ rules?: string }, {}>({}, "rules")).toBeUndefined();
		});

		test("returns defaultValue when env var is absent", () => {
			const def = [{ name: "default" }];
			expect(EnvHelper.envArray<{ rules?: string }, {}>({}, "rules", def)).toBe(def);
		});

		test("returns the parsed array when the var holds a pre-parsed array", () => {
			const apps = [{ name: "app1" }];
			expect(
				EnvHelper.envArray<{ rules?: string }, {}>({ rules: apps as unknown as string }, "rules")
			).toEqual(apps);
		});

		test("parses a JSON array string", () => {
			expect(EnvHelper.envArray<{ rules?: string }, number>({ rules: "[1,2,3]" }, "rules")).toEqual(
				[1, 2, 3]
			);
		});

		test("returns undefined for a non-array string when no default given", () => {
			expect(
				EnvHelper.envArray<{ rules?: string }, {}>({ rules: "not-an-array" }, "rules")
			).toBeUndefined();
		});

		test("returns defaultValue for a non-array string when default given", () => {
			const def = [{ name: "fallback" }];
			expect(
				EnvHelper.envArray<{ rules?: string }, {}>({ rules: "not-an-array" }, "rules", def)
			).toBe(def);
		});
	});

	describe("commaSeparatedListToArray", () => {
		test("returns empty array for undefined when no default is supplied", () => {
			expect(EnvHelper.commaSeparatedListToArray(undefined)).toEqual([]);
		});

		test("returns undefined when an explicit undefined default is supplied", () => {
			expect(EnvHelper.commaSeparatedListToArray(undefined, undefined)).toBeUndefined();
		});

		test("returns empty array for empty string", () => {
			expect(EnvHelper.commaSeparatedListToArray("")).toEqual([]);
		});

		test("returns single-element array for a string with no commas", () => {
			expect(EnvHelper.commaSeparatedListToArray("memory")).toEqual(["memory"]);
		});

		test("splits comma-separated values into an array", () => {
			expect(EnvHelper.commaSeparatedListToArray("memory,file,dynamodb")).toEqual([
				"memory",
				"file",
				"dynamodb"
			]);
		});

		test("trims whitespace from each element", () => {
			expect(EnvHelper.commaSeparatedListToArray("memory, file , dynamodb")).toEqual([
				"memory",
				"file",
				"dynamodb"
			]);
		});

		test("filters out blank entries from double commas", () => {
			expect(EnvHelper.commaSeparatedListToArray("memory,,file")).toEqual(["memory", "file"]);
		});
	});

	describe("envListToArray", () => {
		const expected = ["json", "xml"] as const;

		test("returns empty array when the env var is absent", () => {
			expect(EnvHelper.envListToArray<{ converters?: string }, string>({}, "converters")).toEqual(
				[]
			);
		});

		test("returns defaultValue when the env var is absent", () => {
			expect(
				EnvHelper.envListToArray<{ converters?: string }, string>({}, "converters", undefined, [
					"json"
				])
			).toEqual(["json"]);
		});

		test("returns defaultValue when the env var is an empty string", () => {
			expect(
				EnvHelper.envListToArray({ converters: "" }, "converters", undefined, ["json"])
			).toEqual(["json"]);
		});

		test("preserves explicit undefined defaults so callers can use their own fallback", () => {
			expect(
				EnvHelper.envListToArray({ converters: undefined }, "converters", undefined, undefined)
			).toBeUndefined();
		});

		test("splits and trims comma-separated values", () => {
			expect(
				EnvHelper.envListToArray<{ converters?: string }, string>(
					{ converters: " json , xml " },
					"converters"
				)
			).toEqual(["json", "xml"]);
		});

		test("returns the values when they are all in expectedValues", () => {
			expect(
				EnvHelper.envListToArray({ converters: "json,xml" }, "converters", [...expected])
			).toEqual(["json", "xml"]);
		});

		test("throws GeneralError naming the env var when a value is not in expectedValues", () => {
			expect(() =>
				EnvHelper.envListToArray({ converters: "json,xnl" }, "converters", [...expected])
			).toThrow(
				expect.objectContaining({
					name: "GeneralError",
					source: "EnvHelper",
					properties: expect.objectContaining({
						key: "converters",
						value: "json,xnl",
						type: "json | xml"
					})
				})
			);
		});

		test("does not validate when expectedValues is omitted", () => {
			expect(
				EnvHelper.envListToArray<{ converters?: string }, string>(
					{ converters: "xnl" },
					"converters"
				)
			).toEqual(["xnl"]);
		});
	});

	describe("envKeyIntegerPairs", () => {
		test("returns undefined when the env var is not set", () => {
			expect(EnvHelper.envKeyIntegerPairs<{ limits?: string }>({}, "limits")).toBeUndefined();
		});

		test("returns undefined when the env var is an empty string", () => {
			expect(
				EnvHelper.envKeyIntegerPairs<{ limits?: string }>({ limits: "" }, "limits")
			).toBeUndefined();
		});

		test("parses a single key=value pair", () => {
			expect(
				EnvHelper.envKeyIntegerPairs<{ limits?: string }>({ limits: "large=10485760" }, "limits")
			).toStrictEqual({ large: 10485760 });
		});

		test("parses multiple key=value pairs", () => {
			expect(
				EnvHelper.envKeyIntegerPairs<{ limits?: string }>(
					{ limits: "large=10485760,small=1048576" },
					"limits"
				)
			).toStrictEqual({ large: 10485760, small: 1048576 });
		});

		test("trims whitespace around keys and values", () => {
			expect(
				EnvHelper.envKeyIntegerPairs({ limits: " large = 10485760 , small = 1048576 " }, "limits")
			).toStrictEqual({ large: 10485760, small: 1048576 });
		});

		test("throws GeneralError when an entry has no equals sign", () => {
			expect(() =>
				EnvHelper.envKeyIntegerPairs<{ limits?: string }>({ limits: "noequalssign" }, "limits")
			).toThrow(expect.objectContaining({ name: "GeneralError", source: "EnvHelper" }));
		});

		test("throws GeneralError when an entry has more than one equals sign", () => {
			expect(() =>
				EnvHelper.envKeyIntegerPairs<{ limits?: string }>({ limits: "key=1=2" }, "limits")
			).toThrow(expect.objectContaining({ name: "GeneralError", source: "EnvHelper" }));
		});

		test("throws GeneralError when a value is not an integer", () => {
			expect(() =>
				EnvHelper.envKeyIntegerPairs<{ limits?: string }>({ limits: "key=notanumber" }, "limits")
			).toThrow(expect.objectContaining({ name: "GeneralError", source: "EnvHelper" }));
		});

		test("throws GeneralError when a key is duplicated", () => {
			expect(() =>
				EnvHelper.envKeyIntegerPairs<{ limits?: string }>({ limits: "key=1,key=2" }, "limits")
			).toThrow(expect.objectContaining({ name: "GeneralError", source: "EnvHelper" }));
		});

		test("throws GeneralError when a key is empty", () => {
			expect(() =>
				EnvHelper.envKeyIntegerPairs<{ limits?: string }>({ limits: "=123" }, "limits")
			).toThrow(expect.objectContaining({ name: "GeneralError", source: "EnvHelper" }));
		});
	});
});
