# Class: Mutex

A cross-thread mutex built on Atomics and SharedArrayBuffer.

The static methods are a facade over a single instance held in the SharedStore, so every
load of this package on a thread shares one set of registries. Each thread has its own
instance; the mutual exclusion between threads comes from the SharedArrayBuffer behind
each key, not from the instance itself.

When isMainThread is true (main thread or fork-mode child process) the instance acts as
the authoritative registry: it creates a SharedArrayBuffer-backed Int32Array for each
key on first use. An entry is discarded once the key is idle, so a workload which touches
many distinct keys does not grow the registry without bound. A key which has been handed
to a worker thread is retained for the life of the process, because the worker caches the
Int32Array it was given and re-creating the buffer would hand two threads different memory
for the same key, silently breaking mutual exclusion.

When isMainThread is false (a true worker thread) the instance synchronously negotiates
the shared buffer with the main thread on first use of each key, then caches it locally.
The main thread must call Mutex.handleWorkerMessage(msg) from its worker message handler
before that worker first calls Mutex.lock().

Callers on the same thread are served in the order they arrived. Each key has a FIFO
queue of waiters, unlock() hands the lock directly to the waiter at the front, and a new
caller only takes the lock outright when that queue is empty. Without this a caller that
arrives while a waiter is being woken can take the lock first, which lets a busy key
starve a waiter until its timeout elapses. Threads still contend with each other for the
shared lock, so the ordering guarantee is per thread rather than global.

The lock is not re-entrant: a thread that already holds a key and calls lock() again on
the same key will block until the timeout elapses.

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### getDefaultTimeoutMs() {#getdefaulttimeoutms}

> `static` **getDefaultTimeoutMs**(): `number`

Gets the default timeout in milliseconds for lock acquisition.

#### Returns

`number`

The default timeout in milliseconds.

***

### setDefaultTimeoutMs() {#setdefaulttimeoutms}

> `static` **setDefaultTimeoutMs**(`timeoutMs`): `void`

Sets the default timeout in milliseconds for lock acquisition.

#### Parameters

##### timeoutMs

`number`

The default timeout in milliseconds.

#### Returns

`void`

#### Throws

GeneralError if timeoutMs is not a non-negative integer.

***

### lock() {#lock}

> `static` **lock**(`key`, `options?`): `Promise`\<`boolean`\>

Acquires a lock for the given key without blocking the event loop. If the lock is already
held, it suspends the current async task until the lock is released or the timeout is reached.
Use this in async single-threaded contexts (e.g. the main thread or a Fastify route handler)
where calling the synchronous lock() would freeze the event loop and deadlock.
Callers on the same thread are served in the order they arrived, so a contended key
cannot starve an earlier caller.
The lock is not re-entrant: if the same context holds the key and calls lockAsync() again on
the same key, it will suspend until the timeout elapses.

#### Parameters

##### key

`string`

The key to lock on.

##### options?

Lock options.

###### timeoutMs?

`number`

The maximum time to wait for the lock in milliseconds, defaults to getDefaultTimeoutMs().

###### throwOnTimeout?

`boolean`

Whether to throw an error if the lock could not be acquired within the timeout, default is false.

#### Returns

`Promise`\<`boolean`\>

True if the lock was acquired, false if it timed out and throwOnTimeout is false.

#### Throws

GeneralError if the key is invalid or if the lock could not be acquired within the timeout and throwOnTimeout is true.

***

### unlock() {#unlock}

> `static` **unlock**(`key`): `void`

Releases the lock for the given key.

#### Parameters

##### key

`string`

The key to unlock.

#### Returns

`void`

#### Throws

GeneralError if the key is invalid or the lock is not currently held.

***

### handleWorkerMessage() {#handleworkermessage}

> `static` **handleWorkerMessage**(`msg`): `boolean`

Inspect a message received from a worker and, if it is a Mutex buffer-fetch request,
respond to it synchronously. Call from the main thread's worker message handler.

#### Parameters

##### msg

`unknown`

The raw message received from the worker.

#### Returns

`boolean`

True if the message was a Mutex protocol message and was handled, false otherwise.
