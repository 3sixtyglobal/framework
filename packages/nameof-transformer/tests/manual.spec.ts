// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { manual } from "../src/manual";

describe("Manual", () => {
	test("can transform code with nameof generics in it", () => {
		let code = "const name = nameof<MyType>();";

		code = manual(code);

		expect(code).toEqual('const name = "MyType";');
	});

	test("can transform code with nameof generics subtype in it", () => {
		let code = "const name = nameof<MyType<TypeB>>();";

		code = manual(code);

		expect(code).toEqual('const name = "MyType";');
	});

	test("can transform code with nameof param in it", () => {
		let code = "const name = nameof(MyType);";

		code = manual(code);

		expect(code).toEqual('const name = "MyType";');
	});

	test("can transform code with nameof import", () => {
		let code = 'import { nameof } from "@twin.org/nameof";';

		code = manual(code);

		expect(code).toEqual("");
	});

	test("can transform code with nameof properties multiple on same line", () => {
		let code = "Urn.guard(nameof(Factory), nameof(uri), uri);";

		code = manual(code);

		expect(code).toEqual('Urn.guard("Factory", "uri", uri);');
	});

	test("can transform code with nameof generics in it to camel case", () => {
		let code = "const name = nameofCamelCase<MyType>();";

		code = manual(code);

		expect(code).toEqual('const name = "myType";');
	});

	test("can transform code with nameof generics subtype in it to camel case", () => {
		let code = "const name = nameofCamelCase<MyType<TypeB>>();";

		code = manual(code);

		expect(code).toEqual('const name = "myType";');
	});

	test("can transform code with nameof param in it to camel case", () => {
		let code = "const name = nameofCamelCase(MyType);";

		code = manual(code);

		expect(code).toEqual('const name = "myType";');
	});

	test("can transform code with nameof import to camel case", () => {
		let code = 'import { nameofCamelCase } from "@twin.org/nameof";';

		code = manual(code);

		expect(code).toEqual("");
	});

	test("can transform code with nameof properties multiple on same line to camel case", () => {
		let code = "Urn.guard(nameofCamelCase(Factory), nameofCamelCase(uri), uri);";

		code = manual(code);

		expect(code).toEqual('Urn.guard("factory", "uri", uri);');
	});

	test("can transform code with nameof generics in it to kebab case", () => {
		let code = "const name = nameofKebabCase<MyType>();";

		code = manual(code);

		expect(code).toEqual('const name = "my-type";');
	});

	test("can transform code with nameof generics subtype in it to kebab case", () => {
		let code = "const name = nameofKebabCase<MyType<TypeB>>();";

		code = manual(code);

		expect(code).toEqual('const name = "my-type";');
	});

	test("can transform code with nameof param in it to kebab case", () => {
		let code = "const name = nameofKebabCase(MyType);";

		code = manual(code);

		expect(code).toEqual('const name = "my-type";');
	});

	test("can transform code with nameof import to kebab case", () => {
		let code = 'import { nameofKebabCase } from "@twin.org/nameof";';

		code = manual(code);

		expect(code).toEqual("");
	});

	test("can transform code with nameof properties multiple on same line to kebab case", () => {
		let code = "Urn.guard(nameofKebabCase(Factory), nameofKebabCase(uri), uri);";

		code = manual(code);

		expect(code).toEqual('Urn.guard("factory", "uri", uri);');
	});
});
