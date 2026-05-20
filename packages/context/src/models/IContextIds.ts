// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Interface describing context ids which can be accessed async from a request.
 */
export interface IContextIds {
	/**
	 * The context id keys and values.
	 */
	[id: string]: string | undefined;
}
