# Interface: IEntitySchema\<T\>

Definition for an entity schema.

## Extends

- [`IEntitySchemaOptions`](IEntitySchemaOptions.md)

## Type Parameters

### T

`T` = `unknown`

## Properties

### type {#type}

> **type**: `string` \| `undefined`

The type of the entity.

***

### properties? {#properties}

> `optional` **properties?**: [`IEntitySchemaProperty`](IEntitySchemaProperty.md)\<`T`\>[]

The properties of the entity.

***

### description? {#description}

> `optional` **description?**: `string`

Description of the object.

#### Inherited from

[`IEntitySchemaOptions`](IEntitySchemaOptions.md).[`description`](IEntitySchemaOptions.md#description)

***

### version? {#version}

> `optional` **version?**: `number`

The schema version. Used to drive ordered migrations. Absent is treated as version 0.

#### Inherited from

[`IEntitySchemaOptions`](IEntitySchemaOptions.md).[`version`](IEntitySchemaOptions.md#version)
