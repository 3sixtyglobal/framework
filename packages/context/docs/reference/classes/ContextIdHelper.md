# Class: ContextIdHelper

Class to help with context IDs.

## Constructors

### Constructor

> **new ContextIdHelper**(): `ContextIdHelper`

#### Returns

`ContextIdHelper`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### guard() {#guard}

> `static` **guard**\<`T`, `K`\>(`contextIds`, `key`): `asserts contextIds is T & { [P in string]: string }`

Perform a runtime guard on the provided context ID value.

#### Type Parameters

##### T

`T` *extends* `object`

##### K

`K` *extends* `string`

#### Parameters

##### contextIds

`T` \| `undefined`

The context IDs to guard.

##### key

`K`

The context ID key to guard.

#### Returns

`asserts contextIds is T & { [P in string]: string }`

#### Throws

Guard error if the value is invalid.

***

### short() {#short}

> `static` **short**(`contextIds`, `key`): `string`

Gets the short version of a context ID.

#### Parameters

##### contextIds

[`IContextIds`](../interfaces/IContextIds.md) \| `undefined`

The context IDs to get the short version from.

##### key

`string`

The context ID key to get the short version for.

#### Returns

`string`

The short version of the context ID.

#### Throws

Guard error if the value is invalid.

***

### guardAll() {#guardall}

> `static` **guardAll**\<`T`, `K`\>(`contextIds`, `keys`): `asserts contextIds is T & { [P in string]: string }`

Perform a runtime guard on the provided context ID values.

#### Type Parameters

##### T

`T` *extends* `object`

##### K

`K` *extends* `string`

#### Parameters

##### contextIds

`T` \| `undefined`

The context IDs to guard.

##### keys

readonly `K`[] \| `undefined`

The context ID keys to guard.

#### Returns

`asserts contextIds is T & { [P in string]: string }`

#### Throws

Guard error if the value is invalid.

***

### long() {#long}

> `static` **long**(`contextIds`, `key`): `string`

Gets the long version of a context ID, expanding from a short form if a handler is registered.

#### Parameters

##### contextIds

[`IContextIds`](../interfaces/IContextIds.md) \| `undefined`

The context IDs to get the long version from.

##### key

`string`

The context ID key to get the long version for.

#### Returns

`string`

The long version of the context ID.

#### Throws

Guard error if the value is invalid.

***

### longAll() {#longall}

> `static` **longAll**(`contextIds`, `keys`): [`IContextIds`](../interfaces/IContextIds.md)

Gets the long versions of multiple context IDs.

#### Parameters

##### contextIds

[`IContextIds`](../interfaces/IContextIds.md) \| `undefined`

The context IDs to get the long versions from.

##### keys

`string`[] \| `undefined`

The context ID keys to get the long versions for.

#### Returns

[`IContextIds`](../interfaces/IContextIds.md)

The long versions of the context IDs.

***

### shortAll() {#shortall}

> `static` **shortAll**(`contextIds`, `keys`): [`IContextIds`](../interfaces/IContextIds.md)

Gets the short versions of multiple context IDs.

#### Parameters

##### contextIds

[`IContextIds`](../interfaces/IContextIds.md) \| `undefined`

The context IDs to get the short versions from.

##### keys

`string`[] \| `undefined`

The context ID keys to get the short versions for.

#### Returns

[`IContextIds`](../interfaces/IContextIds.md)

The short versions of the context IDs.

***

### shortCombined() {#shortcombined}

> `static` **shortCombined**(`contextIds`, `keys`, `separator?`): `string` \| `undefined`

Gets the combined short version.

#### Parameters

##### contextIds

[`IContextIds`](../interfaces/IContextIds.md) \| `undefined`

The context IDs to get the short versions from.

##### keys

`string`[] \| `undefined`

The context ID keys to get the short versions for.

##### separator?

`string` = `"/"`

The separator to use between parts.

#### Returns

`string` \| `undefined`

The short version combined.

***

### shortSplit() {#shortsplit}

> `static` **shortSplit**(`keys`, `combined`, `separator?`): [`IContextIds`](../interfaces/IContextIds.md)

Split a combined short version in to the separate context IDs.

#### Parameters

##### keys

`string`[]

The context ID keys to get the short versions for.

##### combined

`string`

The combined short version to separate.

##### separator?

`string` = `"/"`

The separator used between parts.

#### Returns

[`IContextIds`](../interfaces/IContextIds.md)

The short version combined.

#### Throws

GeneralError if the number of parts does not match the number of keys.

***

### combinedContextKey() {#combinedcontextkey}

> `static` **combinedContextKey**(`contextIds`, `keys`, `separator?`): `string` \| `undefined`

Create a combined key.

#### Parameters

##### contextIds

[`IContextIds`](../interfaces/IContextIds.md) \| `undefined`

The context IDs to create the combined key for.

##### keys

`string`[] \| `undefined`

The context ID keys to get the short versions for.

##### separator?

`string` = `"/"`

The separator to use between parts.

#### Returns

`string` \| `undefined`

The short version combined.

***

### pickKeysFromAvailable() {#pickkeysfromavailable}

> `static` **pickKeysFromAvailable**(`availableKeys?`, `desiredKeys?`): `string`[]

Pick only the desired keys from the available keys.

#### Parameters

##### availableKeys?

`string`[]

The available keys to pick from.

##### desiredKeys?

`string`[]

The desired keys to pick.

#### Returns

`string`[]

The picked keys.
