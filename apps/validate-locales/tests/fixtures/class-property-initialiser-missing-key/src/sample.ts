// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

declare class GeneralError extends Error {
	constructor(source: string, key: string, props?: { [key: string]: unknown });
}

export class MyClass {
	public static readonly CLASS_NAME = "MyClass";

	// A property which is not just data is still walked, so the key it names is still validated.
	private static readonly _FAILURE = new GeneralError(MyClass.CLASS_NAME, "missingKey");

	public doSomething(): void {
		throw MyClass._FAILURE;
	}
}
