// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

import { spreadHelper } from "./spreadHelper.js";

declare class GeneralError extends Error {
	constructor(source: string, key: string, props?: { [key: string]: unknown });
}

export class MyClass {
	public static readonly CLASS_NAME = "MyClass";
}

throw new GeneralError(MyClass.CLASS_NAME, "doError", {
	agreementId: "agreement-123",
	endpoint: "https://example.com",
	...spreadHelper()
});
