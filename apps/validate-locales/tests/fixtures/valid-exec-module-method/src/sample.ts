// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { nameof } from "@3sixty/nameof";

declare class ModuleHelper {
	public static execModuleMethod(
		module: string,
		method: string,
		params?: unknown
	): Promise<unknown>;
}

export class MyClass {
	public static readonly CLASS_NAME: string = nameof<MyClass>();

	public async doSomething(): Promise<void> {
		const result = await ModuleHelper.execModuleMethod(
			"@3sixty/engine-core",
			"EngineCoreBuilder.fromClone",
			{ param: "value" }
		);
		console.log("Result from execModuleMethod:", result);
	}
}
