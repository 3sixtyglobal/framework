// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Guards } from "@3sixty/core";
import { nameof } from "@3sixty/nameof";

/**
 * Helper class for working with PEM (Privacy-Enhanced Mail) formatted data.
 */
export class PemHelper {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<PemHelper>();

	/**
	 * Strip the PEM content of its headers, footers, and newlines.
	 * @param pemContent The PEM content to strip.
	 * @returns The stripped PEM content in bas64 format.
	 */
	public static stripPemMarkers(pemContent: string): string {
		Guards.string(PemHelper.CLASS_NAME, nameof(pemContent), pemContent);
		return pemContent
			.replace(/-----BEGIN.*-----/, "")
			.replace(/-----END.*-----/, "")
			.replace(/\n/g, "")
			.trim();
	}

	/**
	 * Format the PEM content to have a specific line length.
	 * @param marker The marker for the PEM content, e.g. RSA PRIVATE KEY
	 * @param base64Content The base64 content to format.
	 * @param lineLength The length of each line in the PEM content, default is 64 characters.
	 * @returns The formatted PEM content.
	 */
	public static formatPem(marker: string, base64Content: string, lineLength: number = 64): string {
		Guards.stringValue(PemHelper.CLASS_NAME, nameof(marker), marker);
		Guards.stringBase64(PemHelper.CLASS_NAME, nameof(base64Content), base64Content);
		const lines: string[] = [];
		for (let i = 0; i < base64Content.length; i += lineLength) {
			lines.push(base64Content.slice(i, i + lineLength));
		}
		return [`-----BEGIN ${marker}-----`, ...lines, `-----END ${marker}-----`].join("\n");
	}
}
