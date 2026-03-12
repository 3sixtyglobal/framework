# Interface: IError

Model to describe serialized error.

## Properties

### name {#name}

> **name**: `string`

The name for the error.

***

### message {#message}

> **message**: `string`

The message for the error.

***

### source? {#source}

> `optional` **source**: `string`

The source of the error.

***

### properties? {#properties}

> `optional` **properties**: `object`

Any additional information for the error.

#### Index Signature

\[`id`: `string`\]: `unknown`

***

### stack? {#stack}

> `optional` **stack**: `string`

The stack trace for the error.

***

### cause? {#cause}

> `optional` **cause**: `IError`

The cause of the error if there was one.
