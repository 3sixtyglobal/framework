// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { nameof } from "@3sixty/nameof";

export class MyClass {
	public static readonly CLASS_NAME: string = nameof<MyClass>();

	public doSomething(hasError: boolean): void {
		const logger = { log: (a: unknown) => {} };
		logger.log({
			source: MyClass.CLASS_NAME,
			level: "info",
			message: hasError ? "operationFailed" : "operationSucceeded"
		});
	}
}
