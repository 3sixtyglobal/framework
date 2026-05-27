# Class: Mutex

A cross-thread mutex built on Atomics and SharedArrayBuffer.

When isMainThread is true (main thread or fork-mode child process) the class acts as
the authoritative registry: it creates a SharedArrayBuffer-backed Int32Array for each
key on first use and never discards it, because worker threads may hold references to
the same underlying memory.

When isMainThread is false (a true worker thread) the class synchronously negotiates
the shared buffer with the main thread on first use of each key, then caches it locally.
The main thread must call Mutex.handleWorkerMessage(msg) from its worker message handler
before that worker first calls Mutex.lock().

The lock is not re-entrant: a thread that already holds a key and calls lock() again on
the same key will block until the timeout elapses.

## Constructors

### Constructor

> **new Mutex**(): `Mutex`

#### Returns

`Mutex`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### lock() {#lock}

> `static` **lock**(`key`, `options?`): `boolean`

Acquires a lock for the given key. If the lock is already held, it will wait until it is released or until the timeout is reached.
The lock is not re-entrant: if the same thread tries to acquire the same lock again, it will deadlock until the timeout is reached.

WARNING: this method calls Atomics.wait internally. On the main thread this blocks the Node.js event loop for the
duration of the wait. Do not call from the main thread while a worker thread may simultaneously need to fetch a
buffer for a new mutex key, as that fetch requires the main thread's message loop to be running and will deadlock.

#### Parameters

##### key

`string`

The key to lock on.

##### options?

Lock options.

###### timeoutMs?

`number`

The maximum time to wait for the lock in milliseconds, default is 5000.

###### throwOnTimeout?

`boolean`

Whether to throw an error if the lock could not be acquired within the timeout, default is false.

#### Returns

`boolean`

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
