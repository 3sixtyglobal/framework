// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { entity } from "../../src/decorators/entityDecorator.js";
import { property } from "../../src/decorators/propertyDecorator.js";
import type { IEntitySchema } from "../../src/models/IEntitySchema.js";
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
});
