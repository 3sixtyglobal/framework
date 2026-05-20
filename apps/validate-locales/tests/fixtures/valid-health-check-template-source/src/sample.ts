// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const HealthStatus: { readonly Error: "error" };

export class MyServer {
	public static readonly CLASS_NAME = "MyServer";

	public async health(): Promise<{
		source: string;
		status: string;
		description: string;
		message: string;
	}> {
		const healthCheck = {
			source: `${MyServer.CLASS_NAME}Foo`,
			status: HealthStatus.Error,
			description: "healthDescription",
			message: "healthCheckFailed"
		};
		return healthCheck;
	}
}
