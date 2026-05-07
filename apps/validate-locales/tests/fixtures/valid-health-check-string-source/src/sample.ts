// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const HealthStatus: { readonly Error: "error" };

export class MyServer {
	public async health(): Promise<{
		source: string;
		status: string;
		description: string;
		message: string;
	}> {
		const healthCheck = {
			source: "myServer",
			status: HealthStatus.Error,
			description: "healthDescription",
			message: "healthCheckFailed"
		};
		return healthCheck;
	}
}
