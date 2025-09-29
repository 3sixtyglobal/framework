// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { camelCase, kebabCase } from "./stringHelper";

/**
 * Replace the transformers manually.
 * @param content The content to replace the transformers in.
 * @returns The content with the transformers replace.
 */
export function manual(content: string): string {
	if (typeof content === "string" && content.includes("nameof")) {
		// Remove the import
		content = content.replace(/import.*from "@twin\.org\/nameof";/g, "");

		// Replace the nameof<IMyObject>() with "IMyObject"
		// or the nameof<IMyObject<IType2>>() with "IMyObject"
		const nameRegEx = /nameof<(.*?)(?:<.*>)?>\(\)/g;
		content = content.replace(nameRegEx, '"$1"');

		// Replace the nameofCamelCase<IMyObject>() with the camelCase version of the type name
		// e.g. nameofCamelCase<IMyObject>() => "myObject"
		// and nameofCamelCase<IMyObject<IType2>>() => "myObject"
		const nameRegExCamelCase = /nameofCamelCase<(.*?)(?:<.*?>)?>\(\)/g;
		content = content.replace(
			nameRegExCamelCase,
			(_match, typeName: string) => `"${camelCase(typeName)}"`
		);

		// Replace the nameofKebabCase<IMyObject>() with the kebabCase version of the type name
		// e.g. nameofKebabCase<IMyObject>() => "my-object"
		// and nameofKebabCase<IMyObject<IType2>>() => "my-object"
		const nameRegExKebabCase = /nameofKebabCase<(.*?)(?:<.*?>)?>\(\)/g;
		content = content.replace(
			nameRegExKebabCase,
			(_match, typeName: string) => `"${kebabCase(typeName)}"`
		);

		// Replace the nameof(object?.prop) with "object.prop"
		const propRegEx = /nameof\((.*?)\)/g;
		content = content.replace(propRegEx, '"$1"');

		// Replace the nameofCamelCase(object?.prop) with "object.prop"
		const propRegExCamelCase = /nameofCamelCase\((.*?)\)/g;
		content = content.replace(
			propRegExCamelCase,
			(_match, typeName: string) => `"${camelCase(typeName)}"`
		);

		// Replace the nameofKebabCase(object?.prop) with "object.prop"
		const propRegExKebabCase = /nameofKebabCase\((.*?)\)/g;
		content = content.replace(
			propRegExKebabCase,
			(_match, typeName: string) => `"${kebabCase(typeName)}"`
		);
	}
	return content;
}
