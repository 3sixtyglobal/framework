// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { CLIDisplay, CLIUtils } from "@twin.org/cli-core";
import { GeneralError, I18n, Is, StringHelper, type ILocaleDictionary } from "@twin.org/core";
import { manual } from "@twin.org/nameof-transformer";
import type { Command } from "commander";
import * as glob from "glob";
import * as ts from "typescript";
import type { ILocaleDictionaryEntry } from "../models/ILocaleDictionaryEntry";
import type { ILocaleFailure } from "../models/ILocaleFailure";

const ERROR_TYPES = [
	{ name: "GeneralError", dynamicPropertyIndex: 2 },
	{ name: "GuardError", dynamicPropertyIndex: -1 },
	{ name: "ValidationError", dynamicPropertyIndex: -1 },
	{ name: "FetchError", dynamicPropertyIndex: 3, inbuiltProperties: ["httpStatus"] },
	{ name: "NotFoundError", dynamicPropertyIndex: 3, inbuiltProperties: ["notFoundId"] },
	{ name: "AlreadyExistsError", dynamicPropertyIndex: 3, inbuiltProperties: ["existingId"] },
	{ name: "UnauthorizedError", dynamicPropertyIndex: 2 },
	{ name: "NotSupportedError", dynamicPropertyIndex: 3, inbuiltProperties: ["methodName"] },
	{ name: "UnprocessableError", dynamicPropertyIndex: 2 },
	{ name: "ConflictError", dynamicPropertyIndex: 4, inbuiltProperties: ["conflictId", "conflicts"] }
];

const SKIP_FILES = ["**/models/**/*.ts"];

const SKIP_LITERALS = [
	/^\d+\.\d+\.\d+(-\w+(\.\w+)*)?(-\d)?$/, // Version string
	/^[^@]+@[^@]+\.[^@]+$/, // Email string
	/\.json$/i, // ending in .json
	/\.js$/i, // ending in .js
	/\.ts$/i, // ending in .ts
	/\.env$/i, // ending in .env
	/\.png$/i, // ending in .png
	/\.lock$/i, // ending in .lock
	/\.toml$/i, // ending in .toml
	/\.{3}/i, // ...
	/@twin\.org/ // starting with @twin.org
];

const SKIP_METHODS = [/^generateRest/, /^generateSocket/];

const CAPTURE_VARIABLES = [/ROUTES_SOURCE/];

/**
 * Build the root command to be consumed by the CLI.
 * @param program The command to build on.
 */
export function buildCommandValidateLocales(program: Command): void {
	program
		.option(
			I18n.formatMessage("commands.validate-locales.options.source.param"),
			I18n.formatMessage("commands.validate-locales.options.source.description"),
			"src/**/*.ts"
		)
		.option(
			I18n.formatMessage("commands.validate-locales.options.locales.param"),
			I18n.formatMessage("commands.validate-locales.options.locales.description"),
			"locales/**/*.json"
		)
		.option(
			I18n.formatMessage("commands.validate-locales.options.ignoreFile.param"),
			I18n.formatMessage("commands.validate-locales.options.ignoreFile.description"),
			"locales/.validate-ignore"
		)
		.action(async opts => {
			await actionCommandValidateLocales(opts);
		});
}

/**
 * Action the root command.
 * @param opts The options for the command.
 * @param opts.source The source glob.
 * @param opts.locales The locales glob.
 * @param opts.ignoreFile The ignore file path.
 */
