// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * A facade wraps a component so a cross cutting concern can be applied to it without the
 * component being modified. The wrapped component is returned in place of the original.
 */
export interface IFacade<T = unknown> {
	/**
	 * Wrap the target, returning a replacement.
	 * @param target The component to wrap.
	 * @returns The wrapped component.
	 */
	wrap(target: T): T;
}
