# Class: TimeoutHelper

Helper for bounding operations which can fail to settle.

## Constructors

### Constructor

> **new TimeoutHelper**(): `TimeoutHelper`

#### Returns

`TimeoutHelper`

## Methods

### withTimeout() {#withtimeout}

> `static` **withTimeout**\<`T`\>(`operation`, `timeoutMs`, `source`, `message`, `properties?`): `Promise`\<`T`\>

Reject an operation which has not settled within the given time.
The operation itself cannot be cancelled, so a timed out operation is abandoned, which is
the only option available when the identity wasm bindings panic instead of rejecting and
leave the promise they returned pending forever.

#### Type Parameters

##### T

`T`

#### Parameters

##### operation

`Promise`\<`T`\>

The operation to bound.

##### timeoutMs

`number`

The maximum time to wait in milliseconds, 0 or less waits indefinitely.

##### source

`string`

The source to use for the timeout error.

##### message

`string`

The message key to use for the timeout error.

##### properties?

Additional properties to include in the timeout error.

#### Returns

`Promise`\<`T`\>

The result of the operation.

#### Throws

GeneralError if the operation has not settled within timeoutMs.
