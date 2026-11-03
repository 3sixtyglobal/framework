// Copyright 2024 IOTA Stiftung.
// Copyright 2026 3Sixty Trade Ltd.
// SPDX-License-Identifier: Apache-2.0.
import { JsonHelper } from "../../src/helpers/jsonHelper.js";
import { Is } from "../../src/utils/is.js";

describe("JsonHelper", () => {
	test("can canonicalize undefined", () => {
		expect(JsonHelper.canonicalize(undefined)).toEqual("");
	});

	test("can canonicalize null", () => {
		expect(JsonHelper.canonicalize(null)).toEqual("null");
	});

	test("can canonicalize a string", () => {
		expect(JsonHelper.canonicalize("foo")).toEqual('"foo"');
	});

	test("can canonicalize a number", () => {
		expect(JsonHelper.canonicalize(5)).toEqual("5");
	});

	test("can canonicalize a boolean", () => {
		expect(JsonHelper.canonicalize(true)).toEqual("true");
	});

	test("can canonicalize a date", () => {
		expect(JsonHelper.canonicalize(new Date(Date.UTC(1974, 7, 16, 9, 10, 11, 123)))).toEqual(
			'"1974-08-16T09:10:11.123Z"'
		);
	});

	test("can canonicalize an array and keep order", () => {
		expect(JsonHelper.canonicalize([1, 2, 3])).toEqual("[1,2,3]");
	});

	test("can canonicalize an array including undefined properties", () => {
		expect(JsonHelper.canonicalize([1, 2, undefined, 3])).toEqual("[1,2,null,3]");
	});

	test("can canonicalize an object and sort properties", () => {
		expect(JsonHelper.canonicalize({ b: 1, a: 2 })).toEqual('{"a":2,"b":1}');
	});

	test("can canonicalize an object and ignore undefined properties", () => {
		expect(JsonHelper.canonicalize({ b: 1, a: 2, c: undefined })).toEqual('{"a":2,"b":1}');
	});

	test("can canonicalize a complex object", () => {
		expect(
			JsonHelper.canonicalize({
				t: "foo",
				n: 43,
				dt: new Date(Date.UTC(1974, 7, 16, 9, 10, 11, 123)),
				arr: [1, 2, 3, { b: 123, a: "foo", c: undefined }, undefined]
			})
		).toEqual(
			'{"arr":[1,2,3,{"a":"foo","b":123},null],"dt":"1974-08-16T09:10:11.123Z","n":43,"t":"foo"}'
		);
	});

	test("can stringify an object with extended types", () => {
		expect(
			JsonHelper.stringifyEx({
				str: "foo",
				num: 123,
				bool: true,
				array: [1, 2, 3],
				object: { foo: "bar" },
				dt: new Date(Date.UTC(1974, 7, 16, 9, 10, 11, 123)),
				bigint: BigInt(123),
				uint8: new Uint8Array([1, 2, 3])
			})
		).toEqual(
			'{"str":"foo","num":123,"bool":true,"array":[1,2,3],"object":{"foo":"bar"},"dt":{"@ext":"date","value":145876211123},"bigint":{"@ext":"bigint","value":"123"},"uint8":{"@ext":"uint8array","value":"AQID"}}'
		);
	});

	test("can stringify an object with a circular reference", () => {
		const obj: { [key: string]: unknown } = { a: 1 };
		obj.self = obj;
		expect(JsonHelper.stringifyEx(obj)).toEqual('{"a":1,"self":{"@ext":"circular","value":0}}');
	});

	test("can stringify an object with a nested circular reference", () => {
		const child: { [key: string]: unknown } = { b: 2 };
		const obj = { a: { child } };
		child.parent = obj.a;
		child.root = obj;
		expect(JsonHelper.stringifyEx(obj)).toEqual(
			'{"a":{"child":{"b":2,"parent":{"@ext":"circular","value":1},"root":{"@ext":"circular","value":0}}}}'
		);
	});

	test("can stringify an array with a circular reference", () => {
		const arr: unknown[] = [1];
		arr.push(arr);
		arr.push({ arr });
		expect(JsonHelper.stringifyEx(arr)).toEqual(
			'[1,{"@ext":"circular","value":0},{"arr":{"@ext":"circular","value":0}}]'
		);
	});

	test("can stringify an object referenced more than once without a cycle", () => {
		const shared = { x: 1 };
		expect(
			JsonHelper.stringifyEx({ a: shared, b: shared, c: { d: shared }, e: [shared, shared] })
		).toEqual('{"a":{"x":1},"b":{"x":1},"c":{"d":{"x":1}},"e":[{"x":1},{"x":1}]}');
	});

	test("can stringify a circular reference with extended types", () => {
		const obj: { [key: string]: unknown } = { bigint: BigInt(1), uint8: new Uint8Array([1]) };
		obj.self = obj;
		expect(JsonHelper.stringifyEx(obj)).toEqual(
			'{"bigint":{"@ext":"bigint","value":"1"},"uint8":{"@ext":"uint8array","value":"AQ=="},"self":{"@ext":"circular","value":0}}'
		);
	});

	test("can stringify symbols", () => {
		expect(JsonHelper.stringifyEx(Symbol("top"))).toEqual('{"@ext":"symbol","value":"top"}');
		expect(
			JsonHelper.stringifyEx({
				s: Symbol("nested"),
				g: Symbol.for("app.key"),
				arr: [Symbol(undefined)]
			})
		).toEqual(
			'{"s":{"@ext":"symbol","value":"nested"},"g":{"@ext":"symbol","value":"app.key","global":true},"arr":[{"@ext":"symbol"}]}'
		);
	});

	test("can round trip symbols", () => {
		const parsed = JsonHelper.parseEx(
			JsonHelper.stringifyEx({ s: Symbol("local"), g: Symbol.for("app.key"), e: Symbol(undefined) })
		);
		expect(Is.symbol(parsed.s)).toEqual(true);
		expect(parsed.s.description).toEqual("local");
		expect(parsed.g).toBe(Symbol.for("app.key"));
		expect(Is.symbol(parsed.e)).toEqual(true);
		expect(parsed.e.description).toBeUndefined();
	});

	test("can round trip circular references", () => {
		const child: { [key: string]: unknown } = { b: 2 };
		const obj: { [key: string]: unknown } = { a: { child }, arr: [1] };
		child.parent = obj.a;
		child.root = obj;
		(obj.arr as unknown[]).push(obj.arr);
		obj.self = obj;
		const parsed = JsonHelper.parseEx(JsonHelper.stringifyEx(obj));
		expect(parsed.self).toBe(parsed);
		expect(parsed.a.child.parent).toBe(parsed.a);
		expect(parsed.a.child.root).toBe(parsed);
		expect(parsed.arr[1]).toBe(parsed.arr);
		expect(parsed.a.child.b).toEqual(2);
	});

	test("can round trip an object referenced more than once without a cycle", () => {
		const shared = { x: BigInt(1) };
		const parsed = JsonHelper.parseEx(JsonHelper.stringifyEx({ a: shared, b: shared }));
		expect(parsed).toEqual({ a: { x: BigInt(1) }, b: { x: BigInt(1) } });
		expect(parsed.a).not.toBe(parsed.b);
	});

	test("does not restore an invalid circular reference", () => {
		expect(
			JsonHelper.parseEx('{"a":{"@ext":"circular","value":5},"b":{"@ext":"circular","value":-1}}')
		).toEqual({
			a: { "@ext": "circular", value: 5 },
			b: { "@ext": "circular", value: -1 }
		});
	});

	test("can stringify with indentation", () => {
		expect(JsonHelper.stringifyEx({ a: [1] }, 2)).toEqual(JSON.stringify({ a: [1] }, undefined, 2));
	});

	test("can stringify values using toJSON", () => {
		const custom = { toJSON: (): unknown => ({ custom: true, n: BigInt(2) }) };
		expect(JsonHelper.stringifyEx({ custom })).toEqual(
			'{"custom":{"custom":true,"n":{"@ext":"bigint","value":"2"}}}'
		);
	});

	test("can stringify values JSON does not support", () => {
		expect(
			JsonHelper.stringifyEx({
				u: undefined,
				f: (): void => {},
				arr: [undefined, (): void => {}],
				nan: Number.NaN,
				invalidDate: new Date("x")
			})
		).toEqual('{"arr":[null,null],"nan":null,"invalidDate":null}');
	});

	test("can round trip a value with extended types", () => {
		const value = {
			dt: new Date(Date.UTC(1974, 7, 16)),
			bigint: BigInt(123),
			uint8: new Uint8Array([1, 2, 3]),
			nested: [{ big: BigInt(-1) }]
		};
		expect(JsonHelper.parseEx(JsonHelper.stringifyEx(value))).toEqual(value);
	});

	test("can convert a value to extended JSON", () => {
		const value: { [key: string]: unknown } = {
			dt: new Date(Date.UTC(1974, 7, 16)),
			bigint: BigInt(1),
			uint8: new Uint8Array([1]),
			s: Symbol("a"),
			nested: [{ str: "foo" }]
		};
		value.self = value;
		expect(JsonHelper.toExtendedJson(value)).toEqual({
			dt: { "@ext": "date", value: 145843200000 },
			bigint: { "@ext": "bigint", value: "1" },
			uint8: { "@ext": "uint8array", value: "AQ==" },
			s: { "@ext": "symbol", value: "a" },
			nested: [{ str: "foo" }],
			self: { "@ext": "circular", value: 0 }
		});
	});

	test("can convert a primitive value to extended JSON", () => {
		expect(JsonHelper.toExtendedJson("foo")).toEqual("foo");
		expect(JsonHelper.toExtendedJson(1)).toEqual(1);
		expect(JsonHelper.toExtendedJson(null)).toEqual(null);
		expect(JsonHelper.toExtendedJson(undefined)).toEqual(undefined);
		expect(JsonHelper.toExtendedJson(BigInt(2))).toEqual({ "@ext": "bigint", value: "2" });
	});

	test("can stringify with the extended replacer", () => {
		/**
		 * Call the extended replacer with the containing object.
		 * @param key The key.
		 * @param value The value.
		 * @returns The replaced value.
		 */
		function replacer(this: unknown, key: string, value: unknown): unknown {
			return JsonHelper.stringifyExReplacer.call(this, key, value);
		}
		expect(
			JSON.stringify(
				{
					dt: new Date(Date.UTC(1974, 7, 16)),
					bigint: BigInt(1),
					uint8: new Uint8Array([1]),
					s: Symbol("a"),
					str: "foo"
				},
				replacer
			)
		).toEqual(
			'{"dt":{"@ext":"date","value":145843200000},"bigint":{"@ext":"bigint","value":"1"},"uint8":{"@ext":"uint8array","value":"AQ=="},"s":{"@ext":"symbol","value":"a"},"str":"foo"}'
		);
	});

	test("can parse JSON with extended types", () => {
		expect(
			JsonHelper.parseEx(
				'{"str":"foo","num":123,"bool":true,"array":[1,2,3],"object":{"foo":"bar"},"dt":{"@ext":"date","value":145876211123},"bigint":{"@ext":"bigint","value":"123"},"uint8":{"@ext":"uint8array","value":"AQID"}}'
			)
		).toEqual({
			str: "foo",
			num: 123,
			bool: true,
			array: [1, 2, 3],
			object: { foo: "bar" },
			dt: new Date(Date.UTC(1974, 7, 16, 9, 10, 11, 123)),
			bigint: BigInt(123),
			uint8: new Uint8Array([1, 2, 3])
		});
	});

	test("can create a diff set", () => {
		const obj1 = {
			str: "foo",
			num: 123,
			bool: true
		};

		const obj2 = {
			str: "foo",
			num: 456,
			bool: true
		};

		const diff = JsonHelper.diff(obj1, obj2);
		expect(diff).toEqual([
			{
				path: "/num",
				op: "replace",
				value: 456
			}
		]);
	});

	test("can apply a diff set", () => {
		const obj1 = {
			str: "foo",
			num: 123,
			bool: true
		};

		const result = JsonHelper.patch(obj1, [
			{
				path: "/num",
				op: "replace",
				value: 456
			}
		]);

		expect(result).toEqual({
			str: "foo",
			num: 456,
			bool: true
		});
	});

	test("can fail to apply a diff set", () => {
		const obj1 = {
			str: "foo",
			num: 123,
			bool: true
		};

		expect(() =>
			JsonHelper.patch(obj1, [
				{
					path: "/num1",
					op: "replace",
					value: 456
				}
			])
		).toThrow("failedPatch");
	});
});
