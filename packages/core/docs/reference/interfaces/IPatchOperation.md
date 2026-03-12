# Interface: IPatchOperation

Interface describing a patch operation to add a property.

## Properties

### op {#op}

> **op**: `"add"` \| `"remove"` \| `"replace"` \| `"move"` \| `"copy"` \| `"test"`

The operation that was performed on the item.

***

### path {#path}

> **path**: `string`

The path to the object that was changed.

***

### from? {#from}

> `optional` **from**: `string`

The path the value was copied or moved from.

***

### value? {#value}

> `optional` **value**: `unknown`

The value to add.
