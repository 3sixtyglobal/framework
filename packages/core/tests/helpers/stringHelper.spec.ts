// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { StringHelper } from "../../src/helpers/stringHelper.js";

describe("StringHelper", () => {
	describe("trimLeadingSlashes", () => {
		test("can trim leading slashes for undefined string", () => {
			expect(StringHelper.trimLeadingSlashes(undefined as never)).toEqual(undefined);
		});

		test("can trim leading slashes for empty string", () => {
			expect(StringHelper.trimLeadingSlashes("")).toEqual("");
		});

		test("can trim leading slashes for string with no slashes", () => {
			expect(StringHelper.trimLeadingSlashes("abc")).toEqual("abc");
		});

		test("can trim a single leading slash", () => {
			expect(StringHelper.trimLeadingSlashes("/abc")).toEqual("abc");
		});

		test("can trim multiple leading slashes", () => {
			expect(StringHelper.trimLeadingSlashes("////abc")).toEqual("abc");
		});

		test("can trim leading slashes preserving trailing slash", () => {
			expect(StringHelper.trimLeadingSlashes("/abc/")).toEqual("abc/");
		});
	});

	describe("wordPath", () => {
		test("can convert Pascal case to a word path", () => {
			expect(StringHelper.wordPath("ThisIsATest")).toEqual("this/is/a/test");
		});

		test("can convert camel case to a word path", () => {
			expect(StringHelper.wordPath("thisIsATest")).toEqual("this/is/a/test");
		});

		test("can convert kebab case to a word path", () => {
			expect(StringHelper.wordPath("this-is-a-test")).toEqual("this/is/a/test");
		});

		test("can strip interface prefix when converting to a word path", () => {
			expect(StringHelper.wordPath("IThisIsATest")).toEqual("this/is/a/test");
		});

		test("returns empty string for empty input", () => {
			expect(StringHelper.wordPath("")).toEqual("");
		});
	});

	describe("stripPrefix", () => {
		test("can strip interface prefix from a Pascal case name", () => {
			expect(StringHelper.stripPrefix("IMyInterface")).toEqual("MyInterface");
		});

		test("does not strip prefix when second character is lowercase", () => {
			expect(StringHelper.stripPrefix("Ignore")).toEqual("Ignore");
		});

		test("does not strip prefix from a plain word", () => {
			expect(StringHelper.stripPrefix("Item")).toEqual("Item");
		});

		test("returns empty string for undefined input", () => {
			expect(StringHelper.stripPrefix(undefined as never)).toEqual("");
		});

		test("returns empty string for empty input", () => {
			expect(StringHelper.stripPrefix("")).toEqual("");
		});
	});

	describe("isUtf8", () => {
		test("returns false for non-Uint8Array input", () => {
			expect(StringHelper.isUtf8(null as never)).toBe(false);
		});

		test("returns true for an empty array", () => {
			expect(StringHelper.isUtf8(new Uint8Array())).toBe(true);
		});

		test("returns true for pure ASCII bytes", () => {
			expect(StringHelper.isUtf8(new Uint8Array([0x00, 0x41, 0x7f]))).toBe(true);
		});

		test("returns true for a valid 2-byte sequence", () => {
			// £ = U+00A3 → 0xC2 0xA3
			expect(StringHelper.isUtf8(new Uint8Array([0xc2, 0xa3]))).toBe(true);
		});

		test("returns false for an invalid 2-byte sequence with bad continuation", () => {
			// 0xC2 must be followed by 0x80-0xBF; 0x41 is not a continuation byte
			expect(StringHelper.isUtf8(new Uint8Array([0xc2, 0x41]))).toBe(false);
		});

		test("returns false for overlong 2-byte lead bytes 0xC0 and 0xC1", () => {
			// RFC 3629 excludes 0xC0 and 0xC1 — they would encode overlong ASCII
			expect(StringHelper.isUtf8(new Uint8Array([0xc0, 0x80]))).toBe(false);
			expect(StringHelper.isUtf8(new Uint8Array([0xc1, 0x80]))).toBe(false);
		});

		test("returns true for a valid 3-byte sequence (E0 range)", () => {
			// U+0800 → 0xE0 0xA0 0x80
			expect(StringHelper.isUtf8(new Uint8Array([0xe0, 0xa0, 0x80]))).toBe(true);
		});

		test("returns false for overlong 3-byte sequence (E0 with second byte below 0xA0)", () => {
			// 0xE0 0x80 would be overlong encoding
			expect(StringHelper.isUtf8(new Uint8Array([0xe0, 0x80, 0x80]))).toBe(false);
		});

		test("returns true for a valid 3-byte sequence (E1-EC range)", () => {
			// € = U+20AC → 0xE2 0x82 0xAC
			expect(StringHelper.isUtf8(new Uint8Array([0xe2, 0x82, 0xac]))).toBe(true);
		});

		test("returns true for a valid 3-byte sequence (ED range, non-surrogate)", () => {
			// U+D000 → 0xED 0x80 0x80 (below surrogate range)
			expect(StringHelper.isUtf8(new Uint8Array([0xed, 0x80, 0x80]))).toBe(true);
		});

		test("returns false for surrogate halves in ED range (0xED 0xA0+)", () => {
			// U+D800 → 0xED 0xA0 0x80 — surrogate half, excluded by RFC 3629
			expect(StringHelper.isUtf8(new Uint8Array([0xed, 0xa0, 0x80]))).toBe(false);
		});

		test("returns true for a valid 4-byte sequence (F0 range)", () => {
			// 😀 = U+1F600 → 0xF0 0x9F 0x98 0x80
			expect(StringHelper.isUtf8(new Uint8Array([0xf0, 0x9f, 0x98, 0x80]))).toBe(true);
		});

		test("returns false for invalid 4-byte sequence (F0 with second byte below 0x90)", () => {
			// 0xF0 0x80 would be overlong
			expect(StringHelper.isUtf8(new Uint8Array([0xf0, 0x80, 0x80, 0x80]))).toBe(false);
		});

		test("returns true for a valid 4-byte sequence (F1-F3 range)", () => {
			// U+40000 → 0xF1 0x80 0x80 0x80
			expect(StringHelper.isUtf8(new Uint8Array([0xf1, 0x80, 0x80, 0x80]))).toBe(true);
		});

		test("returns true for a valid 4-byte sequence (F4 range)", () => {
			// U+100000 → 0xF4 0x80 0x80 0x80
			expect(StringHelper.isUtf8(new Uint8Array([0xf4, 0x80, 0x80, 0x80]))).toBe(true);
		});

		test("returns false for lead byte above F4", () => {
			expect(StringHelper.isUtf8(new Uint8Array([0xf5, 0x80, 0x80, 0x80]))).toBe(false);
		});

		test("returns false for a bare continuation byte as first byte", () => {
			expect(StringHelper.isUtf8(new Uint8Array([0x80]))).toBe(false);
		});

		test("returns false for a truncated multi-byte sequence", () => {
			// 0xC2 with no continuation byte
			expect(StringHelper.isUtf8(new Uint8Array([0xc2]))).toBe(false);
		});

		test("returns true for a mixed ASCII and multi-byte sequence", () => {
			// "Hello, 世界" in UTF-8
			const enc = new TextEncoder();
			expect(StringHelper.isUtf8(enc.encode("Hello, 世界!"))).toBe(true);
		});

		test("speed comparison: isUtf8 vs TextDecoder fatal on a large valid UTF-8 buffer", () => {
			const enc = new TextEncoder();
			// ~600 KB of mixed ASCII + multi-byte content
			const chunk = enc.encode("Hello, 世界! 🌍 ".repeat(20_000));
			const iterations = 100;
			const decoder = new TextDecoder("utf-8", { fatal: true });

			// Warm up both paths
			StringHelper.isUtf8(chunk);
			try {
				decoder.decode(chunk);
			} catch {}

			const t1 = performance.now();
			for (let i = 0; i < iterations; i++) {
				StringHelper.isUtf8(chunk);
			}
			const isUtf8Ms = performance.now() - t1;

			const t2 = performance.now();
			for (let i = 0; i < iterations; i++) {
				try {
					decoder.decode(chunk);
				} catch {}
			}
			const textDecoderMs = performance.now() - t2;

			console.log(
				`isUtf8 (${chunk.length} bytes, ${iterations} iters): ${isUtf8Ms.toFixed(1)}ms` +
					` | TextDecoder fatal: ${textDecoderMs.toFixed(1)}ms` +
					` | ratio: ${(isUtf8Ms / textDecoderMs).toFixed(2)}x`
			);

			// Both must agree on validity
			expect(StringHelper.isUtf8(chunk)).toBe(true);
			try {
				decoder.decode(chunk);
				expect(true).toBe(true);
			} catch {
				expect(true).toBe(false);
			}
		});
	});

	test("can trim trailing slashes for undefined string", () => {
		expect(StringHelper.trimTrailingSlashes(undefined as never)).toEqual(undefined);
	});

	test("can trim trailing slashes for empty string", () => {
		expect(StringHelper.trimTrailingSlashes("")).toEqual("");
	});

	test("can trim trailing slashes for string with no slashes", () => {
		expect(StringHelper.trimTrailingSlashes("abc")).toEqual("abc");
	});

	test("can trim trailing slashes for string with single slash", () => {
		expect(StringHelper.trimTrailingSlashes("abc/")).toEqual("abc");
	});

	test("can trim trailing slashes for string with multiple slashes", () => {
		expect(StringHelper.trimTrailingSlashes("abc////")).toEqual("abc");
	});

	test("can trim trailing and leading slashes for undefined string", () => {
		expect(StringHelper.trimLeadingAndTrailingSlashes(undefined as never)).toEqual(undefined);
	});

	test("can trim trailing and leading slashes for empty string", () => {
		expect(StringHelper.trimLeadingAndTrailingSlashes("")).toEqual("");
	});

	test("can trim trailing and leading slashes for string with no slashes", () => {
		expect(StringHelper.trimLeadingAndTrailingSlashes("abc")).toEqual("abc");
	});

	test("can trim trailing and leading slashes for string with leading slash only", () => {
		expect(StringHelper.trimLeadingAndTrailingSlashes("/abc")).toEqual("abc");
	});

	test("can trim trailing and leading slashes for string with trailing slash only", () => {
		expect(StringHelper.trimLeadingAndTrailingSlashes("abc/")).toEqual("abc");
	});

	test("can trim trailing and leading slashes for string with both leading and trailing slashes", () => {
		expect(StringHelper.trimLeadingAndTrailingSlashes("/abc/")).toEqual("abc");
	});

	test("can trim trailing and leading slashes for string with multiple leading and trailing slashes", () => {
		expect(StringHelper.trimLeadingAndTrailingSlashes("////abc////")).toEqual("abc");
	});

	test("can trim trailing and leading slashes preserving slashes in the middle", () => {
		expect(StringHelper.trimLeadingAndTrailingSlashes("/abc/def/")).toEqual("abc/def");
	});

	test("can split kebab case into words", () => {
		expect(StringHelper.words("this-is-a-test")).toEqual(["this", "is", "a", "test"]);
	});

	test("can split snake case into words", () => {
		expect(StringHelper.words("this_is_a_test")).toEqual(["this", "is", "a", "test"]);
	});

	test("can split pascal case into words", () => {
		expect(StringHelper.words("ThisIsATest")).toEqual(["This", "Is", "A", "Test"]);
	});

	test("can split camel case into words", () => {
		expect(StringHelper.words("thisIsATest")).toEqual(["this", "Is", "A", "Test"]);
	});

	test("can split regular case into words", () => {
		expect(StringHelper.words("This is a test")).toEqual(["This", "is", "a", "test"]);
	});

	test("can split title case into words", () => {
		expect(StringHelper.words("This Is A Test")).toEqual(["This", "Is", "A", "Test"]);
	});

	test("can convert name to kebab case from Pascal case", () => {
		expect(StringHelper.kebabCase("ThisIsATest")).toEqual("this-is-a-test");
	});

	test("can convert name to kebab case from camel case", () => {
		expect(StringHelper.kebabCase("thisIsATest")).toEqual("this-is-a-test");
	});

	test("can convert name to kebab case from kebab case", () => {
		expect(StringHelper.kebabCase("this-is-a-test")).toEqual("this-is-a-test");
	});

	test("can convert name to kebab case from title case", () => {
		expect(StringHelper.kebabCase("This Is A Test")).toEqual("this-is-a-test");
	});

	test("can convert interface name to kebab case from Pascal case", () => {
		expect(StringHelper.kebabCase("IThisIsATest")).toEqual("this-is-a-test");
	});

	test("can convert interface name to kebab case from camel case", () => {
		expect(StringHelper.kebabCase("IThisIsATest")).toEqual("this-is-a-test");
	});

	test("can convert name to snake case from Pascal case", () => {
		expect(StringHelper.snakeCase("ThisIsATest")).toEqual("this_is_a_test");
	});

	test("can convert name to snake case from camel case", () => {
		expect(StringHelper.snakeCase("thisIsATest")).toEqual("this_is_a_test");
	});

	test("can convert name to snake case from snake case", () => {
		expect(StringHelper.snakeCase("this_is_a_test")).toEqual("this_is_a_test");
	});

	test("can convert name to snake case from title case", () => {
		expect(StringHelper.snakeCase("This Is A Test")).toEqual("this_is_a_test");
	});

	test("can convert interface name to snake case from Pascal case", () => {
		expect(StringHelper.snakeCase("IThisIsATest")).toEqual("this_is_a_test");
	});

	test("can convert interface name to snake case from camel case", () => {
		expect(StringHelper.snakeCase("IThisIsATest")).toEqual("this_is_a_test");
	});

	test("can convert name to camel case from Pascal case", () => {
		expect(StringHelper.camelCase("ThisIsATest")).toEqual("thisIsATest");
	});

	test("can convert name to camel case from camel case", () => {
		expect(StringHelper.camelCase("thisIsATest")).toEqual("thisIsATest");
	});

	test("can convert name to camel case from kebab case", () => {
		expect(StringHelper.camelCase("this-is-a-test")).toEqual("thisIsATest");
	});

	test("can convert name to camel case from title case", () => {
		expect(StringHelper.camelCase("This Is A Test")).toEqual("thisIsATest");
	});

	test("can convert interface name to camel case from Pascal case", () => {
		expect(StringHelper.camelCase("IThisIsATest")).toEqual("thisIsATest");
	});

	test("can convert interface name to camel case from camel case", () => {
		expect(StringHelper.camelCase("IThisIsATest")).toEqual("thisIsATest");
	});

	test("can convert name to title case from Pascal case", () => {
		expect(StringHelper.titleCase("ThisIsATest")).toEqual("This Is A Test");
	});

	test("can convert name to title case from camel case", () => {
		expect(StringHelper.titleCase("thisIsATest")).toEqual("This Is A Test");
	});

	test("can convert name to title case from kebab case", () => {
		expect(StringHelper.titleCase("this-is-a-test")).toEqual("This Is A Test");
	});

	test("can convert name to title case from title case", () => {
		expect(StringHelper.titleCase("This Is A Test")).toEqual("This Is A Test");
	});

	test("can convert interface name to title case from Pascal case", () => {
		expect(StringHelper.titleCase("IThisIsATest")).toEqual("This Is A Test");
	});

	test("can convert interface name to title case from camel case", () => {
		expect(StringHelper.titleCase("IThisIsATest")).toEqual("This Is A Test");
	});

	test("can convert name to Pascal case from Pascal case", () => {
		expect(StringHelper.pascalCase("ThisIsATest")).toEqual("ThisIsATest");
	});

	test("can convert name to Pascal case from camel case", () => {
		expect(StringHelper.pascalCase("thisIsATest")).toEqual("ThisIsATest");
	});

	test("can convert name to Pascal case from kebab case", () => {
		expect(StringHelper.pascalCase("this-is-a-test")).toEqual("ThisIsATest");
	});

	test("can convert name to Pascal case from title case", () => {
		expect(StringHelper.pascalCase("This Is A Test")).toEqual("ThisIsATest");
	});

	test("can convert interface name to Pascal case from Pascal case", () => {
		expect(StringHelper.pascalCase("IThisIsATest")).toEqual("ThisIsATest");
	});

	test("can convert interface name to Pascal case from camel case", () => {
		expect(StringHelper.pascalCase("IThisIsATest")).toEqual("ThisIsATest");
	});
});
