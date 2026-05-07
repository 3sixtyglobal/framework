# Function: entitySchemaDiff()

> **entitySchemaDiff**\<`T`\>(`oldProperties`, `newProperties`): [`IEntitySchemaDiff`](../interfaces/IEntitySchemaDiff.md)\<`T`\>

Compare two arrays of entity schema properties and return a structured diff.

Properties are matched by their `property` key name. A property is considered
modified when any structural field differs: `type`, `format`, `isPrimary`,
`isSecondary`, `sortDirection`, `optional`, `itemType`, or `itemTypeRef`.
Documentation-only fields (`description`, `examples`) are intentionally
excluded from the comparison to avoid spurious diffs.

## Type Parameters

### T

`T`

## Parameters

### oldProperties

[`IEntitySchemaProperty`](../interfaces/IEntitySchemaProperty.md)\<`T`\>[]

The property descriptors from the current (live) schema.

### newProperties

[`IEntitySchemaProperty`](../interfaces/IEntitySchemaProperty.md)\<`T`\>[]

The property descriptors from the target (new) schema.

## Returns

[`IEntitySchemaDiff`](../interfaces/IEntitySchemaDiff.md)\<`T`\>

A diff object with `added`, `removed`, and `modified` arrays, each
containing full `IEntitySchemaProperty` descriptors.
