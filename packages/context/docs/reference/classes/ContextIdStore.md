# Class: ContextIdStore

Class to maintain context ids and execute an async method.

## Constructors

### Constructor

> **new ContextIdStore**(): `ContextIdStore`

#### Returns

`ContextIdStore`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### run() {#run}

> `static` **run**\<`T`\>(`contextIds`, `asyncMethod`): `Promise`\<`T`\>

Execute the method wrapped in the context.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### contextIds

[`IContextIds`](../interfaces/IContextIds.md)

The context IDs.

##### asyncMethod

() => `T`

The async method to run.

#### Returns

`Promise`\<`T`\>

A promise that resolves with the result of the async method.

***

### getContextIds() {#getcontextids}

> `static` **getContextIds**(): `Promise`\<[`IContextIds`](../interfaces/IContextIds.md) \| `undefined`\>

Get the context IDs.

#### Returns

`Promise`\<[`IContextIds`](../interfaces/IContextIds.md) \| `undefined`\>

The context IDs.

***

### getStorage() {#getstorage}

> `static` **getStorage**(): `Promise`\<`AsyncLocalStorage`\<[`IContextIds`](../interfaces/IContextIds.md)\>\>

Get the storage and create it if it doesn't exist.

#### Returns

`Promise`\<`AsyncLocalStorage`\<[`IContextIds`](../interfaces/IContextIds.md)\>\>

The storage.
