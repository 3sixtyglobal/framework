// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Camel case all the words.
 * @param input The input to convert.
 * @returns The camel case version of the input.
 */
export function camelCase(input: string): string {
	let output = input;
	// Strip interface prefix if there is one.
	if (/I[A-Z]/.test(output)) {
		output = output.slice(1);
	}
	const words = wordsSplit(output);
	return words.length === 0
		? ""
		: `${words[0].toLowerCase()}${words
				.slice(1)
				.map(w => `${w[0].toUpperCase()}${w.slice(1).toLowerCase()}`)
				.join("")}`;
}

/**
 * Convert the input string to kebab case.
 * @param input The input to convert.
 * @returns The kebab case version of the input.
 */
export function kebabCase(input: string): string {
	let output = input;
	// Strip interface prefix if there is one.
	if (/I[A-Z]/.test(output)) {
		output = output.slice(1);
	}
	return wordsSplit(output).join("-").toLowerCase();
}

/**
 * Split a string into words.
 * @param input The input to split.
 * @returns The string split into words.
 */
export function wordsSplit(input: string): string[] {
	return (
		input
			.replace(/([A-Z])/g, " $1")
			.trim()
			.match(/[^\u0000-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007F]+/g) ?? []
	);
}
