// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { HealthStatus } from "./healthStatus.js";

/**
 * Provides health information for a component.
 */
export interface IHealth {
	/**
	 * The name of the component.
	 */
	name: string;

	/**
	 * The description of the component as an i18n key.
	 */
	description?: string;

	/**
	 * Whether this entry is a child of another entry, the parent entry will report the overall status of the component.
	 */
	isChild?: boolean;

	/**
	 * The overall status of the component, the entries can also report their own health.
	 */
	status: HealthStatus;

	/**
	 * The details for the status if there are further details to provide as an i18n key.
	 */
	details?: string;

	/**
	 * Properties to substitute in the i18n key for the details.
	 */
	properties?: { [id: string]: unknown };
}
