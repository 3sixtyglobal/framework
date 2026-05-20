// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

declare class GeneralError extends Error {
	constructor(source: string, key: string, props?: { [key: string]: unknown });
}

export class MyClass {
	public static readonly CLASS_NAME = "MyClass";

	public doSomething(): void {
		throw new GeneralError(MyClass.CLASS_NAME, "doError");
	}

	public doSomethingElse(): void {
		throw new GeneralError(MyClass.CLASS_NAME, "doOtherError", { count: 5 });
	}
}