export async function actionCommandValidateLocales(opts: {
	source: string;
	locales: string;
	ignoreFile: string;
}): Promise<void> {
	opts.source = path.resolve(opts.source);
	opts.locales = path.resolve(opts.locales);
	opts.ignoreFile = path.resolve(opts.ignoreFile);

	CLIDisplay.value(I18n.formatMessage("commands.validate-locales.labels.source"), opts.source);
	CLIDisplay.value(I18n.formatMessage("commands.validate-locales.labels.locales"), opts.locales);
	let ignore: string[] = [];

	if (await CLIUtils.fileExists(opts.ignoreFile)) {
		CLIDisplay.value(
			I18n.formatMessage("commands.validate-locales.labels.ignoreFile"),
			opts.ignoreFile
		);
		ignore = (await CLIUtils.readLinesFile(opts.ignoreFile)) ?? [];
	}

	CLIDisplay.break();

	const sources = glob.sync(opts.source.replace(/\\/g, "/"), { ignore: SKIP_FILES });
	const locales = glob.sync(opts.locales.replace(/\\/g, "/"));

	if (sources.length === 0) {
		CLIDisplay.warning(I18n.formatMessage("commands.validate-locales.warnings.noSourceFiles"));
	} else if (locales.length === 0) {
		CLIDisplay.warning(I18n.formatMessage("commands.validate-locales.warnings.noLocaleFiles"));
	} else {
		await validateLocales(
			sources,
			locales,
			ignore.filter(i => Is.stringValue(i) && !i.startsWith("#")).map(i => new RegExp(i))
		);
	}

	CLIDisplay.break();
	CLIDisplay.done();
}

/**
 * Validate the locales.
 * @param sourceFiles The source files.
 * @param localeFiles The locale files.
 * @param ignore The ignore list.
 */
async function validateLocales(
	sourceFiles: string[],
	localeFiles: string[],
	ignore: RegExp[]
): Promise<void> {
	const localeEntries: ILocaleDictionaryEntry[] = [];

	let hasQuoteError = false;
	let hasUnused = false;
	let hasFailures = false;

	for (const localeFile of localeFiles) {
		const dictionary = await CLIUtils.readJsonFile<ILocaleDictionary>(localeFile);
		const locale = path.basename(localeFile, path.extname(localeFile));

		CLIDisplay.task(
			I18n.formatMessage("commands.validate-locales.progress.validatingLocale", { localeFile })
		);
		CLIDisplay.break();

		if (Is.object<ILocaleDictionary>(dictionary)) {
			const mergedKeys: { [key: string]: string } = {};
			I18n.flattenTranslationKeys(dictionary, "", mergedKeys);

			for (const flatKey of Object.keys(mergedKeys)) {
				if (/'{.*?}'/.test(mergedKeys[flatKey])) {
					CLIDisplay.errorMessage(
						I18n.formatMessage("error.validateLocales.usesSingleQuotes", {
							key: flatKey
						})
					);
					hasQuoteError = true;
				}

				localeEntries.push({
					locale,
					key: flatKey,
					value: mergedKeys[flatKey],
					propertyNames: I18n.getPropertyNames(mergedKeys[flatKey]),
					referenced: false
				});
			}
		}

		let failures: ILocaleFailure[] = [];
		const captureVariables: { [name: string]: ts.Node } = {};

		for (const sourceFile of sourceFiles) {
			const source = await readFile(sourceFile, "utf8");

			const sourceTs = ts.createSourceFile(
				sourceFile,
				source,
				ts.ScriptTarget.ESNext,
				true,
				ts.ScriptKind.TS
			);

			visit(sourceTs, sourceTs, localeEntries, failures, captureVariables);
		}

		failures = failures.filter(mr => !ignore.some(pattern => pattern.test(mr.key)));

		if (failures.length === 0) {
			CLIDisplay.write(
				I18n.formatMessage("commands.validate-locales.labels.noMissingLocaleEntries")
			);
			CLIDisplay.break();
		} else {
			hasFailures = true;
			for (const failureRef of failures) {
				if (failureRef.type === "key") {
					CLIDisplay.errorMessage(
						I18n.formatMessage("error.validateLocales.missingLocaleEntry", {
							key: failureRef.key,
							source: failureRef.source,
							line: failureRef.line,
							column: failureRef.column
						})
					);
				}
			}
		}

		CLIDisplay.break();

		for (const localeEntry of localeEntries) {
			if (ignore.some(pattern => pattern.test(localeEntry.key))) {
				localeEntry.referenced = true;
			}
		}

		if (localeEntries.filter(le => !le.referenced).length === 0) {
			CLIDisplay.write(
				I18n.formatMessage("commands.validate-locales.labels.noUnusedLocaleEntries")
			);
			CLIDisplay.break();
		} else {
			hasUnused = true;
			for (const localeEntry of localeEntries) {
				if (!localeEntry.referenced) {
					CLIDisplay.errorMessage(
						I18n.formatMessage("error.validateLocales.unusedLocaleEntry", {
							key: localeEntry.key
						})
					);
				}
			}
		}
	}

	if (hasFailures || hasUnused || hasQuoteError) {
		throw new GeneralError("validateLocales", "validationFailed");
	}
}

