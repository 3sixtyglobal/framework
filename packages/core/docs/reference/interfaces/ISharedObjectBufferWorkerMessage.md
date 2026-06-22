# Interface: ISharedObjectBufferWorkerMessage

Message sent from a worker thread to the main thread to request the SharedArrayBuffer for an object.

## Properties

### type {#type}

> **type**: `"twin:sharedObjectBuffer:getBuffer"`

The message type discriminant.

***

### objectId {#objectid}

> **objectId**: `string`

The object id name that identifies which buffer is being requested.

***

### signal {#signal}

> **signal**: `SharedArrayBuffer`

One-shot SharedArrayBuffer used for the Atomics.wait/notify handshake so the
worker can block synchronously until the main thread has posted the response.

***

### port {#port}

> **port**: `MessagePort`

MessagePort through which the main thread returns the object buffer.

***

### options? {#options}

> `optional` **options?**: [`ISharedObjectBufferOptions`](ISharedObjectBufferOptions.md)

Options for creating or fetching the buffer.
