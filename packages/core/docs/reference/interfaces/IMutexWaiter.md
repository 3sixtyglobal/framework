# Interface: IMutexWaiter

A caller queued on a mutex key, waiting to be handed the lock.

## Properties

### settled {#settled}

> **settled**: `boolean`

Has the waiter already been granted the lock or given up waiting.

***

### resolve? {#resolve}

> `optional` **resolve?**: (`granted`) => `void`

Resolves the queued caller, true when it now owns the lock.

#### Parameters

##### granted

`boolean`

#### Returns

`void`

***

### timer? {#timer}

> `optional` **timer?**: `Timeout`

Timer which enforces the waiter's deadline.
