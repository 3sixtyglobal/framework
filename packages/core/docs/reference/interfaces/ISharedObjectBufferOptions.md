# Interface: ISharedObjectBufferOptions

Options for configuring buffer capacity when creating a shared object buffer.

## Properties

### initialCapacityBytes? {#initialcapacitybytes}

> `optional` **initialCapacityBytes?**: `number`

Initial payload capacity hint in bytes.
Only honoured when the buffer does not yet exist; ignored on subsequent writes.

#### Default

```ts
1 MiB.
```

***

### maxCapacityBytes? {#maxcapacitybytes}

> `optional` **maxCapacityBytes?**: `number`

Maximum allowed payload capacity in bytes. The buffer will never grow beyond this limit.
Only honoured when the buffer does not yet exist; ignored on subsequent writes.

#### Default

```ts
256 MiB.
```