/**
 * Visit the node.
 * @param sourceFile The TypeScript source file for position calculations.
 * @param node The node to visit.
 * @param localeEntries The locale entries.
 * @param failures The failure entries.
 * @param captureVariables The capture variables.
 */
function visit(
	sourceFile: ts.SourceFile,
	node: ts.Node,
	localeEntries: ILocaleDictionaryEntry[],
	failures: ILocaleFailure[],
	captureVariables: { [name: string]: ts.Node }
): void {
	let handled = false;
	if (
		ts.isNewExpression(node) &&
		ts.isIdentifier(node.expression) &&
		ERROR_TYPES.some(errorType => errorType.name === node.expression.getText())
	) {
		processErrorType(sourceFile, node, node.expression.text, localeEntries, failures);
		handled = true;
	} else if (ts.isStringLiteral(node)) {
		processStringLiteral(sourceFile, node, localeEntries, failures);
		handled = true;
	} else if (ts.isTemplateExpression(node)) {
		processTemplateExpression(sourceFile, node, localeEntries, failures);
		handled = true;
	} else if (ts.isCallExpression(node)) {
		handled = processCallExpression(sourceFile, node, localeEntries, failures, captureVariables);
	} else if (ts.isFunctionDeclaration(node)) {
		handled = processFunctionDeclaration(sourceFile, node, localeEntries, failures);
	} else if (ts.isVariableDeclaration(node)) {
		handled = processVariableDeclaration(
			sourceFile,
			node,
			localeEntries,
			failures,
			captureVariables
		);
	} else if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
		// Don't care about string in imports/exports
		handled = true;
	} else if (ts.isPropertyAssignment(node)) {
		handled = processPropertyAssignment(sourceFile, node, localeEntries, failures);
	}

	if (!handled) {
		ts.forEachChild(node, child =>
			visit(sourceFile, child, localeEntries, failures, captureVariables)
		);
	}
}

/**
 * Process an error type node.
 * @param sourceFile The TypeScript source file for position calculations.
 * @param node The node to process.
 * @param errorType The error type.
 * @param localeEntries The locale entries.
 * @param failures The failure entries.
 */
function processErrorType(
	sourceFile: ts.SourceFile,
	node: ts.NewExpression,
	errorType: string,
	localeEntries: ILocaleDictionaryEntry[],
	failures: ILocaleFailure[]
): void {
	const errType = ERROR_TYPES.find(e => e.name === errorType);

	if (Is.object(errType)) {
		const localeKey = localeFromClassAndMessage(
			sourceFile,
			node.arguments?.[0],
			node.arguments?.[1],
			"error",
			failures
		);

		if (Is.stringValue(localeKey)) {
			const localeEntry = findAndReferenceLocale(localeEntries, localeKey);

			if (Is.object(localeEntry)) {
				if (errType.dynamicPropertyIndex !== -1 || Is.arrayValue(errType.inbuiltProperties)) {
					const usedProperties = errType.inbuiltProperties?.slice() ?? [];

					if (errType.dynamicPropertyIndex !== -1) {
						usedProperties.push(
							...getPropertiesFromNode(node.arguments?.[errType.dynamicPropertyIndex])
						);
					}

					checkPropertyUsage(sourceFile, node, localeEntry, localeKey, usedProperties, failures);
				}
			} else {
				failures.push({
					type: "key",
					key: localeKey,
					source: path.resolve(sourceFile.fileName),
					...getSourcePosition(sourceFile, node)
				});
			}
		}
		return;
	}

	CLIDisplay.errorMessage(
		I18n.formatMessage("error.validateLocales.unableToProcessContent", { content: node.getText() })
	);
}

