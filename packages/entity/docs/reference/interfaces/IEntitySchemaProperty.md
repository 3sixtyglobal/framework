# Interface: IEntitySchemaProperty\<T\>

Definition for an entity schema property.

## Type Parameters

### T

`T` = `unknown`

## Properties

### property {#property}

> **property**: keyof `T`

The property name from the entity.

***

### type {#type}

> **type**: [`EntitySchemaPropertyType`](../type-aliases/EntitySchemaPropertyType.md)

The type of the property.

***

### format? {#format}

> `optional` **format?**: [`EntitySchemaPropertyFormat`](../type-aliases/EntitySchemaPropertyFormat.md)

The format of the property.

***

### maxLength? {#maxlength}

> `optional` **maxLength?**: `number`

The maximum length of the property value i.e. for text fields.

***

### isPrimary? {#isprimary}

> `optional` **isPrimary?**: `boolean`

Is this the primary index property.

***

### isSecondary? {#issecondary}

> `optional` **isSecondary?**: `boolean`

Is this a secondary index property.

***

### indexGroup? {#indexgroup}

> `optional` **indexGroup?**: [`IEntitySchemaPropertyIndex`](IEntitySchemaPropertyIndex.md)[]

The composite indexes this property is part of.
Connectors can use these to build a composite index for each group name,
combining all the properties which share that name, ordered by their index.

***

### isVersion? {#isversion}

> `optional` **isVersion?**: `boolean`

Is this property used as the optimistic-lock version token.
When true, connectors automatically manage the field: the value is
incremented on every successful write, and a write is rejected with a
ConflictError when the submitted value does not match the stored value.
Must be an integer property.

***

### sortDirection? {#sortdirection}

> `optional` **sortDirection?**: [`SortDirection`](../type-aliases/SortDirection.md)

Default sort direction for this field, leave empty if not sortable.

***

### optional? {#optional}

> `optional` **optional?**: `boolean`

Is the property optional.

***

### itemType? {#itemtype}

> `optional` **itemType?**: [`EntitySchemaPropertyType`](../type-aliases/EntitySchemaPropertyType.md)

The type of the item (only applies when type is `array`).

***

### itemTypeRef? {#itemtyperef}

> `optional` **itemTypeRef?**: `string`

The type ref of the item (only applies when type is either `array` or `object`).

***

### description? {#description}

> `optional` **description?**: `string`

Description of the object.

***

### examples? {#examples}

> `optional` **examples?**: `unknown`[]

Examples of the property values.

***

### defaultValue? {#defaultvalue}

> `optional` **defaultValue?**: `unknown`

A default value which can be used in migrations when the property value is not provided.
