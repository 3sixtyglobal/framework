# Class: EntitySchemaDiffHelper

Helper class for comparing entity schemas and generating diffs.

## Constructors

### Constructor

> **new EntitySchemaDiffHelper**(): `EntitySchemaDiffHelper`

#### Returns

`EntitySchemaDiffHelper`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### diff() {#diff}

> `static` **diff**\<`T`, `U`\>(`oldProperties`, `newProperties`, `renames?`): [`IEntitySchemaDiff`](../interfaces/IEntitySchemaDiff.md)\<`T`, `U`\>

Compare two arrays of entity schema properties and return a structured diff.

Properties are matched by their `property` key name. A property is considered modified when any structural field differs: `type`, `format`, `isPrimary`, `isSecondary`, `isVersion`, `sortDirection`, `optional`, `itemType`, or `itemTypeRef`.
Documentation-only fields (`description`, `examples`) are intentionally excluded from the comparison to avoid spurious diffs.

Because a pure name change cannot be detected automatically, callers may supply a `renames` list mapping old names to new names. Renamed properties appear in `modified` (never in `added` or `removed`) even when no other fields changed. Rename lookups take priority over direct same-name matches, which allows swap renames to work correctly and prevents a renamed source from silently disappearing when the target name already existed in the old schema. Self-renames (`from === to`) are ignored and the property is classified normally.

When `renames` contains duplicate entries: if two entries share the same target, the last definition wins and the first source is treated as removed; if two entries share the same source, the first target wins and the second target is treated as added. Both cases are deterministic but callers should avoid them.

#### Type Parameters

##### T

`T`

##### U

`U` = `T`

#### Parameters

##### oldProperties

[`IEntitySchemaProperty`](../interfaces/IEntitySchemaProperty.md)\<`T`\>[]

The property descriptors from the current (live) schema.

##### newProperties

[`IEntitySchemaProperty`](../interfaces/IEntitySchemaProperty.md)\<`U`\>[]

The property descriptors from the target (new) schema.

##### renames?

`object`[]

Optional list of property renames `{ from, to }` where `from` is the old name and `to` is the new name.

#### Returns

[`IEntitySchemaDiff`](../interfaces/IEntitySchemaDiff.md)\<`T`, `U`\>

A diff object with `added`, `removed`, `modified`, and `unchanged` arrays, each containing full `IEntitySchemaProperty` descriptors.

#### Throws

`GeneralError` if either input array contains duplicate property keys.

***

### hasChanges() {#haschanges}

> `static` **hasChanges**\<`T`, `U`\>(`diff`): `boolean`

Returns true when the diff contains at least one added, removed, or modified property.

#### Type Parameters

##### T

`T`

##### U

`U`

#### Parameters

##### diff

[`IEntitySchemaDiff`](../interfaces/IEntitySchemaDiff.md)\<`T`, `U`\>

The diff to check.

#### Returns

`boolean`

True if the diff has any structural changes.

***

### schemaPropertiesEqual() {#schemapropertiesequal}

> `static` **schemaPropertiesEqual**\<`T`, `U`\>(`schema1`, `schema2`): `boolean`

Compare two property descriptors for structural equality.
The `property` name field and documentation fields (`description`, `examples`) are intentionally excluded - callers match by name before invoking this method.

#### Type Parameters

##### T

`T`

##### U

`U`

#### Parameters

##### schema1

[`IEntitySchemaProperty`](../interfaces/IEntitySchemaProperty.md)\<`T`\>

The first property descriptor.

##### schema2

[`IEntitySchemaProperty`](../interfaces/IEntitySchemaProperty.md)\<`U`\>

The second property descriptor.

#### Returns

`boolean`

True if all structural fields are equal.