/**
 * Find the locale entry if it exists.
 * @param localeEntries The locale entries.
 * @param entryToMatch The full key to check.
 * @returns The item if found, undefined otherwise.
 */
function findAndReferenceLocale(
	localeEntries: ILocaleDictionaryEntry[],
	entryToMatch: string
): ILocaleDictionaryEntry | undefined {
	if (Is.stringValue(entryToMatch)) {
		const found = localeEntries.find(le => le.key === entryToMatch);
		if (found) {
			found.referenced = true;
			return found;
		}
	}
}

/**
 * Process a string literal node.
 * @param sourceFile The TypeScript source file for position calculations.
 * @param node The node to process.
 * @param localeEntries The locale entries.
 * @param failures The failure entries.
 */
function processStringLiteral(
	sourceFile: ts.SourceFile,
	node: ts.StringLiteral,
	localeEntries: ILocaleDictionaryEntry[],
	failures: ILocaleFailure[]
): void {
	if (
		node.text.length > 3 &&
		node.text.includes(".") &&
		!/[ ()/]/.test(node.text) &&
		!/^\.|\.$/.test(node.text) &&
		!isSkipLiteral(node.text)
	) {
		const parts = node.text.split(".");
		if (parts.length > 1) {
			// First try and match the string as-is
			let localeEntry = findAndReferenceLocale(localeEntries, node.text);
			if (localeEntry) {
				localeEntry.referenced = true;

				const usedProperties = getPropertiesFromNode(node);
				checkPropertyUsage(sourceFile, node, localeEntry, node.text, usedProperties, failures);
			}

			if (!localeEntry && ["validation.", "common."].some(t => node.text.startsWith(t))) {
				localeEntry = findAndReferenceLocale(localeEntries, `error.${node.text}`);
				if (localeEntry) {
					localeEntry.referenced = true;
					const usedProperties = getPropertiesFromNode(node);
					checkPropertyUsage(
						sourceFile,
						node,
						localeEntry,
						`error.${node.text}`,
						usedProperties,
						failures
					);
				}
			}

			if (!localeEntry) {
				failures.push({
					type: "key",
					key: node.text,
					source: path.resolve(sourceFile.fileName),
					...getSourcePosition(sourceFile, node)
				});
			}
		}
	}
}

/**
 * Process a template expression node.
 * @param sourceFile The TypeScript source file for position calculations.
 * @param node The node to process.
 * @param localeEntries The locale entries.
 * @param failures The failure entries.
 */
function processTemplateExpression(
	sourceFile: ts.SourceFile,
	node: ts.TemplateExpression,
	localeEntries: ILocaleDictionaryEntry[],
	failures: ILocaleFailure[]
): void {
	// This case handles templates like `error.${nameof(Class)}.message`
	const templateParts = extractTemplatePartsWithExpressions(node);

	// Join all literal text parts to form a potential locale key
	if (hasValidTemplateContent(templateParts)) {
		const key = expandTemplateParts(templateParts);

		let localeEntry = findAndReferenceLocale(localeEntries, key);
		if (localeEntry) {
			const usedProperties = getPropertiesFromNode(node);
			checkPropertyUsage(sourceFile, node, localeEntry, localeEntry.key, usedProperties, failures);
		} else if (["validation.", "common."].some(t => key.startsWith(t))) {
			localeEntry = findAndReferenceLocale(localeEntries, `error.${key}`);

			if (localeEntry) {
				localeEntry.referenced = true;
				const usedProperties = getPropertiesFromNode(node.parent.parent);

				checkPropertyUsage(sourceFile, node, localeEntry, `error.${key}`, usedProperties, failures);
			}
		}
	}
}

