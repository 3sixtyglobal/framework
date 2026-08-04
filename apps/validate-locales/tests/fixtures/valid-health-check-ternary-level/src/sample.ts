// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

export class MyServer {
	public static readonly CLASS_NAME = "MyServer";

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
