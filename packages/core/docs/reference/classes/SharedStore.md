# Class: SharedStore

Provide a store for shared objects which can be accessed through multiple
instance loads of a package.

## Constructors

### Constructor

> **new SharedStore**(): `SharedStore`

#### Returns

`SharedStore`

## Methods

### get() {#get}

> `static` **get**\<`T`\>(`prop`): `T` \| `undefined`

Get a property from the shared store.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### prop

`string`

The name of the property to get.

#### Returns

`T` \| `undefined`

The property if it exists.

***

### set() {#set}

> `static` **set**\<`T`\>(`prop`, `value`): `void`

Set the property in the shared store.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### prop

`string`

The name of the property to set.

##### value

`T`

The value to set.

#### Returns

`void`

***

### remove() {#remove}

> `static` **remove**(`prop`): `void`

Remove a property from the shared store.

#### Parameters

##### prop

`string`

The name of the property to remove.

#### Returns

`void`
