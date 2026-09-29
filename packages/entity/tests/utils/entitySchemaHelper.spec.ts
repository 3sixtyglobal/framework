// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { entity } from "../../src/decorators/entityDecorator.js";
import { property } from "../../src/decorators/propertyDecorator.js";
import type { IEntitySchema } from "../../src/models/IEntitySchema.js";
import type { IEntitySchemaPropertyIndex } from "../../src/models/IEntitySchemaPropertyIndex.js";
import { SortDirection } from "../../src/models/sortDirection.js";
import { EntitySchemaHelper } from "../../src/utils/entitySchemaHelper.js";

/**
 * Test interface for validation.
 */
@entity()
export class TestEntity {
	/**
	 * A string value.
	 */
	@property({ type: "string", optional: true })
	public stringValue?: string;

	/**
	 * A number value.
	 */
	@property({ type: "number", optional: true })
	public numberValue?: number;

	/**
	 * An integer value.
	 */
	@property({ type: "integer", optional: true })
	public integerValue?: number;

	/**
	 * A boolean value.
	 */
	@property({ type: "boolean", optional: true })
	public booleanValue?: boolean;

	/**
	 * An array value.
	 */
	@property({ type: "array", optional: true })
	public arrayValue?: string[];

	/**
	 * An object value.
	 */
	@property({ type: "object", optional: true })
	public objectValue?: unknown;

	/**
	 * A non optional string value.
	 */
	@property({ type: "string", optional: false })
	public nonOptionalString!: string;

	/**
	 * A string value with a maximum length.
	 */
	@property({ type: "string", optional: true, maxLength: 5 })
	public maxLengthString?: string;

	/**
	 * A uuid value with no explicit maximum length.
	 */
	@property({ type: "string", format: "uuid", optional: true })
	public uuidValue?: string;

	/**
	 * A uuid value with an explicit maximum length.
	 */
	@property({ type: "string", format: "uuid", optional: true, maxLength: 10 })
	public uuidMaxLengthValue?: string;

	/**
	 * A date-time value with no explicit maximum length.
	 */
	@property({ type: "string", format: "date-time", optional: true })
	public dateTimeValue?: string;

	/**
	 * A date value with no explicit maximum length.
	 */
	@property({ type: "string", format: "date", optional: true })
	public dateValue?: string;

	/**
	 * A time value with no explicit maximum length.
	 */
	@property({ type: "string", format: "time", optional: true })
	public timeValue?: string;

	/**
	 * An email value with no explicit maximum length.
	 */
	@property({ type: "string", format: "email", optional: true })
	public emailValue?: string;

	/**
	 * A uri value with no explicit maximum length.
	 */
	@property({ type: "string", format: "uri", optional: true })
	public uriValue?: string;
}

/**
 * Test interface for validation.
 */
interface ITestEntity {
	/**
	 * A string value.
	 */
	stringValue?: string;
	/**
	 * A number value.
	 */
	numberValue?: number;
	/**
	 * An integer value.
	 */
	integerValue?: number;
	/**
	 * A boolean value.
	 */
	booleanValue?: boolean;
	/**
	 * An array value.
	 */
	arrayValue?: string[];
	/**
	 * An object value.
	 */
	objectValue?: unknown;

	/**
	 * A non optional string value.
	 */
	nonOptionalString: string;

	/**
	 * A string value with a maximum length.
	 */
	maxLengthString?: string;

	/**
	 * A uuid value with no explicit maximum length.
	 */
	uuidValue?: string;

	/**
	 * A uuid value with an explicit maximum length.
	 */
	uuidMaxLengthValue?: string;

	/**
	 * A date-time value with no explicit maximum length.
	 */
	dateTimeValue?: string;

	/**
	 * A date value with no explicit maximum length.
	 */
	dateValue?: string;

	/**
	 * A time value with no explicit maximum length.
	 */
	timeValue?: string;

	/**
	 * An email value with no explicit maximum length.
	 */
	emailValue?: string;

	/**
	 * A uri value with no explicit maximum length.
	 */
	uriValue?: string;
}

const testEntitySchema: IEntitySchema<ITestEntity> = EntitySchemaHelper.getSchema(TestEntity);

