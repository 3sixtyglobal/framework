# Interface: IEntitySchemaDiff\<T, U\>

The result of comparing two sets of entity schema properties.

## Type Parameters

### T

`T` = `unknown`

### U

`U` = `unknown`

## Properties

### unchanged {#unchanged}

> **unchanged**: [`IEntitySchemaProperty`](IEntitySchemaProperty.md)\<`T` \| `U`\>[]

Properties that are structurally identical between the old and new schemas.

***

### added {#added}

> **added**: [`IEntitySchemaProperty`](IEntitySchemaProperty.md)\<`U`\>[]

Properties present in the new schema but absent from the old one.

***

### removed {#removed}

> **removed**: [`IEntitySchemaProperty`](IEntitySchemaProperty.md)\<`T`\>[]

Properties present in the old schema but absent from the new one.

***

### modified {#modified}

> **modified**: `object`[]

Properties that exist in both schemas but differ in at least one structural
field (property, type, format, isPrimary, isSecondary, sortDirection, optional, itemType, itemTypeRef).
`from` is the old descriptor; `to` is the new one.

#### from

> **from**: [`IEntitySchemaProperty`](IEntitySchemaProperty.md)\<`T`\>

The old property descriptor.

#### to

> **to**: [`IEntitySchemaProperty`](IEntitySchemaProperty.md)\<`U`\>

The new property descriptor.
