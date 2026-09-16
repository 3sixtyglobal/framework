// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { FacadeFactory } from "../../src/factories/facadeFactory.js";
import { Factory } from "../../src/factories/factory.js";
import type { IFacade } from "../../src/models/IFacade.js";
import { Is } from "../../src/utils/is.js";

class TestComponent {
	public value: number;

	constructor() {
		this.value = 1;
	}

	public className(): string {
		return "TestComponent";
	}

	public double(n: number): number {
		return n * 2;
	}

	public async fetch(id: string): Promise<string> {
		return `fetched:${id}`;
	}

	public async fail(): Promise<void> {
		throw new RangeError("out of range");
	}
}

let calls: string[] = [];

/**
 * Facade which records the methods called through it and otherwise passes everything through.
 */
class RecordingFacade implements IFacade {
	private readonly _label: string;

	constructor(label: string) {
		this._label = label;
	}

	public wrap(target: unknown): unknown {
		const label = this._label;

		return new Proxy(target as object, {
			get(t, prop, receiver): unknown {
				const value = Reflect.get(t, prop, receiver);

				if (!Is.function(value) || !Is.string(prop)) {
					return value;
				}

				return (...args: unknown[]): unknown => {
					calls.push(`${label}:${String(prop)}`);
					return value.apply(t, args);
				};
			}
		});
	}
}