/**
 * Process a call expression node.
 * @param sourceFile The TypeScript source file for position calculations.
 * @param node The node to process.
 * @param localeEntries The locale entries.
 * @param failures The failure entries.
 * @param captureVariables The capture variables.
 * @returns True if processed, false otherwise.
 */
function processCallExpression(
	sourceFile: ts.SourceFile,
	node: ts.CallExpression,
	localeEntries: ILocaleDictionaryEntry[],
	failures: ILocaleFailure[],
	captureVariables: { [name: string]: ts.Node }
): boolean {
	if (ts.isPropertyAccessExpression(node.expression)) {
		const functionName = node.expression.name.getText();
		if (
			functionName === "log" &&
			node.arguments.length === 1 &&
			ts.isObjectLiteralExpression(node.arguments[0])
		) {
			let level;
			let source;
			let message;
			let dataNames;
			for (const prop of node.arguments[0].properties) {
				if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
					if (prop.name.text === "source") {
						if (ts.isIdentifier(prop.initializer) && captureVariables[prop.initializer.text]) {
							source = captureVariables[prop.initializer.text];
						} else if (ts.isStringLiteral(prop.initializer)) {
							source = prop.initializer;
						} else if (ts.isPropertyAccessExpression(prop.initializer)) {
							source = prop.initializer;
						}
					} else if (prop.name.text === "message") {
						message = prop.initializer;
					} else if (prop.name.text === "data") {
						dataNames = getPropertiesFromNode(prop.initializer);
					} else if (prop.name.text === "level") {
						level = getExpandedText(prop.initializer);
					}
				}
			}

			const localeKey = localeFromClassAndMessage(sourceFile, source, message, level, failures);

			if (Is.stringValue(localeKey)) {
				const localeEntry = findAndReferenceLocale(localeEntries, localeKey);

				if (Is.object(localeEntry)) {
					checkPropertyUsage(sourceFile, node, localeEntry, localeKey, dataNames ?? [], failures);
				} else {
					failures.push({
						type: "key",
						key: localeKey,
						source: path.resolve(sourceFile.fileName),
						...getSourcePosition(sourceFile, node)
					});
				}
			}
			return true;
		} else if (
			functionName === "formatMessage" &&
			node.arguments.length === 2 &&
			ts.isTemplateExpression(node.arguments[0]) &&
			ts.isObjectLiteralExpression(node.arguments[1])
		) {
			const localeKey = getExpandedText(node.arguments[0]);

			if (Is.stringValue(localeKey)) {
				const dataNames = getPropertiesFromNode(node.arguments[1]);
				const localeEntry = findAndReferenceLocale(localeEntries, localeKey);

				if (Is.object(localeEntry)) {
					checkPropertyUsage(sourceFile, node, localeEntry, localeKey, dataNames ?? [], failures);
				} else {
					failures.push({
						type: "key",
						key: localeKey,
						source: path.resolve(sourceFile.fileName),
						...getSourcePosition(sourceFile, node)
					});
				}
			}
			return true;
		}
	}

	return false;
}

/**
 * Process a function declaration node.
 * @param sourceFile The TypeScript source file for position calculations.
 * @param node The node to process.
 * @param localeEntries The locale entries.
 * @param failures The failure entries.
 * @returns True if processed, false otherwise.
 */
function processFunctionDeclaration(
	sourceFile: ts.SourceFile,
	node: ts.FunctionDeclaration,
	localeEntries: ILocaleDictionaryEntry[],
	failures: ILocaleFailure[]
): boolean {
	if (
		Is.object(node.name) &&
		ts.isIdentifier(node.name) &&
		SKIP_METHODS.some(re => re.test(node.name?.text ?? ""))
	) {
		return true;
	}
	return false;
}

