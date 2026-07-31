// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

declare class GeneralError extends Error {
	constructor(source: string, key: string, props?: { [key: string]: unknown });
}

function localHelper(): { status: string } {
	return { status: "ok" };
}

export class MyClass {
	public static readonly CLASS_NAME = "MyClass";

	public doLocal(): void {
		throw new GeneralError(MyClass.CLASS_NAME, "doLocal", {
			id: "123",
			...localHelper()
		});
	}

	public doThis(): void {
		throw new GeneralError(MyClass.CLASS_NAME, "doThis", {
			id: "456",
			...this.getDetails()
		});
	}

	private getDetails(): { code: string; reason?: string } {
		return { code: "SomeError", reason: "failed" };
	}
}
