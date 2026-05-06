# Interface: IHealth

Provides health information for a component.

## Properties

### name {#name}

> **name**: `string`

The name of the component.

***

### description? {#description}

> `optional` **description?**: `string`

The description of the component as an i18n key.

***

### status {#status}

> **status**: [`HealthStatus`](../type-aliases/HealthStatus.md)

The overall status of the component, the entries can also report their own health.

***

### details? {#details}

> `optional` **details?**: `string`

The details for the status if there are further details to provide as an i18n key.

***

### properties? {#properties}

> `optional` **properties?**: `object`

Properties to substitute in the i18n key for the details.

#### Index Signature

\[`id`: `string`\]: `unknown`

***

### grouped? {#grouped}

> `optional` **grouped?**: `IHealth`[]

The grouped child components, if any.
