// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Default definition of some context keys.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ContextIdKeys = {
	/**
	 * Standard property type definition for node.
	 */
	Node: "node",

	/**
	 * Standard property type definition for tenant.
	 */
	Tenant: "tenant",

	/**
	 * Standard property type definition for organization.
	 */
	Organization: "organization",

	/**
	 * Standard property type definition for user.
	 */
	User: "user",

	/**
	 * Standard property type definition for user organization.
	 */
	UserOrganization: "userOrganization"
} as const;

/**
 * Default definition of some context keys.
 */
export type ContextIdKeys = (typeof ContextIdKeys)[keyof typeof ContextIdKeys];
