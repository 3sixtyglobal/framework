// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

export class MyClass {
	public static readonly CLASS_NAME = "MyClass";

	public doSomething(): { source: string; level: string; message: string } {
		return {
			source: MyClass.CLASS_NAME,
			level: "info",
			message: "doSomethingMessage"
		};
	}
}
