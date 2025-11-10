// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Interface describing a component which can be bootstrapped, started and stopped.
 */
export interface IComponent {
	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	className(): string;

	/**
	 * Bootstrap the component by creating and initializing any resources it needs.
	 * @param nodeLoggingComponentType The node logging component type.
	 * @returns True if the bootstrapping process was successful.
	 */
	bootstrap?(nodeLoggingComponentType?: string): Promise<boolean>;

	/**
	 * The component needs to be started when the node is initialized.
	 * @param nodeLoggingComponentType The node logging component type.
	 * @returns Nothing.
	 */
	start?(nodeLoggingComponentType?: string): Promise<void>;

	/**
	 * The component needs to be stopped when the node is closed.
	 * @param nodeLoggingComponentType The node logging component type.
	 * @returns Nothing.
	 */
	stop?(nodeLoggingComponentType?: string): Promise<void>;
}
