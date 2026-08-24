// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

declare class ModuleHelper {
	public static execModuleMethod(
		module: string,
		method: string,
		params?: unknown
	): Promise<unknown>;
}

export class MyClass {
	public static readonly CLASS_NAME = "MyClass";

	public async doSomething(): Promise<void> {
		const result = await ModuleHelper.execModuleMethod(
			"@twin.org/engine-core",
			"EngineCoreBuilder.fromClone",
			{ param: "value" }
		);
		console.log("Result from execModuleMethod:", result);
	}
}
