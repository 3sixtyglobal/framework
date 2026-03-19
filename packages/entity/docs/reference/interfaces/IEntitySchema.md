# Interface: IEntitySchema\<T\>

Definition for an entity schema.

## Type Parameters

### T

`T` = `unknown`

## Properties

### type {#type}

> **type**: `string` \| `undefined`

The type of the entity.

***

### options? {#options}

> `optional` **options?**: [`IEntitySchemaOptions`](IEntitySchemaOptions.md)

The options for the entity.

***

### properties? {#properties}

> `optional` **properties?**: [`IEntitySchemaProperty`](IEntitySchemaProperty.md)\<`T`\>[]

The properties of the entity.
