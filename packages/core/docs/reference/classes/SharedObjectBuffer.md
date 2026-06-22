# Class: SharedObjectBuffer

Manages per-object SharedArrayBuffers that store objects as UTF-8 JSON.
Buffer layout: 4-byte Int32 header (current data byte length) followed by the JSON-encoded object.
Buffers are explicitly created with create and cached in SharedStore.
On a worker thread an existing buffer is fetched via a MessagePort handshake
(same protocol as Mutex) and cached locally.
Buffers grow automatically when the payload exceeds capacity; when the payload drops well below
capacity the buffer is replaced with a smaller one. The caller must hold the objectId-keyed Mutex
around every read and write. The main thread's worker message handler must forward messages to
both Mutex.handleWorkerMessage and SharedObjectBuffer.handleWorkerMessage.

## Constructors

### Constructor

> **new SharedObjectBuffer**(): `SharedObjectBuffer`

#### Returns

`SharedObjectBuffer`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

***

### DEFAULT\_CAPACITY\_BYTES {#default_capacity_bytes}

> `readonly` `static` **DEFAULT\_CAPACITY\_BYTES**: `number`

Default payload capacity per object (1 MiB). The first caller that creates the buffer
for an object determines its initial capacity; later callers that pass a different value
are ignored.

***

### MAX\_CAPACITY\_BYTES {#max_capacity_bytes}

> `readonly` `static` **MAX\_CAPACITY\_BYTES**: `number`

Default upper bound for how large a buffer may grow (256 MiB).
Override per-object via the maxCapacityBytes option on create.

## Methods

### create() {#create}

> `static` **create**(`objectId`, `options?`): `Promise`\<`void`\>

Create the buffer for the given objectId if it does not already exist.
Must be called while holding Mutex.lock(objectId).

#### Parameters

##### objectId

`string`

The object id that identifies the buffer.

##### options?

[`ISharedObjectBufferOptions`](../interfaces/ISharedObjectBufferOptions.md)

Optional capacity configuration used when creating the buffer.

#### Returns

`Promise`\<`void`\>

***

### read() {#read}

> `static` **read**\<`T`\>(`objectId`): `Promise`\<`T` \| `undefined`\>

Read and decode the object stored for the given objectId.
Must be called while holding Mutex.lock(objectId).

#### Type Parameters

##### T

`T`

#### Parameters

##### objectId

`string`

The object id that identifies the buffer.

#### Returns

`Promise`\<`T` \| `undefined`\>

The stored object, or undefined when nothing has been written yet.

***

### write() {#write}

> `static` **write**\<`T`\>(`objectId`, `value`): `Promise`\<`void`\>

Encode and write the object into the buffer for the given objectId.
The buffer must already exist, usually by calling create first.
When the encoded payload exceeds the current buffer capacity the buffer is grown
in-place via SharedArrayBuffer.grow so every thread with a reference sees the
new size without any pointer swap. When the payload is smaller than
_SHRINK_THRESHOLD of the current capacity and the capacity exceeds
DEFAULT_CAPACITY_BYTES, the buffer is replaced with a smaller one on the calling thread.
Must be called while holding Mutex.lock(objectId).

#### Type Parameters

##### T

`T`

#### Parameters

##### objectId

`string`

The object id that identifies the buffer.

##### value

`T`

The object to persist.

#### Returns

`Promise`\<`void`\>

***

### remove() {#remove}

> `static` **remove**(`objectId`): `void`

Remove the stored object and release the buffer for the given objectId.
The entry is deleted from the local cache so subsequent reads or writes will
create or fetch a fresh buffer. Worker threads that have cached the old buffer
reference continue using it until they restart or re-request via the worker protocol.
Must be called while holding Mutex.lock(objectId).

#### Parameters

##### objectId

`string`

The object id that identifies the buffer.

#### Returns

`void`

***

### handleWorkerMessage() {#handleworkermessage}

> `static` **handleWorkerMessage**(`msg`): `boolean`

Inspect a message from a worker thread and, if it is a SharedObjectBuffer
buffer-fetch request, respond to it synchronously.
Call this from the main thread's worker message handler alongside
Mutex.handleWorkerMessage.

#### Parameters

##### msg

`unknown`

The raw message received from the worker.

#### Returns

`boolean`

True if the message was a SharedObjectBuffer protocol message, false otherwise.
