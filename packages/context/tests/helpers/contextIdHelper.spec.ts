// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Guards } from "@twin.org/core";
import { ContextIdHandlerFactory } from "../../src/factories/contextIdHandlerFactory.js";
import { ContextIdHelper } from "../../src/helpers/contextIdHelper.js";
import type { IContextIdHandler } from "../../src/models/IContextIdHandler.js";

/**
 * Test handler implementing context ID handling logic for unit tests.
 */
class TestContextIdHandler implements IContextIdHandler {
	/**
	 * The class name of the component.
	 * @returns The class name.
	 */
	public className(): string {
		return "TestContextIdHandler";
	}

	/**
	 * Provide a short form (first 4 chars) of the context id.
	 * @param value The full context id value.
	 * @returns Short form string.
	 */
	public short(value: string): string {
		return value.slice(0, 4);
	}

	/**
	 * Expand a short form context id by appending "-EXPANDED".
	 * @param value The short context id value.
	 * @returns Long form string.
	 */
	public long(value: string): string {
		return `${value}-EXPANDED`;
	}

	/**
	 * Guard the value ensuring length.
	 * @param value The value to guard.
	 * @throws GeneralError if the value is too short.
	 */
	public guard(value: string): void {
		Guards.stringValue("TestContextIdHandler", "value", value);
	}
}

/**
 * Handler that mirrors the DID handler pattern: short strips a known prefix,
 * long restores it, making the pair a true inverse.
 */
class PrefixContextIdHandler implements IContextIdHandler {
	private static readonly _PREFIX = "did:twin:";

	private static readonly _PREFIX_INTERNAL = "did:internal:";

	/**
	 * The class name of the component.
	 * @returns The class name.
	 */
	public className(): string {
		return "PrefixContextIdHandler";
	}

	/**
	 * Strip the "did:twin:" prefix to produce a short ID.
	 * @param value The full context id value.
	 * @returns The bare ID without the prefix.
	 */
	public short(value: string): string {
		return value.startsWith(PrefixContextIdHandler._PREFIX)
			? value.slice(PrefixContextIdHandler._PREFIX.length)
			: value;
	}

	/**
	 * Prepend "did:twin:" to expand a short ID back to the full form.
	 * @param value The short context id value.
	 * @returns The full context id with the prefix restored.
	 */
	public long(value: string): string {
		return `${PrefixContextIdHandler._PREFIX_INTERNAL}${value}`;
	}
}

