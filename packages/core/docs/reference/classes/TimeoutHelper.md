# Class: TimeoutHelper

Helper for bounding operations which can fail to settle.

## Constructors

### Constructor

> **new TimeoutHelper**(): `TimeoutHelper`

#### Returns

`TimeoutHelper`

## Methods

### withTimeout() {#withtimeout}

> `static` **withTimeout**\<`T`\>(`operation`, `timeoutMs`, `onTimeout`): `Promise`\<`T`\>

Stop waiting for an operation which has not settled within the given time.
The operation itself cannot be cancelled, so a timed out operation is abandoned, which is
the only option available when the code being called can leave the promise it returned
pending forever.

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

##### onTimeout

() => `T`

Called when the wait expires, throw from it to fail the operation, or
return a value to complete it with that value instead.

#### Returns

`Promise`\<`T`\>

The result of the operation, or the value returned by onTimeout.
