// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Interface describing a component which can be bootstrapped, started and stopped.
 */
export interface IComponent {
	/**
	 * The name of the component.
	 */
	readonly CLASS_NAME: string;

	/**
	 * Bootstrap the component by creating and initializing any resources it needs.
	 * @param nodeLoggingComponentType The node logging component type.
	 * @returns True if the bootstrapping process was successful.
	 */
	bootstrap?(nodeLoggingComponentType?: string): Promise<boolean>;

	/**
	 * The component needs to be started when the node is initialized.
	 * @param nodeIdentity The identity of the node starting the component.
	 * @param nodeLoggingComponentType The node logging component type.
	 * @returns Nothing.
	 */
	start?(nodeIdentity?: string, nodeLoggingComponentType?: string): Promise<void>;

	/**
	 * The component needs to be stopped when the node is closed.
	 * @param nodeIdentity The identity of the node stopping the component.
	 * @param nodeLoggingComponentType The node logging component type.
	 * @returns Nothing.
	 */
	stop?(nodeIdentity?: string, nodeLoggingComponentType?: string): Promise<void>;
}