describe("ContextIdHelper", () => {
	beforeAll(() => {
		ContextIdHandlerFactory.register("organization", () => new TestContextIdHandler());
		ContextIdHandlerFactory.register("user", () => new TestContextIdHandler());
		ContextIdHandlerFactory.register("node", () => new TestContextIdHandler());
		ContextIdHandlerFactory.register("identity", () => new PrefixContextIdHandler());
		ContextIdHandlerFactory.register("tenant", () => new PrefixContextIdHandler());
	});

	it("guard throws when key missing", () => {
		const ctx = { organization: "ORG1234" };
		expect(() => ContextIdHelper.guard(ctx, "user")).toThrow(
			expect.objectContaining({ name: "GeneralError", message: "contextIdHelper.contextIdMissing" })
		);
	});

	it("guard delegates to handler and passes", () => {
		const ctx = { organization: "ORG1234" };
		expect(() => ContextIdHelper.guard(ctx, "organization")).not.toThrow();
	});

	it("guard delegates to handler and fails", () => {
		const ctx = { organization: "" };
		expect(() => ContextIdHelper.guard(ctx, "organization")).toThrow(
			expect.objectContaining({ name: "GuardError", message: "guard.stringEmpty" })
		);
	});

	it("short returns handler short value", () => {
		const ctx = { organization: "ORG-ACCOUNT-123" };
		expect(ContextIdHelper.short(ctx, "organization")).toEqual("ORG-");
	});

	it("long returns handler long value", () => {
		const ctx = { organization: "ORG-" };
		expect(ContextIdHelper.long(ctx, "organization")).toEqual("ORG--EXPANDED");
	});

	it("long falls back to raw value when handler has no long method", () => {
		const ctx = { unregistered: "RAW-VALUE" };
		expect(ContextIdHelper.long(ctx, "unregistered")).toEqual("RAW-VALUE");
	});

	it("long throws when key is missing", () => {
		const ctx = { organization: "ORG1234" };
		expect(() => ContextIdHelper.long(ctx, "user")).toThrow(
			expect.objectContaining({ name: "GeneralError", message: "contextIdHelper.contextIdMissing" })
		);
	});

	it("longAll returns object of long versions", () => {
		const ctx = { organization: "ORG-", user: "USER" };
		const longs = ContextIdHelper.longAll(ctx, ["organization", "user"]);
		expect(longs).toEqual({ organization: "ORG--EXPANDED", user: "USER-EXPANDED" });
	});

	it("longAll returns empty object when keys is undefined", () => {
		const ctx = { organization: "ORG-" };
		expect(ContextIdHelper.longAll(ctx, undefined)).toEqual({});
	});

	it("longAll returns empty object when keys is empty", () => {
		const ctx = { organization: "ORG-" };
		expect(ContextIdHelper.longAll(ctx, [])).toEqual({});
	});

	it("shortAll returns object of shorts", () => {
		const ctx = { organization: "ORG-ACCOUNT-123", user: "USER-9999" };
		const shorts = ContextIdHelper.shortAll(ctx, ["organization", "user"]);
		expect(shorts).toEqual({ organization: "ORG-", user: "USER" });
	});

	it("shortCombined returns joined shorts", () => {
		const ctx = { organization: "ORG-ACCOUNT-123", user: "USER-9999", node: "node-5555" };
		const combined = ContextIdHelper.shortCombined(ctx, ["organization", "user", "node"]);
		expect(combined).toEqual("ORG-/USER/node");
	});

	it("shortSplit splits combined back to mapping", () => {
		const combined = "ORG-/USER/NODE";
		const split = ContextIdHelper.shortSplit(["organization", "user", "node"], combined);
		expect(split).toEqual({ organization: "ORG-", user: "USER", node: "NODE" });
	});

	it("shortSplit succeeds with exact match of parts and keys", () => {
		const combined = "ABCD/EFGH/IJKL";
		const split = ContextIdHelper.shortSplit(["key1", "key2", "key3"], combined);
		expect(split).toEqual({ key1: "ABCD", key2: "EFGH", key3: "IJKL" });
	});

	it("shortSplit throws when parts mismatch keys length", () => {
		const combined = "ORG-/USER"; // missing node part
		expect(() => ContextIdHelper.shortSplit(["organization", "user", "node"], combined)).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "contextIdHelper.contextIdSplitMismatch"
			})
		);
	});

	describe("guardAll", () => {
		it("validates all keys successfully when all present", () => {
			const ctx = { organization: "ORG1234", user: "USER5678" };
			expect(() => ContextIdHelper.guardAll(ctx, ["organization", "user"])).not.toThrow();
		});

		it("throws when any key is missing", () => {
			const ctx = { organization: "ORG1234" };
			expect(() => ContextIdHelper.guardAll(ctx, ["organization", "user"])).toThrow(
				expect.objectContaining({
					name: "GeneralError",
					message: "contextIdHelper.contextIdMissing"
				})
			);
		});

		it("throws when any value fails handler guard", () => {
			const ctx = { organization: "", user: "USER5678" };
			expect(() => ContextIdHelper.guardAll(ctx, ["organization", "user"])).toThrow(
				expect.objectContaining({ name: "GuardError", message: "guard.stringEmpty" })
			);
		});

		it("handles empty keys array without error", () => {
			const ctx = { organization: "ORG1234" };
			expect(() => ContextIdHelper.guardAll(ctx, [])).not.toThrow();
		});

		it("handles undefined keys array without error", () => {
			const ctx = { organization: "ORG1234" };
			expect(() => ContextIdHelper.guardAll(ctx, undefined)).not.toThrow();
		});

		it("validates multiple keys in order, stopping at first error", () => {
			const ctx = { organization: "ORG1234" };
			// Should fail on 'user' (missing) before checking 'node'
			expect(() => ContextIdHelper.guardAll(ctx, ["organization", "user", "node"])).toThrow(
				expect.objectContaining({
					name: "GeneralError",
					message: "contextIdHelper.contextIdMissing"
				})
			);
		});

		it("narrows type after successful guardAll", () => {
			const ctx: { organization?: string; user?: string } = {
				organization: "ORG1234",
				user: "USER5678"
			};

			ContextIdHelper.guardAll(ctx, ["organization", "user"] as const);

			// After guardAll, TypeScript knows these are defined strings
			const org: string = ctx.organization; // No optional chaining needed
			const usr: string = ctx.user; // No optional chaining needed

			expect(org).toBe("ORG1234");
			expect(usr).toBe("USER5678");
		});

		it("validates three or more keys", () => {
			const ctx = {
				organization: "ORG1234",
				user: "USER5678",
				node: "NODE9999"
			};
			expect(() => ContextIdHelper.guardAll(ctx, ["organization", "user", "node"])).not.toThrow();
		});

		it("throws on second key failure", () => {
			const ctx = { organization: "ORG1234", user: "" };
			expect(() => ContextIdHelper.guardAll(ctx, ["organization", "user"])).toThrow(
				expect.objectContaining({ name: "GuardError", message: "guard.stringEmpty" })
			);
		});
	});

	describe("round-trip", () => {
		it("short value is preserved inside the expanded long form for a single key", () => {
			const fullId = "did:twin:abc123xyz";
			const shortened = ContextIdHelper.short({ identity: fullId }, "identity");
			const expanded = ContextIdHelper.long({ identity: shortened }, "identity");
			expect(expanded).toContain(shortened);
		});

		it("short value is preserved inside the expanded long form for a different ID", () => {
			const fullId = "did:twin:0xdeadbeef";
			const shortened = ContextIdHelper.short({ identity: fullId }, "identity");
			const expanded = ContextIdHelper.long({ identity: shortened }, "identity");
			expect(expanded).toContain(shortened);
		});

		it("shortAll then longAll embeds each short value in the expanded form", () => {
			const originals = {
				identity: "did:twin:alice",
				tenant: "did:twin:acme-corp"
			};
			const shorts = ContextIdHelper.shortAll(originals, ["identity", "tenant"]);
			const expanded = ContextIdHelper.longAll(shorts, ["identity", "tenant"]);
			expect(expanded.identity).toContain(shorts.identity);
			expect(expanded.tenant).toContain(shorts.tenant);
		});

		it("short produces a value shorter than the original", () => {
			const fullId = "did:twin:abc123";
			const shortened = ContextIdHelper.short({ identity: fullId }, "identity");
			expect(shortened.length).toBeLessThan(fullId.length);
		});

		it("long of short expands to a value longer than the short form", () => {
			const fullId = "did:twin:abc123";
			const shortened = ContextIdHelper.short({ identity: fullId }, "identity");
			const expanded = ContextIdHelper.long({ identity: shortened }, "identity");
			expect(expanded.length).toBeGreaterThan(shortened.length);
		});
	});
});
