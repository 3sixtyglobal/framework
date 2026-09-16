// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

declare class GeneralError extends Error {
	constructor(source: string, key: string, props?: { [key: string]: unknown });
}

export class MyClass {
	public static readonly CLASS_NAME = "MyClass";

	// Third party property names look like locale keys because of the dot in them.
	private static readonly _NEXT_LINK_KEY = "@odata.nextLink";

	private static readonly _FAILURE_CODES: string[] = ["some.failure", "another.failure"];

	private static readonly _LOOKUP: { [id: string]: string } = { first: "lookup.first" };

	private static readonly _MAX_RETRIES: number = 3;

	public doSomething(): void {
		throw new GeneralError(MyClass.CLASS_NAME, "doError", {
			nextLink: MyClass._NEXT_LINK_KEY,
			codes: MyClass._FAILURE_CODES,
			lookup: MyClass._LOOKUP,
			retries: MyClass._MAX_RETRIES
		});
	}
}
