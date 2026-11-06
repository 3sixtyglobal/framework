// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { nameof } from "@3sixty/nameof";

export class MyServer {
	public static readonly CLASS_NAME: string = nameof<MyServer>();

	public async checkStatus(hasError: boolean): Promise<{
		source: string;
		level: string;
		message: string;
	}> {
		return {
			source: MyServer.CLASS_NAME,
			level: hasError ? "warning" : "info",
			message: "serverStatus"
		};
	}
}