describe("Factory facades", () => {
	let factory: Factory<TestComponent>;

	beforeEach(() => {
		calls = [];
		FacadeFactory.clear();
		FacadeFactory.register("first", () => new RecordingFacade("first"));
		FacadeFactory.register("second", () => new RecordingFacade("second"));

		factory = Factory.createFactory<TestComponent>("facade-test");
		factory.clear();
		factory.register("test", () => new TestComponent());
	});

	test("no facade by default and instances are untouched", () => {
		expect(factory.get("test").double(3)).toEqual(6);
		expect(calls).toEqual([]);
	});

	test("useFacade wraps every instance the factory produces", () => {
		factory.useFacade("first");

		expect(factory.get("test").double(3)).toEqual(6);
		expect(calls).toEqual(["first:double"]);
	});

	test("an instance is passed through the facades in the order they were activated", () => {
		factory.useFacade("first");
		factory.useFacade("second");

		factory.get("test").double(1);

		expect(calls).toEqual(["first:double", "second:double"]);
	});

	test("activating the same facade twice has no further effect", () => {
		factory.useFacade("first");
		factory.useFacade("first");

		factory.get("test").double(1);

		expect(calls).toEqual(["first:double"]);
	});

	test("useFacade fails when the facade is not registered", () => {
		expect(() => factory.useFacade("missing")).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "factory.noFacade"
			})
		);
	});

	test("unuseFacade restores the original behaviour for subsequent gets", () => {
		factory.useFacade("first");
		factory.get("test").double(1);
		expect(calls).toEqual(["first:double"]);

		factory.unuseFacade("first");
		calls = [];

		expect(factory.get("test").double(3)).toEqual(6);
		expect(calls).toEqual([]);
	});

	test("deactivating a facade which is not active does nothing", () => {
		factory.useFacade("first");
		factory.unuseFacade("second");

		factory.get("test").double(1);

		expect(calls).toEqual(["first:double"]);
	});

	test("the same instance is returned across repeated gets", () => {
		factory.useFacade("first");

		expect(factory.get("test")).toBe(factory.get("test"));
	});

	test("a synchronous method stays synchronous", () => {
		factory.useFacade("first");

		expect(factory.get("test").double(4)).toEqual(8);
	});

	test("an asynchronous method resolves to the original value", async () => {
		factory.useFacade("first");

		await expect(factory.get("test").fetch("x")).resolves.toEqual("fetched:x");
	});

	test("a thrown error keeps its type and message", async () => {
		factory.useFacade("first");

		await expect(factory.get("test").fail()).rejects.toThrow(RangeError);
		await expect(factory.get("test").fail()).rejects.toThrow("out of range");
	});

	test("properties are readable and writable through the facade", () => {
		factory.useFacade("first");

		const instance = factory.get("test");
		expect(instance.value).toEqual(1);
		instance.value = 5;
		expect(instance.value).toEqual(5);
	});

	test("reset discards the wrapped instances but keeps the facades active", () => {
		factory.useFacade("first");
		const before = factory.get("test");

		factory.reset();
		const after = factory.get("test");

		expect(after).not.toBe(before);
		after.double(1);
		expect(calls).toEqual(["first:double"]);
	});

	test("getIfExists applies the facades", () => {
		factory.useFacade("first");

		factory.getIfExists("test")?.double(1);

		expect(calls).toEqual(["first:double"]);
	});

	test("createIfExists applies the facades", () => {
		factory.useFacade("first");

		factory.createIfExists("test")?.double(1);

		expect(calls).toEqual(["first:double"]);
	});

	test("unregistering a facade does not affect a factory which already activated it", () => {
		factory.useFacade("first");
		FacadeFactory.unregister("first");
		factory.reset();

		expect(factory.get("test").double(3)).toEqual(6);
		expect(calls).toEqual(["first:double"]);
	});

	test("replacing a facade registration does not affect an already activated factory", () => {
		factory.useFacade("first");
		FacadeFactory.register("first", () => new RecordingFacade("replaced"));

		factory.get("test").double(1);

		expect(calls).toEqual(["first:double"]);
	});

	test("facades cannot be applied to the facade factory itself", () => {
		expect(() => FacadeFactory.useFacade("first")).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "factory.noFacadeOnFacades"
			})
		);
	});

	test("a facade which returns nothing is reported rather than looking like a missing instance", () => {
		FacadeFactory.register("nothing", () => ({ wrap: () => undefined }) as never);
		factory.useFacade("nothing");

		expect(() => factory.get("test")).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "factory.noFacadeWrap"
			})
		);
	});

	test("instancesMap and instancesList are unwrapped by default", () => {
		factory.useFacade("first");
		factory.get("test");
		calls = [];

		factory.instancesMap().test.double(1);
		factory.instancesList()[0].double(1);

		expect(calls).toEqual([]);
	});

	test("instancesMap and instancesList apply the facades when wrapped is set", () => {
		factory.useFacade("first");
		factory.get("test");
		calls = [];

		factory.instancesMap(true).test.double(1);
		factory.instancesList(true)[0].double(1);

		expect(calls).toEqual(["first:double", "first:double"]);
	});

	test("does not apply a facade to an excluded instance type", () => {
		factory.register("other", () => new TestComponent());
		factory.useFacade("first", [/^test$/]);

		factory.get("other").double(1);
		factory.get("test").double(1);

		// Only the instance type which was not excluded is recorded.
		expect(calls).toEqual(["first:double"]);
	});

	test("excludes every instance type matching the pattern", () => {
		factory.register("test-other", () => new TestComponent());
		factory.register("keep", () => new TestComponent());
		factory.useFacade("first", [/^test/]);

		factory.get("test").double(1);
		factory.get("test-other").double(1);
		factory.get("keep").double(1);

		// Both of the names starting with "test" are excluded.
		expect(calls).toEqual(["first:double"]);
	});

	test("excludes an instance type matching any of the patterns", () => {
		factory.register("other", () => new TestComponent());
		factory.register("keep", () => new TestComponent());
		factory.useFacade("first", [/^test$/, /^other$/]);

		factory.get("test").double(1);
		factory.get("other").double(1);
		factory.get("keep").double(1);

		expect(calls).toEqual(["first:double"]);
	});

	test("excludes consistently for a pattern with the global flag", () => {
		factory.register("test-other", () => new TestComponent());
		factory.useFacade("first", [/test/g]);

		factory.get("test").double(1);
		factory.get("test-other").double(1);

		expect(calls).toEqual([]);
	});

	test("excludes an instance type from create as well as get", () => {
		factory.useFacade("first", [/^test$/]);

		factory.create("test").double(1);

		expect(calls).toEqual([]);
	});

	test("applies the other facades to an instance one of them excludes", () => {
		factory.useFacade("first", [/^test$/]);
		factory.useFacade("second");

		factory.get("test").double(1);

		// "first" skips it, "second" does not.
		expect(calls).toEqual(["second:double"]);
	});

	test("clear removes the facades along with the generators", () => {
		factory.useFacade("first");
		factory.clear();
		factory.register("test", () => new TestComponent());

		factory.get("test").double(1);

		expect(calls).toEqual([]);
	});
});