describe("EntitySchemaHelper", () => {
	beforeAll(async () => {});

	test("can fail to get primary keys if there is no schema", async () => {
		expect(() => EntitySchemaHelper.getPrimaryKey(undefined as unknown as IEntitySchema)).toThrow(
			expect.objectContaining({
				name: "GuardError",
				message: "guard.objectUndefined",
				properties: { property: "entitySchema", value: "undefined" }
			})
		);
	});

	test("can fail to get primary keys if there is are none", async () => {
		expect(() =>
			EntitySchemaHelper.getPrimaryKey<{ id: string }>({
				type: "test",
				properties: [
					{
						property: "id",
						type: "string"
					}
				]
			})
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.noIsPrimary"
			})
		);
	});

	test("can fail to get primary keys if there is are multiple", async () => {
		expect(() =>
			EntitySchemaHelper.getPrimaryKey<{ id: string; id2: string }>({
				type: "test",
				properties: [
					{
						property: "id",
						type: "string",
						isPrimary: true
					},
					{
						property: "id2",
						type: "string",
						isPrimary: true
					}
				]
			})
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.multipleIsPrimary"
			})
		);
	});

	test("can get primary keys if there is is only one", async () => {
		const result = EntitySchemaHelper.getPrimaryKey<{ id: string; id2: string }>({
			type: "test",
			properties: [
				{
					property: "id",
					type: "string",
					isPrimary: true
				},
				{
					property: "id2",
					type: "string"
				}
			]
		});

		expect(result.property).toEqual("id");
	});

	test("can fail to get sort keys if there is no schema", async () => {
		expect(() =>
			EntitySchemaHelper.getSortProperties(undefined as unknown as IEntitySchema)
		).toThrow(
			expect.objectContaining({
				name: "GuardError",
				message: "guard.objectUndefined"
			})
		);
	});

	test("can get no sort keys if none are defined", async () => {
		const result = EntitySchemaHelper.getSortProperties<{ id: string; id2: string }>({
			type: "test",
			properties: [
				{
					property: "id",
					type: "string",
					isPrimary: true
				},
				{
					property: "id2",
					type: "string"
				}
			]
		});

		expect(result).toBeUndefined();
	});

	test("can get sort keys", async () => {
		const result = EntitySchemaHelper.getSortProperties<{ id: string; id2: string }>({
			type: "test",
			properties: [
				{
					property: "id",
					type: "string",
					isPrimary: true,
					sortDirection: SortDirection.Ascending
				},
				{
					property: "id2",
					type: "string",
					sortDirection: SortDirection.Descending
				}
			]
		});

		expect(result?.length).toEqual(2);
		expect(result?.[0].property).toEqual("id");
		expect(result?.[0].sortDirection).toEqual(SortDirection.Ascending);
		expect(result?.[1].property).toEqual("id2");
		expect(result?.[1].sortDirection).toEqual(SortDirection.Descending);
	});

	test("can fail to build sort keys if there is no schema", async () => {
		expect(() =>
			EntitySchemaHelper.buildSortProperties(undefined as unknown as IEntitySchema)
		).toThrow(
			expect.objectContaining({
				name: "GuardError",
				message: "guard.objectUndefined"
			})
		);
	});

	test("can build sort keys with no overrides", async () => {
		const result = EntitySchemaHelper.buildSortProperties<{ id: string; id2: string }>({
			type: "test",
			properties: [
				{
					property: "id",
					type: "string",
					isPrimary: true,
					sortDirection: SortDirection.Ascending
				},
				{
					property: "id2",
					type: "string",
					sortDirection: SortDirection.Descending
				}
			]
		});

		expect(result?.length).toEqual(2);
		expect(result?.[0].property).toEqual("id");
		expect(result?.[0].sortDirection).toEqual(SortDirection.Ascending);
		expect(result?.[1].property).toEqual("id2");
		expect(result?.[1].sortDirection).toEqual(SortDirection.Descending);
	});

	test("can build sort keys with overrides", async () => {
		const result = EntitySchemaHelper.buildSortProperties<{ id: string; id2: string }>(
			{
				type: "test",
				properties: [
					{
						property: "id",
						type: "string",
						isPrimary: true,
						sortDirection: SortDirection.Ascending
					},
					{
						property: "id2",
						type: "string",
						sortDirection: SortDirection.Descending
					}
				]
			},
			[{ property: "id2", sortDirection: SortDirection.Ascending }]
		);

		expect(result?.length).toEqual(1);
		expect(result?.[0].property).toEqual("id2");
		expect(result?.[0].sortDirection).toEqual(SortDirection.Ascending);
	});

	test("can validate an empty object against an empty schema", async () => {
		const schema: IEntitySchema = {
			type: "foo"
		};

		expect(EntitySchemaHelper.validateEntity({}, schema)).toBeUndefined();
	});

	test("can validate a schema with a string property", async () => {
		expect(
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ stringValue: "", nonOptionalString: "" },
				testEntitySchema
			)
		).toBeUndefined();
	});

	test("can fail to validate a schema with a string property", async () => {
		expect(() =>
			EntitySchemaHelper.validateEntity(
				{ stringValue: 111 } as unknown as ITestEntity,
				testEntitySchema
			)
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.invalidEntityProperty",
				properties: { value: 111, property: "stringValue", type: "string" }
			})
		);
	});

	test("can validate a schema with a number property", async () => {
		expect(
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ numberValue: 12.56, nonOptionalString: "" },
				testEntitySchema
			)
		).toBeUndefined();
	});

	test("can fail to validate a schema with a number property", async () => {
		expect(() =>
			EntitySchemaHelper.validateEntity(
				{ numberValue: "aaa" } as unknown as ITestEntity,
				testEntitySchema
			)
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.invalidEntityProperty",
				properties: { value: "aaa", property: "numberValue", type: "number" }
			})
		);
	});

	test("can validate a schema with an integer property", async () => {
		expect(
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ integerValue: 12, nonOptionalString: "" },
				testEntitySchema
			)
		).toBeUndefined();
	});

	test("can fail to validate a schema with an integer property with floating point", async () => {
		expect(() =>
			EntitySchemaHelper.validateEntity(
				{ integerValue: 123.45 } as unknown as ITestEntity,
				testEntitySchema
			)
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.invalidEntityProperty",
				properties: { value: 123.45, property: "integerValue", type: "integer" }
			})
		);
	});

	test("can fail to validate a schema with an integer property", async () => {
		expect(() =>
			EntitySchemaHelper.validateEntity(
				{ integerValue: "aaa" } as unknown as ITestEntity,
				testEntitySchema
			)
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.invalidEntityProperty",
				properties: { value: "aaa", property: "integerValue", type: "integer" }
			})
		);
	});

	test("can validate a schema with a boolean property", async () => {
		expect(
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ booleanValue: true, nonOptionalString: "" },
				testEntitySchema
			)
		).toBeUndefined();
	});

	test("can fail to validate a schema with a number property", async () => {
		expect(() =>
			EntitySchemaHelper.validateEntity(
				{ booleanValue: "aaa" } as unknown as ITestEntity,
				testEntitySchema
			)
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.invalidEntityProperty",
				properties: { value: "aaa", property: "booleanValue", type: "boolean" }
			})
		);
	});

	test("can validate a schema with an array property", async () => {
		expect(
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ arrayValue: [], nonOptionalString: "" },
				testEntitySchema
			)
		).toBeUndefined();
	});

	test("can fail to validate a schema with an array property", async () => {
		expect(() =>
			EntitySchemaHelper.validateEntity(
				{ arrayValue: "aaa" } as unknown as ITestEntity,
				testEntitySchema
			)
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.invalidEntityProperty",
				properties: { value: "aaa", property: "arrayValue", type: "array" }
			})
		);
	});

	test("can validate a schema with an object property containing object", async () => {
		expect(
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ objectValue: { foo: "", bar: 123 }, nonOptionalString: "" },
				testEntitySchema
			)
		).toBeUndefined();
	});

	test("can validate a schema with an object property containing string", async () => {
		expect(
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ objectValue: "foo", nonOptionalString: "" },
				testEntitySchema
			)
		).toBeUndefined();
	});

	test("can validate a schema with an object property containing number", async () => {
		expect(
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ objectValue: 123, nonOptionalString: "" },
				testEntitySchema
			)
		).toBeUndefined();
	});

	test("can validate a schema with an object property containing boolean", async () => {
		expect(
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ objectValue: true, nonOptionalString: "" },
				testEntitySchema
			)
		).toBeUndefined();
	});

	test("can validate a schema with an object property containing array", async () => {
		expect(
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ objectValue: [123], nonOptionalString: "" },
				testEntitySchema
			)
		).toBeUndefined();
	});

	test("can fail to validate a schema with an object property", async () => {
		expect(() =>
			EntitySchemaHelper.validateEntity(
				{ objectValue: 1n, nonOptionalString: "" },
				testEntitySchema
			)
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.invalidEntityProperty",
				properties: { value: 1n, property: "objectValue", type: "object" }
			})
		);
	});

	test("can validate a schema with a string property within the maximum length", async () => {
		expect(
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ maxLengthString: "12345", nonOptionalString: "" },
				testEntitySchema
			)
		).toBeUndefined();
	});

	test("can fail to validate a schema with a string property exceeding the maximum length", async () => {
		expect(() =>
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ maxLengthString: "123456", nonOptionalString: "" },
				testEntitySchema
			)
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.maxLengthExceeded",
				properties: { property: "maxLengthString", maxLength: 5, length: 6 }
			})
		);
	});

	test("can validate a schema with a string property when no maximum length is defined", async () => {
		expect(
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ stringValue: "a really long string value", nonOptionalString: "" },
				testEntitySchema
			)
		).toBeUndefined();
	});

	test("can validate a schema with a uuid property using the default maximum length", async () => {
		expect(
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ uuidValue: "3f2504e0-4f89-11d3-9a0c-0305e82c3301", nonOptionalString: "" },
				testEntitySchema
			)
		).toBeUndefined();
	});

	test("can fail to validate a schema with a uuid property exceeding the default maximum length", async () => {
		expect(() =>
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ uuidValue: "3f2504e0-4f89-11d3-9a0c-0305e82c3301X", nonOptionalString: "" },
				testEntitySchema
			)
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.maxLengthExceeded",
				properties: { property: "uuidValue", maxLength: 36, length: 37 }
			})
		);
	});

	test("can fail to validate a schema with a uuid property using an explicit maximum length", async () => {
		expect(() =>
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ uuidMaxLengthValue: "3f2504e0-4f89", nonOptionalString: "" },
				testEntitySchema
			)
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.maxLengthExceeded",
				properties: { property: "uuidMaxLengthValue", maxLength: 10, length: 13 }
			})
		);
	});

	test("can validate a schema with a date-time property using the default maximum length", async () => {
		expect(
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ dateTimeValue: new Date(1724515200000).toISOString(), nonOptionalString: "" },
				testEntitySchema
			)
		).toBeUndefined();
	});

	test("can fail to validate a schema with a date-time property exceeding the default maximum length", async () => {
		expect(() =>
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ dateTimeValue: "a".repeat(65), nonOptionalString: "" },
				testEntitySchema
			)
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.maxLengthExceeded",
				properties: { property: "dateTimeValue", maxLength: 64, length: 65 }
			})
		);
	});

	test("can validate a schema with date and time properties using the default maximum length", async () => {
		expect(
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ dateValue: "2024-08-24", timeValue: "16:00:00", nonOptionalString: "" },
				testEntitySchema
			)
		).toBeUndefined();
	});

	test("can fail to validate a schema with a date property exceeding the default maximum length", async () => {
		expect(() =>
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ dateValue: "a".repeat(65), nonOptionalString: "" },
				testEntitySchema
			)
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.maxLengthExceeded",
				properties: { property: "dateValue", maxLength: 64, length: 65 }
			})
		);
	});

	test("can fail to validate a schema with a time property exceeding the default maximum length", async () => {
		expect(() =>
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ timeValue: "a".repeat(65), nonOptionalString: "" },
				testEntitySchema
			)
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.maxLengthExceeded",
				properties: { property: "timeValue", maxLength: 64, length: 65 }
			})
		);
	});

	test("can validate a schema with an email property using the default maximum length", async () => {
		expect(
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ emailValue: "a".repeat(254), nonOptionalString: "" },
				testEntitySchema
			)
		).toBeUndefined();
	});

	test("can fail to validate a schema with an email property exceeding the default maximum length", async () => {
		expect(() =>
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ emailValue: "a".repeat(255), nonOptionalString: "" },
				testEntitySchema
			)
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.maxLengthExceeded",
				properties: { property: "emailValue", maxLength: 254, length: 255 }
			})
		);
	});

	test("can validate a schema with a uri property using the default maximum length", async () => {
		expect(
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ uriValue: "a".repeat(2048), nonOptionalString: "" },
				testEntitySchema
			)
		).toBeUndefined();
	});

	test("can fail to validate a schema with a uri property exceeding the default maximum length", async () => {
		expect(() =>
			EntitySchemaHelper.validateEntity<ITestEntity>(
				{ uriValue: "a".repeat(2049), nonOptionalString: "" },
				testEntitySchema
			)
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.maxLengthExceeded",
				properties: { property: "uriValue", maxLength: 2048, length: 2049 }
			})
		);
	});

	test("can validate a schema with a non optional property", async () => {
		expect(
			EntitySchemaHelper.validateEntity<ITestEntity>({ nonOptionalString: "" }, testEntitySchema)
		).toBeUndefined();
	});

	test("can fail to validate a schema with an non optional property", async () => {
		expect(() =>
			EntitySchemaHelper.validateEntity({} as unknown as ITestEntity, testEntitySchema)
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.invalidOptional",
				properties: { property: "nonOptionalString", type: "string" }
			})
		);
	});

	test("can fail if the entity has additional properties not in the schema", async () => {
		expect(() =>
			EntitySchemaHelper.validateEntity(
				{ a: 1, b: 2, nonOptionalString: "" } as unknown as ITestEntity,
				testEntitySchema
			)
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.invalidEntityKeys",
				properties: { keys: "a, b" }
			})
		);
	});

	test("can fail getVersion with a guard error when schema is undefined", () => {
		expect(() => EntitySchemaHelper.getVersion(undefined as unknown as IEntitySchema)).toThrow(
			expect.objectContaining({
				name: "GuardError",
				message: "guard.objectUndefined"
			})
		);
	});

	test("can get version of 0 when version is absent", () => {
		expect(EntitySchemaHelper.getVersion({ type: "Foo" })).toEqual(0);
	});

	test("can get version of 0 when version is undefined", () => {
		expect(EntitySchemaHelper.getVersion({ type: "Foo", version: undefined })).toEqual(0);
	});

	test("can get the declared version when set", () => {
		expect(EntitySchemaHelper.getVersion({ type: "Foo", version: 5 })).toEqual(5);
	});

	test("can fail getVersion with a guard error when version is not an integer", () => {
		expect(() => EntitySchemaHelper.getVersion({ type: "Foo", version: 1.5 })).toThrow(
			expect.objectContaining({
				name: "GuardError"
			})
		);
	});

	test("can fail getVersion with a general error when version is negative", () => {
		expect(() => EntitySchemaHelper.getVersion({ type: "Foo", version: -1 })).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.versionMustBeGreaterThanOrEqualZero"
			})
		);
	});

	test("can return undefined from findVersionProperty when no property has isVersion set", () => {
		const result = EntitySchemaHelper.findVersionProperty<{ id: string }>({
			type: "test",
			properties: [{ property: "id", type: "string", isPrimary: true }]
		});
		expect(result).toBeUndefined();
	});

	test("can return the property name from findVersionProperty when one integer version property exists", () => {
		const result = EntitySchemaHelper.findVersionProperty<{ id: string; rev: number }>({
			type: "test",
			properties: [
				{ property: "id", type: "string", isPrimary: true },
				{ property: "rev", type: "integer", isVersion: true }
			]
		});
		expect(result).toEqual("rev");
	});

	test("can fail findVersionProperty when multiple properties have isVersion set", () => {
		expect(() =>
			EntitySchemaHelper.findVersionProperty<{ rev: number; rev2: number }>({
				type: "test",
				properties: [
					{ property: "rev", type: "integer", isVersion: true },
					{ property: "rev2", type: "integer", isVersion: true }
				]
			})
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.multipleVersionProperties"
			})
		);
	});

	test("can fail findVersionProperty when the version property is not an integer", () => {
		expect(() =>
			EntitySchemaHelper.findVersionProperty<{ rev: string }>({
				type: "test",
				properties: [{ property: "rev", type: "string", isVersion: true }]
			})
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.versionPropertyMustBeInteger",
				properties: { property: "rev", type: "string" }
			})
		);
	});

	test("can fail to get index groups if there is no schema", () => {
		expect(() => EntitySchemaHelper.getIndexGroups(undefined as unknown as IEntitySchema)).toThrow(
			expect.objectContaining({
				name: "GuardError",
				message: "guard.objectUndefined"
			})
		);
	});

	test("can get no index groups if none are defined", () => {
		const result = EntitySchemaHelper.getIndexGroups<{ id: string }>({
			type: "test",
			properties: [{ property: "id", type: "string", isPrimary: true }]
		});

		expect(result).toEqual({});
	});

	test("can get no index groups if the schema has no properties", () => {
		const result = EntitySchemaHelper.getIndexGroups({ type: "test" });

		expect(result).toEqual({});
	});

	test("can get index groups with a property belonging to multiple groups", () => {
		const result = EntitySchemaHelper.getIndexGroups<{
			prop1: string;
			prop2: string;
			prop3: string;
		}>({
			type: "test",
			properties: [
				{
					property: "prop1",
					type: "string",
					indexGroup: [
						{ name: "aaa", direction: SortDirection.Ascending, index: 0 },
						{ name: "bbb", direction: SortDirection.Descending, index: 0 }
					]
				},
				{
					property: "prop2",
					type: "string",
					indexGroup: [{ name: "aaa", direction: SortDirection.Descending, index: 1 }]
				},
				{
					property: "prop3",
					type: "string",
					indexGroup: [{ name: "bbb", direction: SortDirection.Ascending, index: 1 }]
				}
			]
		});

		expect(Object.keys(result)).toEqual(["aaa", "bbb"]);
		expect(result.aaa.map(p => p.property.property)).toEqual(["prop1", "prop2"]);
		expect(result.aaa.map(p => p.direction)).toEqual([
			SortDirection.Ascending,
			SortDirection.Descending
		]);
		expect(result.bbb.map(p => p.property.property)).toEqual(["prop1", "prop3"]);
		expect(result.bbb.map(p => p.direction)).toEqual([
			SortDirection.Descending,
			SortDirection.Ascending
		]);
	});

	test("can get index group properties ordered by their index and not schema order", () => {
		const result = EntitySchemaHelper.getIndexGroups<{
			prop1: string;
			prop2: string;
			prop3: string;
		}>({
			type: "test",
			properties: [
				{
					property: "prop1",
					type: "string",
					indexGroup: [{ name: "aaa", direction: SortDirection.Ascending, index: 2 }]
				},
				{
					property: "prop2",
					type: "string",
					indexGroup: [{ name: "aaa", direction: SortDirection.Ascending, index: 0 }]
				},
				{
					property: "prop3",
					type: "string",
					indexGroup: [{ name: "aaa", direction: SortDirection.Ascending, index: 1 }]
				}
			]
		});

		expect(result.aaa.map(p => p.property.property)).toEqual(["prop2", "prop3", "prop1"]);
	});

	test("can fail to get index groups when an index entry has an invalid direction", () => {
		expect(() =>
			EntitySchemaHelper.getIndexGroups<{ prop1: string }>({
				type: "test",
				properties: [
					{
						property: "prop1",
						type: "string",
						indexGroup: [
							{ name: "aaa", direction: "sideways" as unknown as SortDirection, index: 0 }
						]
					}
				]
			})
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.invalidIndexGroupDirection",
				properties: { group: "aaa", direction: "sideways", property: "prop1" }
			})
		);
	});

	test("can fail to get index groups when an index entry has a missing index", () => {
		expect(() =>
			EntitySchemaHelper.getIndexGroups<{ prop1: string }>({
				type: "test",
				properties: [
					{
						property: "prop1",
						type: "string",
						indexGroup: [
							{
								name: "aaa",
								direction: SortDirection.Ascending,
								index: undefined as unknown as number
							}
						]
					}
				]
			})
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.invalidIndexGroupIndex",
				properties: { group: "aaa", property: "prop1" }
			})
		);
	});

	test("can fail to get index groups when an index entry has a non integer index", () => {
		expect(() =>
			EntitySchemaHelper.getIndexGroups<{ prop1: string }>({
				type: "test",
				properties: [
					{
						property: "prop1",
						type: "string",
						indexGroup: [{ name: "aaa", direction: SortDirection.Ascending, index: 1.5 }]
					}
				]
			})
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.invalidIndexGroupIndex",
				properties: { group: "aaa", index: 1.5, property: "prop1" }
			})
		);
	});

	test("can fail to get index groups when an index entry has a negative index", () => {
		expect(() =>
			EntitySchemaHelper.getIndexGroups<{ prop1: string }>({
				type: "test",
				properties: [
					{
						property: "prop1",
						type: "string",
						indexGroup: [{ name: "aaa", direction: SortDirection.Ascending, index: -1 }]
					}
				]
			})
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.invalidIndexGroupIndex",
				properties: { group: "aaa", index: -1, property: "prop1" }
			})
		);
	});

	test("can fail to get index groups when two properties share an index in the same group", () => {
		expect(() =>
			EntitySchemaHelper.getIndexGroups<{ prop1: string; prop2: string }>({
				type: "test",
				properties: [
					{
						property: "prop1",
						type: "string",
						indexGroup: [{ name: "aaa", direction: SortDirection.Ascending, index: 0 }]
					},
					{
						property: "prop2",
						type: "string",
						indexGroup: [{ name: "aaa", direction: SortDirection.Ascending, index: 0 }]
					}
				]
			})
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.duplicateIndexGroupIndex",
				properties: { group: "aaa", index: 0, property: "prop2" }
			})
		);
	});

	test("can get index groups when properties share an index in different groups", () => {
		const result = EntitySchemaHelper.getIndexGroups<{
			prop1: string;
			prop2: string;
			prop3: string;
		}>({
			type: "test",
			properties: [
				{
					property: "prop1",
					type: "string",
					indexGroup: [
						{ name: "aaa", direction: SortDirection.Ascending, index: 0 },
						{ name: "bbb", direction: SortDirection.Ascending, index: 0 }
					]
				},
				{
					property: "prop2",
					type: "string",
					indexGroup: [{ name: "aaa", direction: SortDirection.Ascending, index: 1 }]
				},
				{
					property: "prop3",
					type: "string",
					indexGroup: [{ name: "bbb", direction: SortDirection.Ascending, index: 1 }]
				}
			]
		});

		expect(result.aaa.map(p => p.property.property)).toEqual(["prop1", "prop2"]);
		expect(result.bbb.map(p => p.property.property)).toEqual(["prop1", "prop3"]);
	});

	test("can fail to get index groups when a group has fewer than two properties", () => {
		expect(() =>
			EntitySchemaHelper.getIndexGroups<{ prop1: string }>({
				type: "test",
				properties: [
					{
						property: "prop1",
						type: "string",
						indexGroup: [{ name: "aaa", direction: SortDirection.Ascending, index: 0 }]
					}
				]
			})
		).toThrow(
			expect.objectContaining({
				name: "GeneralError",
				message: "entitySchemaHelper.indexGroupMustHaveAtLeastTwoProperties",
				properties: { group: "aaa", count: 1 }
			})
		);
	});

	test("can get index groups ignoring entries with an empty or missing name", () => {
		const result = EntitySchemaHelper.getIndexGroups<{ prop1: string; prop2: string }>({
			type: "test",
			properties: [
				{
					property: "prop1",
					type: "string",
					indexGroup: [{ name: "aaa", direction: SortDirection.Ascending, index: 0 }]
				},
				{
					property: "prop2",
					type: "string",
					indexGroup: [
						{ name: "", direction: SortDirection.Ascending, index: 0 },
						undefined as unknown as IEntitySchemaPropertyIndex,
						{ name: "aaa", direction: SortDirection.Ascending, index: 1 }
					]
				}
			]
		});

		expect(Object.keys(result)).toEqual(["aaa"]);
		expect(result.aaa.map(p => p.property.property)).toEqual(["prop1", "prop2"]);
	});
});
