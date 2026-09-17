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

***

### FORMAT\_MAX\_LENGTHS {#format_max_lengths}

> `readonly` `static` **FORMAT\_MAX\_LENGTHS**: `object`

The default maximum lengths for string properties, keyed by their format.

#### Index Signature

\[`format`: `string`\]: `number`

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

### getIndexGroups() {#getindexgroups}

> `static` **getIndexGroups**\<`T`\>(`entitySchema`): `object`

Get the composite index groups from the schema.
Each property can be part of multiple indexes through its `indexGroup` list, so a property
can appear in more than one group. The properties within a group are ordered by the `index`
of their index entry, and each is returned with the sort direction it declared for that group.

#### Type Parameters

##### T

`T`

#### Parameters

##### entitySchema

[`IEntitySchema`](../interfaces/IEntitySchema.md)\<`T`\>

The entity schema to find the index groups from.

#### Returns

`object`

The properties and their directions keyed by the group name, empty if there are no groups.

#### Throws

GeneralError if an index entry has an invalid direction or index, or if two properties
claim the same index within the same group.

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

If the entity is invalid, or a string value exceeds its maxLength.

***

### findVersionProperty() {#findversionproperty}

> `static` **findVersionProperty**\<`T`\>(`schema`): `string` \| `undefined`

Find the property in the schema that is marked as the optimistic-lock version token.

#### Type Parameters

##### T

`T`

#### Parameters

##### schema

[`IEntitySchema`](../interfaces/IEntitySchema.md)\<`T`\>

The entity schema to search.

#### Returns

`string` \| `undefined`

The name of the version property, or undefined if none is declared.

#### Throws

GeneralError if more than one property has isVersion set.

#### Throws

GeneralError if the version property type is not integer.
