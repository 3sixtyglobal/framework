# Class: EntitySchemaHelper

Class to help with entity schema operations.

## Constructors

### Constructor

> **new EntitySchemaHelper**(): `EntitySchemaHelper`

#### Returns

`EntitySchemaHelper`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### getSchema() {#getschema}

> `static` **getSchema**\<`T`\>(`target`): [`IEntitySchema`](../interfaces/IEntitySchema.md)\<`T`\>

Get the schema for the specified object.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### target

`any`

The object to get the schema data for.

#### Returns

[`IEntitySchema`](../interfaces/IEntitySchema.md)\<`T`\>

The schema for the object if it can be found.

***

### getVersion() {#getversion}

> `static` **getVersion**(`entitySchema`): `number`

Get the version of the entity schema, defaulting to 0 when absent.
This is the single source of truth for the "absent version = v0" convention.
When a version is present it must be a non-negative integer >= 0.

#### Parameters

##### entitySchema

[`IEntitySchema`](../interfaces/IEntitySchema.md)

The entity schema to read the version from.

#### Returns

`number`

The declared version, or 0 if no version was set.

#### Throws

GuardError if entitySchema is undefined or version is not an integer.

#### Throws

GeneralError if version is present but less than 0.

***

### getPrimaryKey() {#getprimarykey}

> `static` **getPrimaryKey**\<`T`\>(`entitySchema`): [`IEntitySchemaProperty`](../interfaces/IEntitySchemaProperty.md)\<`T`\>

Get the primary key from the entity schema.

#### Type Parameters

##### T

`T`

#### Parameters

##### entitySchema

[`IEntitySchema`](../interfaces/IEntitySchema.md)\<`T`\>

The entity schema to find the primary key from.

#### Returns

[`IEntitySchemaProperty`](../interfaces/IEntitySchemaProperty.md)\<`T`\>

The key if only one was found.

#### Throws

If no primary key was found, or more than one.

***

### getSortProperties() {#getsortproperties}

> `static` **getSortProperties**\<`T`\>(`entitySchema`): [`IEntitySort`](../interfaces/IEntitySort.md)\<`T`\>[] \| `undefined`

Get the sort properties from the schema.

#### Type Parameters

##### T

`T`

#### Parameters

##### entitySchema

[`IEntitySchema`](../interfaces/IEntitySchema.md)\<`T`\>

The entity schema to find the primary key from.

#### Returns

[`IEntitySort`](../interfaces/IEntitySort.md)\<`T`\>[] \| `undefined`

The sort keys from the schema or undefined if there are none.

***

### buildSortProperties() {#buildsortproperties}

> `static` **buildSortProperties**\<`T`\>(`entitySchema`, `overrideSortKeys?`): [`IEntitySort`](../interfaces/IEntitySort.md)\<`T`\>[] \| `undefined`

Build sort properties from the schema and override if necessary.

#### Type Parameters

##### T

`T`

#### Parameters

##### entitySchema

[`IEntitySchema`](../interfaces/IEntitySchema.md)\<`T`\>

The entity schema to retrieve the default sort keys.

##### overrideSortKeys?

`object`[]

The override sort keys.

#### Returns

[`IEntitySort`](../interfaces/IEntitySort.md)\<`T`\>[] \| `undefined`

The finalised sort keys.

***

### validateEntity() {#validateentity}

> `static` **validateEntity**\<`T`\>(`entity`, `entitySchema`): `void`

Validate the entity against the schema.

#### Type Parameters

##### T

`T`

#### Parameters

##### entity

`T`

The entity to validate.

##### entitySchema

[`IEntitySchema`](../interfaces/IEntitySchema.md)\<`T`\>

The schema to validate against.

#### Returns

`void`

#### Throws

If the entity is invalid.
