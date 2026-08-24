// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const HealthStatus: { readonly Ok: "ok"; readonly Error: "error" };

export class MyServer {
	public static readonly CLASS_NAME = "MyServer";

	public async health(isHealthy: boolean): Promise<
		{
			source: string;
			status: string;
			description: string;
			message?: string;
		}[]
	> {
		const results: { source: string; status: string; description: string; message?: string }[] = [];
		results.push({
			source: MyServer.CLASS_NAME,
			status: isHealthy ? HealthStatus.Ok : HealthStatus.Error,
			description: "serverDescription",
			message: "checkFailed"
		});
		return results;
	}
}