/**
 * Process a variable statement declaration node.
 * @param sourceFile The TypeScript source file for position calculations.
 * @param node The node to process.
 * @param localeEntries The locale entries.
 * @param failures The failure entries.
 * @param captureVariables The capture variables.
 * @returns True if processed, false otherwise.
 */
function processVariableDeclaration(
	sourceFile: ts.SourceFile,
	node: ts.VariableDeclaration,
	localeEntries: ILocaleDictionaryEntry[],
	failures: ILocaleFailure[],
	captureVariables: { [name: string]: ts.Node }
): boolean {
	if (
		Is.object(node.name) &&
		Is.object(node.initializer) &&
		ts.isIdentifier(node.name) &&
		ts.isStringLiteral(node.initializer) &&
		CAPTURE_VARIABLES.some(re => re.test(node.name.getText()))
	) {
		captureVariables[node.name.getText()] = node.initializer;
		return true;
	}
	return false;
}

/**
 * Process a property assignment node.
 * @param sourceFile The TypeScript source file for position calculations.
 * @param node The node to process.
 * @param localeEntries The locale entries.
 * @param failures The failure entries.
 * @returns True if processed, false otherwise.
 */
function processPropertyAssignment(
	sourceFile: ts.SourceFile,
	node: ts.PropertyAssignment,
	localeEntries: ILocaleDictionaryEntry[],
	failures: ILocaleFailure[]
): boolean {
	if (Is.object(node.name) && ts.isIdentifier(node.name) && node.name.getText() === "message") {
		const localeKey = getExpandedText(node.initializer);

		if (Is.stringValue(localeKey)) {
			let localeEntry = findAndReferenceLocale(localeEntries, localeKey);

			if (!Is.object(localeEntry)) {
				localeEntry = findAndReferenceLocale(localeEntries, `error.${localeKey}`);
			}

			if (!Is.object(localeEntry)) {
				failures.push({
					type: "key",
					key: localeKey,
					source: path.resolve(sourceFile.fileName),
					...getSourcePosition(sourceFile, node)
				});
			}
			return true;
		}
	}
	return false;
}

/**
 * Get the expanded text from a node.
 * @param node The node to get the text from.
 * @returns The expanded text.
 */
function getExpandedText(node: ts.Node): string {
	if (ts.isTemplateExpression(node)) {
		const templateParts = extractTemplatePartsWithExpressions(node);
		if (hasValidTemplateContent(templateParts)) {
			return expandTemplateParts(templateParts);
		}
	} else if (ts.isStringLiteral(node)) {
		if (hasValidTemplateContent([node.text])) {
			return node.text;
		}
	}

	return "";
}

/**
 * Extract parts from a template literal, splitting by ${} expressions.
 * @param node The template expression node.
 * @returns Array of parts including expressions and literal text.
 */
function extractTemplatePartsWithExpressions(node: ts.TemplateExpression): string[] {
	const parts: string[] = [];

	// Start with the head (text before first ${})
	if (node.head.text) {
		parts.push(node.head.text);
	}

	// Process each template span (${expression}text)
	for (const span of node.templateSpans) {
		// Add the expression part as text
		parts.push(span.expression.getText());

		// Add the literal text after the expression
		if (span.literal.text) {
			parts.push(span.literal.text);
		}
	}

	return parts.filter(part => part.length > 0);
}

/**
 * Check if the content has any parts which contain elements which determine is is not an locale key.
 * @param templateParts The template parts to check.
 * @returns True if the template parts are valid, false otherwise.
 */
