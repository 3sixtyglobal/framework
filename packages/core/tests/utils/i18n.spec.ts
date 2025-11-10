// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { describe, it, expect } from "vitest";
import { I18n } from "../../src/utils/i18n.js";
import { SharedStore } from "../../src/utils/sharedStore.js";

describe("I18n", () => {
	describe("formatMessage", () => {
		beforeEach(() => {
			I18n.setLocale("en");
			I18n.addDictionary("en", {
				app: {
					greeting: "Hello {name}",
					count: "You have {count, number} items",
					plural: "{count, plural, one {# item} other {# items}}",
					select: "{gender, select, male {He} female {She} other {They}} is here",
					mixed: "{name} has {count, number} items on {date, date, short}",
					fallbackMissing: "Missing prop {missing} end",
					complex: "{count, plural, one {{name} added # item} other {{name} added # items}}"
				}
			});
			I18n.addDictionary("fr", {
				app: {
					greeting: "Bonjour {name}",
					plural: "{count, plural, one {# élément} other {# éléments}}"
				}
			});
		});

		afterEach(() => {
			SharedStore.remove("i18n");
		});

		it("formats a simple message with substitution", () => {
			const result = I18n.formatMessage("app.greeting", { name: "Alice" });
			expect(result).toBe("Hello Alice");
		});

		it("formats using overrideLocale when provided", () => {
			const result = I18n.formatMessage("app.greeting", { name: "Claire" }, "fr");
			expect(result).toBe("Bonjour Claire");
		});

		it("returns missing locale indicator when locale not loaded", () => {
			const result = I18n.formatMessage("app.greeting", { name: "Alice" }, "es");
			expect(result).toBe("!!Missing es");
		});

		it("returns missing key indicator when key absent", () => {
			const result = I18n.formatMessage("app.unknown", {});
			expect(result).toBe("!!Missing en.app.unknown");
		});

		it("returns raw key when current locale is debug-k", () => {
			I18n.setLocale("debug-k");
			const result = I18n.formatMessage("app.greeting", { name: "Alice" });
			expect(result).toBe("app.greeting");
		});

		it("scrambles output when current locale is debug-x", () => {
			I18n.setLocale("debug-x");
			// Need dictionary under effective locale en (debug-x maps to DEFAULT_LOCALE for lookup)
			const result = I18n.formatMessage("app.greeting", { name: "Bob" });
			// "Hello Bob" -> letters become x, digits become n -> length preserved
			expect(result).toMatch(/^x{5} x{3}$/); // Pattern with spaces and length retained
		});

		it("formats number placeholders", () => {
			const result = I18n.formatMessage("app.count", { count: 1234 });
			// In en locale default, number formatting adds grouping -> 1,234
			expect(result).toBe("You have 1,234 items");
		});

		it("formats plural correctly (one)", () => {
			const result = I18n.formatMessage("app.plural", { count: 1 });
			expect(result).toBe("1 item");
		});

		it("formats plural correctly (other)", () => {
			const result = I18n.formatMessage("app.plural", { count: 5 });
			expect(result).toBe("5 items");
		});

		it("formats select correctly", () => {
			const result = I18n.formatMessage("app.select", { gender: "female" });
			expect(result).toBe("She is here");
		});

		it("handles missing substitution by retrying with blank value", () => {
			// missing property 'missing' should be filled with '' on retry
			const result = I18n.formatMessage("app.fallbackMissing", {});
			expect(result).toBe("Missing prop  end");
		});

		it("handles complex nested plural with additional placeholder", () => {
			const one = I18n.formatMessage("app.complex", { count: 1, name: "Eve" });
			expect(one).toBe("Eve added 1 item");
			const many = I18n.formatMessage("app.complex", { count: 3, name: "Eve" });
			expect(many).toBe("Eve added 3 items");
		});

		it("flattens nested dictionary keys for lookup", () => {
			// Confirm nested path retrieval uses flattened keys
			const result = I18n.formatMessage("app.greeting", { name: "Nested" });
			expect(result).toBe("Hello Nested");
		});
	});

	describe("getPropertyNames", () => {
		it("extracts single property from simple placeholder", () => {
			const props = I18n.getPropertyNames("Hello {name}");
			expect(props).toEqual(["name"]);
		});

		it("extracts multiple properties from message", () => {
			const props = I18n.getPropertyNames("Hello {firstName} {lastName}");
			expect(props.sort()).toEqual(["firstName", "lastName"]);
		});

		it("extracts property from number format", () => {
			const props = I18n.getPropertyNames("You have {count, number} items");
			expect(props).toEqual(["count"]);
		});

		it("extracts property from date format", () => {
			const props = I18n.getPropertyNames("Today is {date, date, short}");
			expect(props).toEqual(["date"]);
		});

		it("extracts property from time format", () => {
			const props = I18n.getPropertyNames("The time is {time, time, medium}");
			expect(props).toEqual(["time"]);
		});

		it("extracts property from plural format", () => {
			const props = I18n.getPropertyNames("{count, plural, one {# item} other {# items}}");
			expect(props).toEqual(["count"]);
		});

		it("extracts property from select format", () => {
			const props = I18n.getPropertyNames("{gender, select, male {He} female {She} other {They}}");
			expect(props).toEqual(["gender"]);
		});

		it("extracts property from selectordinal format", () => {
			const props = I18n.getPropertyNames(
				"{position, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}"
			);
			expect(props).toEqual(["position"]);
		});

		it("extracts multiple properties from complex message", () => {
			const props = I18n.getPropertyNames(
				"Hello {name}, you have {count, plural, one {# message} other {# messages}}"
			);
			expect(props.sort()).toEqual(["count", "name"]);
		});

		it("extracts properties from nested plural with placeholders", () => {
			const props = I18n.getPropertyNames(
				"{count, plural, one {You have # item from {source}} other {You have # items from {source}}}"
			);
			expect(props.sort()).toEqual(["count", "source"]);
		});

		it("handles message with no properties", () => {
			const props = I18n.getPropertyNames("This is a simple message");
			expect(props).toEqual([]);
		});

		it("handles empty string", () => {
			const props = I18n.getPropertyNames("");
			expect(props).toEqual([]);
		});

		it("deduplicates repeated properties", () => {
			const props = I18n.getPropertyNames("{name} said hello to {name}");
			expect(props).toEqual(["name"]);
		});

		it("extracts properties with underscores and numbers", () => {
			const props = I18n.getPropertyNames("User {user_id} has {item_count_2} items");
			expect(props.sort()).toEqual(["item_count_2", "user_id"]);
		});

		it("extracts properties from select with nested placeholders", () => {
			const props = I18n.getPropertyNames(
				"{gender, select, male {His name is {name}} female {Her name is {name}} other {Their name is {name}}}"
			);
			expect(props.sort()).toEqual(["gender", "name"]);
		});

		it("handles complex nested structures", () => {
			const props = I18n.getPropertyNames(
				"{itemCount, plural, =0 {No items} one {{userName} has # item} other {{userName} has # items in {location}}}"
			);
			expect(props.sort()).toEqual(["itemCount", "location", "userName"]);
		});
	});
});
