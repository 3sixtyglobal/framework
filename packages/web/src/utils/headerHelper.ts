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
	public static createBearer(token: string): string | undefined {
		if (Is.stringValue(token)) {
			if (token.startsWith("Bearer ")) {
				return token;
			}
			return `Bearer ${token.trim()}`;
		}
		return undefined;
	}

	/**
	 * Extract the bearer token from a header.
	 * @param header The header value to extract the token from.
	 * @returns The extracted token if it exists.
	 */
	public static extractBearerToken(header: unknown): string | undefined {
		if (Is.stringValue(header) && header.startsWith("Bearer ")) {
			return header.slice(7, header.length).trim();
		}
		return undefined;
	}
}
