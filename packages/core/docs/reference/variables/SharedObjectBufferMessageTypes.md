# Variable: SharedObjectBufferMessageTypes

> `const` **SharedObjectBufferMessageTypes**: `object`

Message type constants for the SharedObjectBuffer worker-to-main-thread protocol.

## Type Declaration

### GetBuffer {#getbuffer}

> `readonly` **GetBuffer**: `"twin:sharedObjectBuffer:getBuffer"` = `"twin:sharedObjectBuffer:getBuffer"`

Worker requests the SharedArrayBuffer for a named object from the main thread.
