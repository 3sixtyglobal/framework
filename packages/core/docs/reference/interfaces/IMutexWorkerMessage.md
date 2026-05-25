# Interface: IMutexWorkerMessage

Message sent from a worker thread to the main thread to request a SharedArrayBuffer for a given mutex key.

## Properties

### type {#type}

> **type**: `"twin:mutex:getBuffer"`

The message type.

***

### key {#key}

> **key**: `string`

The mutex key for which the buffer is requested.

***

### signal {#signal}

> **signal**: `SharedArrayBuffer`

The SharedArrayBuffer for the mutex, sent from the worker to the main thread.

***

### port {#port}

> **port**: `MessagePort`

The MessagePort for the main thread to respond with the buffer, sent from the worker to the main thread.
