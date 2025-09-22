// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

import { Is } from "@twin.org/core";

/**
 * Class to helper with header operations.
 */
export class HeaderHelper {
	/**
	 * Create a bearer token header.
	 * @param token The token to create the header for.
	 * @returns The bearer token header.
	 */
	public static createBearer(token: string): string {
		if (Is.stringValue(token)) {
			if (token.startsWith("Bearer ")) {
				return token;
			}
			return `Bearer ${token.trim()}`;
		}
		return "";
	}

	/**
	 * Extract the bearer token from a header.
	 * @param header The header value to extract the token from.
	 * @returns The extracted token if it exists.
	 */
	public static extractBearer(header: unknown): string {
		if (Is.stringValue(header) && header.startsWith("Bearer ")) {
			return header.slice(7, header.length).trim();
		}
		return "";
	}
}
