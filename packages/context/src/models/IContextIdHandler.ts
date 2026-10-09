// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IComponent } from "@3sixty/core";

/**
 * Interface describing a context ID handler.
 */
export interface IContextIdHandler extends IComponent {
	/**
	 * The short form version of the context ID, should be unique enough to partition data.
	 * @param value The full context ID value.
	 * @returns The short form version of the context ID.
	 */
	short?(value: string): string;

	/**
	 * The long form version of the context ID, expanded from a short version.
	 * @param value The short form context ID value.
	 * @returns The long form version of the context ID.
	 */
	long?(value: string): string;

	/**
	 * Performs a runtime guard on the provided context ID value.
	 * @param value The context ID value to guard.
	 * @throws Guard error if the value is invalid.
	 */
	guard?(value: string): void;
}
