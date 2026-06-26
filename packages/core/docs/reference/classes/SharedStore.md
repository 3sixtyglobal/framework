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

Get a property from the shared store, creating and storing it with the
factory if absent. The factory is invoked synchronously so its return
value - including a Promise - is stored before any async yield, making
this safe against concurrent callers.

#### Param

**prop**

The name of the property to get or create.

#### Param

**factory**

A synchronous factory that produces the initial value.

#### Call Signature

> `static` **get**\<`T`\>(`prop`): `T` \| `undefined`

Get a property from the shared store.

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### prop

`string`

The name of the property to get.

##### Returns

`T` \| `undefined`

The property if it exists.

#### Call Signature

> `static` **get**\<`T`\>(`prop`, `factory`): `T`

Get a property from the shared store, creating and storing it with the
factory if absent. The factory is invoked synchronously so its return
value - including a Promise - is stored before any async yield, making
this safe against concurrent callers.

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### prop

`string`

The name of the property to get or create.

###### factory

() => `T`

A synchronous factory that produces the initial value.

##### Returns

`T`

The existing or newly created value.

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
