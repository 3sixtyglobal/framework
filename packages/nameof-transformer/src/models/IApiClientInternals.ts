// Copyright 2026 3Sixty Trade Ltd.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The internal client of the API, which owns the compiler process.
 */
export interface IApiClientInternals {
	/**
	 * The client connecting to the compiler process.
	 */
	client: {
		/**
		 * The compiler process, set once connected.
		 */
		process?: {
			/**
			 * The exit code, null while the process is running.
			 */
			exitCode: number | null;

			/**
			 * Listen for the process exiting.
			 * @param event The exit event.
			 * @param listener Called with the exit code and signal.
			 * @returns The process.
			 */
			once(event: "exit", listener: (code: number | null, signal: string | null) => void): unknown;
		};

		/**
		 * Connect to the compiler, spawning its process.
		 * @returns Resolves once the process has been spawned.
		 */
		connect(): Promise<void>;

		/**
		 * Close the connection, rejecting any requests still pending.
		 * @returns Resolves once the connection is closed.
		 */
		close(): Promise<void>;
	};
}
