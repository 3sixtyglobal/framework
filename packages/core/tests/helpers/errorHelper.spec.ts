// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { BaseError } from "../../src/errors/baseError.js";
import { ErrorHelper } from "../../src/helpers/errorHelper.js";
import { I18n } from "../../src/utils/i18n.js";
import { SharedStore } from "../../src/utils/sharedStore.js";

describe("ErrorHelper", () => {
	beforeEach(() => {
		I18n.setLocale("en");
		I18n.addDictionary("en", {
			errorNames: {
				error: "Error",
				testError: "Test Error"
			},
			error: {
				testSource: {
					someError: "Some localized error",
					required: "The field is required"
				}
			}
		});
	});

	afterEach(() => {
		SharedStore.remove("i18n");
	});

	describe("formatErrors", () => {
		test("returns empty array for undefined", () => {
			expect(ErrorHelper.formatErrors(undefined)).toEqual([]);
		});

		test("returns empty array for null", () => {
			expect(ErrorHelper.formatErrors(null)).toEqual([]);
		});

		test("returns localized message for a known error", () => {
			const error = new BaseError("TestError", "testSource", "someError");
			expect(ErrorHelper.formatErrors(error)).toEqual(["Some localized error"]);
		});

		test("returns raw message when no i18n key exists", () => {
			const error = new Error("Something went wrong unexpectedly");
			expect(ErrorHelper.formatErrors(error)).toEqual(["Something went wrong unexpectedly"]);
		});

		test("returns one entry per chained error", () => {
			const cause = new BaseError("TestError", "testSource", "someError");
			const error = new BaseError("TestError", "testSource", "someError", {}, cause);
			expect(ErrorHelper.formatErrors(error)).toHaveLength(2);
		});

		test("includes stack in output when includeStack is true", () => {
			const error = new BaseError("TestError", "testSource", "someError");
			error.stack = "BaseError: testSource.someError\n    at testFile.ts:1:1";
			const result = ErrorHelper.formatErrors(error, { includeStack: true });
			expect(result[0]).toBe("Some localized error\n    at testFile.ts:1:1");
		});

		test("does not include stack by default", () => {
			const error = new BaseError("TestError", "testSource", "someError");
			error.stack = "BaseError: testSource.someError\n    at testFile.ts:1:1";
			expect(ErrorHelper.formatErrors(error)).toEqual(["Some localized error"]);
		});

		test("includes validation errors in output when includeAdditional is true", () => {
			const error = new BaseError("TestError", "testSource", "someError", {
				validationFailures: [{ property: "name", reason: "testSource.required" }]
			});
			const result = ErrorHelper.formatErrors(error, { includeAdditional: true });
			expect(result[0]).toBe("Some localized error\nname: The field is required");
		});

		test("does not include additional by default", () => {
			const error = new BaseError("TestError", "testSource", "someError", {
				validationFailures: [{ property: "name", reason: "testSource.required" }]
			});
			expect(ErrorHelper.formatErrors(error)).toEqual(["Some localized error"]);
		});
	});

	describe("localizeErrors", () => {
		test("returns empty array for undefined", () => {
			expect(ErrorHelper.localizeErrors(undefined)).toEqual([]);
		});

		test("returns localized error name when key exists", () => {
			const error = new BaseError("TestError", "testSource", "someError");
			expect(ErrorHelper.localizeErrors(error)[0].name).toEqual("Test Error");
		});

		test("falls back to errorNames.error when name key not found", () => {
			const error = new BaseError("UnknownError", "testSource", "someError");
			expect(ErrorHelper.localizeErrors(error)[0].name).toEqual("Error");
		});

		test("returns localized message when key exists", () => {
			const error = new BaseError("TestError", "testSource", "someError");
			expect(ErrorHelper.localizeErrors(error)[0].message).toEqual("Some localized error");
		});

		test("returns raw message when no i18n key found", () => {
			const error = new Error("Something went wrong unexpectedly");
			expect(ErrorHelper.localizeErrors(error)[0].message).toEqual(
				"Something went wrong unexpectedly"
			);
		});

		test("preserves source", () => {
			const error = new BaseError("TestError", "testSource", "someError");
			expect(ErrorHelper.localizeErrors(error)[0].source).toEqual("testSource");
		});

		test("strips first line from stack trace", () => {
			const error = new BaseError("TestError", "testSource", "someError");
			error.stack = "BaseError: testSource.someError\n    at testFile.ts:1:1\n    at inner.ts:2:2";
			const result = ErrorHelper.localizeErrors(error);
			expect(result[0].stack).toBe("    at testFile.ts:1:1\n    at inner.ts:2:2");
		});

		test("flattens chained errors into multiple entries", () => {
			const cause = new BaseError("TestError", "testSource", "someError");
			const error = new BaseError("TestError", "testSource", "someError", {}, cause);
			expect(ErrorHelper.localizeErrors(error)).toHaveLength(2);
		});

		test("includes additional validation failures", () => {
			const error = new BaseError("TestError", "testSource", "someError", {
				validationFailures: [{ property: "name", reason: "testSource.required" }]
			});
			const result = ErrorHelper.localizeErrors(error);
			expect(result[0].additional).toEqual(["name: The field is required"]);
		});
	});

	describe("formatValidationErrors", () => {
		test("returns undefined when error has no properties", () => {
			expect(ErrorHelper.formatValidationErrors({ name: "Error", message: "msg" })).toBeUndefined();
		});

		test("returns undefined when properties is empty object", () => {
			expect(
				ErrorHelper.formatValidationErrors({ name: "Error", message: "msg", properties: {} })
			).toBeUndefined();
		});

		test("returns undefined when properties has no validationFailures", () => {
			expect(
				ErrorHelper.formatValidationErrors({
					name: "Error",
					message: "msg",
					properties: { otherProp: "value" }
				})
			).toBeUndefined();
		});

		test("returns undefined for empty validationFailures array", () => {
			expect(
				ErrorHelper.formatValidationErrors({
					name: "Error",
					message: "msg",
					properties: { validationFailures: [] }
				})
			).toBeUndefined();
		});

		test("returns formatted validation failure strings", () => {
			const result = ErrorHelper.formatValidationErrors({
				name: "Error",
				message: "msg",
				properties: {
					validationFailures: [
						{ property: "name", reason: "testSource.required" },
						{ property: "email", reason: "testSource.required" }
					]
				}
			});
			expect(result).toEqual(["name: The field is required", "email: The field is required"]);
		});

		test("appends value when present in validation failure properties", () => {
			const result = ErrorHelper.formatValidationErrors({
				name: "Error",
				message: "msg",
				properties: {
					validationFailures: [
						{
							property: "age",
							reason: "testSource.required",
							properties: { value: 5 }
						}
					]
				}
			});
			expect(result).toEqual(["age: The field is required = 5"]);
		});

		test("uses raw key when i18n key not found for validation failure reason", () => {
			const result = ErrorHelper.formatValidationErrors({
				name: "Error",
				message: "msg",
				properties: {
					validationFailures: [{ property: "name", reason: "unknown.reason" }]
				}
			});
			expect(result).toEqual(["name: error.unknown.reason"]);
		});
	});
});
