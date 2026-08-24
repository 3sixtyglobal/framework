// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

declare class GeneralError extends Error {
	constructor(source: string, key: string, props?: { [key: string]: unknown });
}

export class MyClass {
	public static readonly CLASS_NAME = "MyClass";

	public doError(): void {
		throw new GeneralError(MyClass.CLASS_NAME, "doError", {
			a: "1",
			b: "3",
			...{ c: "foo" }
		});
	}
}