function hasValidTemplateContent(templateParts: string[]): boolean {
	return !templateParts.some(part => /[#,/:=?|]/.test(part));
}

/**
 * Expand template parts into a single string, processing nameof expressions.
 * @param templateParts The template parts to expand.
 * @returns The expanded template string.
 */
function expandTemplateParts(templateParts: string[]): string {
	for (let i = 0; i < templateParts.length; i++) {
		templateParts[i] = expandTemplatePart(templateParts[i]);
	}

	return templateParts.join("");
}

/**
 * Expand template part into a single string, processing nameof expressions.
 * @param templatePart The template part to expand.
 * @returns The expanded template string.
 */
function expandTemplatePart(templatePart: string): string {
	if (templatePart.startsWith("nameof")) {
		const stripped = manual(templatePart).replace(/["']/g, "");
		templatePart = StringHelper.camelCase(stripped, true);
	} else if (templatePart.startsWith("StringHelper.")) {
		templatePart = templatePart.replace(/\.CLASS_NAME/g, "");

		templatePart = templatePart.replace(/StringHelper\.camelCase\((.*?)\)/, (_, i) =>
			StringHelper.camelCase(i)
		);
		templatePart = templatePart.replace(/StringHelper\.titleCase\((.*?)\)/, (_, i) =>
			StringHelper.titleCase(i)
		);
		templatePart = templatePart.replace(/StringHelper\.pascalCase\((.*?)\)/, (_, i) =>
			StringHelper.pascalCase(i)
		);
		templatePart = templatePart.replace(/StringHelper\.kebabCase\((.*?)\)/, (_, i) =>
			StringHelper.kebabCase(i)
		);
		templatePart = templatePart.replace(/StringHelper\.snakeCase\((.*?)\)/, (_, i) =>
			StringHelper.snakeCase(i)
		);
	} else if (templatePart.includes(".CLASS_NAME")) {
		templatePart = StringHelper.camelCase(templatePart.replace(/\.CLASS_NAME/g, ""));
	}
	templatePart = templatePart.replace(/["'`]/g, ""); // Remove quotes

	return templatePart;
}

/**
 * Check the property usage in a locale entry against the used properties.
 * @param sourceFile The TypeScript source file for position calculations.
 * @param node The node to check.
 * @param localeEntry The locale entry to check against.
 * @param key The key in the locale entry.
 * @param usedProperties The properties used in the code.
 * @param failures The failure entries.
 */
function checkPropertyUsage(
	sourceFile: ts.SourceFile,
	node: ts.Node,
	localeEntry: ILocaleDictionaryEntry,
	key: string,
	usedProperties: string[],
	failures: ILocaleFailure[]
): void {
	for (const propName of localeEntry.propertyNames) {
		const propIndex = usedProperties.indexOf(propName);
		if (propIndex === -1) {
			const position = getSourcePosition(sourceFile, node);
			CLIDisplay.errorMessage(
				I18n.formatMessage("error.validateLocales.missingPropertyInLocale", {
					key,
					property: propName,
					source: path.resolve(sourceFile.fileName),
					line: position.line,
					column: position.column
				})
			);
			failures.push({
				type: "property",
				key: localeEntry.key,
				source: path.resolve(sourceFile.fileName),
				...position
			});
		}
	}

	// We often pass additional properties in the error details to better inform the logging
	// so we don't want to perform the opposite check for parameters in the call but not in the locale entry
}

/**
 * Helper to get line and column position from a node.
 * @param sourceFile The TypeScript source file for position calculations.
 * @param n The node to get position for.
 * @returns Line and column (1-based).
 */
function getSourcePosition(
	sourceFile: ts.SourceFile,
	n: ts.Node
): { line: number; column: number } {
	const { line, character } = sourceFile.getLineAndCharacterOfPosition(n.getStart(sourceFile));
	return { line: line + 1, column: character + 1 };
}

/**
 * Get property names from a node.
 * @param node The node to get property names from.
 * @returns The property names.
 */
function getPropertiesFromNode(node?: ts.Node): string[] {
	if (!node) {
		return [];
	}

	const props: string[] = [];

	// If this is an object literal then we can get the property names
	if (ts.isObjectLiteralExpression(node)) {
		// Get the properties of the object literal
		const properties = node.properties;
		for (const prop of properties) {
			if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
				// { property: value }
				props.push(prop.name.text);

				// { property: { nestedProperty: value } }
				if (ts.isObjectLiteralExpression(prop.initializer)) {
					// Recursively get properties from nested object literals
					const nestedProps = getPropertiesFromNode(prop.initializer);
					props.push(...nestedProps);
				}
			} else if (ts.isShorthandPropertyAssignment(prop)) {
				// { property }
				props.push(prop.getText());
			}
		}
	} else if (ts.isStringLiteral(node)) {
		// If this is a string literal then there are no properties
		// so we need to look in the surrounding context
		const parent = node.parent;
		if (ts.isCallExpression(parent) || ts.isNewExpression(parent)) {
			// Let's see if they are the next argument in the call
			const args = parent.arguments;
			if (args && args.length > 0) {
				const index = args.findIndex(a => a === node);
				if (index !== -1 && index + 1 < args.length) {
					return getPropertiesFromNode(args[index + 1]);
				}
			}
		} else if (ts.isPropertyAssignment(parent)) {
			// This is part of a property assignment in an object
			// so we can check the parent object for other properties
			if (ts.isObjectLiteralExpression(parent.parent)) {
				return getPropertiesFromNode(parent.parent);
			}
		}
	}

	return props;
}

/**
 * Check if a value is a file operation.
 * @param value The value to check.
 * @returns True if the value is a file operation.
 */
function isSkipLiteral(value: string): boolean {
	return SKIP_LITERALS.some(regex => regex.test(value));
}

/**
 * Get the locale from the class and message nodes.
 * @param sourceFile The TypeScript source file for position calculations.
 * @param classNode The class node.
 * @param messageNode The message node.
 * @param prefix The prefix for the locale key.
 * @param failures The failure entries.
 * @returns The locale entry or undefined.
 */
function localeFromClassAndMessage(
	sourceFile: ts.SourceFile,
	classNode: ts.Node | undefined,
	messageNode: ts.Node | undefined,
	prefix: string | undefined,
	failures: ILocaleFailure[]
): string | undefined {
	if (!classNode || !messageNode) {
		return undefined;
	}

	const classNameParam = classNode.getText();
	const classNameParamParts = classNameParam?.split(".");

	if (Is.array(classNameParamParts)) {
		const messageKey = getExpandedText(messageNode);

		if (Is.stringValue(messageKey)) {
			if (messageKey.includes(" ")) {
				// If the message contains spaces then it is not a key
				// but should be replaced by one
				const position = getSourcePosition(sourceFile, messageNode);
				CLIDisplay.errorMessage(
					I18n.formatMessage("error.validateLocales.shouldBeKey", {
						value: messageKey,
						source: path.resolve(sourceFile.fileName),
						line: position.line,
						column: position.column
					})
				);
				failures.push({
					type: "noKey",
					key: messageKey,
					source: path.resolve(sourceFile.fileName),
					...position
				});
			} else {
				const finalKeyParts = [];

				const classNameExpanded = expandTemplatePart(classNameParam);
				const messageKeyParts = messageKey.split(".");

				if (messageKeyParts.length === 2 && classNameExpanded === messageKeyParts[0]) {
					// But if it is fully qualified with exactly two segments and starts with the class name
					// then the class name is redundant and should be removed in the source
					const position = getSourcePosition(sourceFile, messageNode);
					CLIDisplay.errorMessage(
						I18n.formatMessage("error.validateLocales.noNeedToQualify", {
							key: messageKey,
							property: classNameParam,
							source: path.resolve(sourceFile.fileName),
							line: position.line,
							column: position.column
						})
					);
					failures.push({
						type: "qualify",
						key: messageKey,
						source: path.resolve(sourceFile.fileName),
						...position
					});
				} else if (!messageKey.includes(".")) {
					// If the key is not fully qualified then add the class name
					// to the final key
					finalKeyParts.push(classNameExpanded);
				}

				finalKeyParts.push(messageKey);

				if (Is.stringValue(prefix)) {
					finalKeyParts.unshift(prefix);
				}

				return finalKeyParts.join(".");
			}
		}
	}

	return undefined;
}
