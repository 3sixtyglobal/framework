# Class: ErrorHelper

Error helper functions.

## Constructors

### Constructor

> **new ErrorHelper**(): `ErrorHelper`

#### Returns

`ErrorHelper`

## Methods

### formatErrors() {#formaterrors}

> `static` **formatErrors**(`error`, `options?`): `string`[]

Format Errors and returns just their messages.

#### Parameters

##### error

`unknown`

The error to format.

##### options?

Options for formatting the error.

###### includeStack?

`boolean`

Whether to include the stack trace in the output, defaults to false.

###### includeAdditional?

`boolean`

Whether to include additional error information in the output, defaults to false.

#### Returns

`string`[]

The error formatted including any causes errors.

***

### localizeErrors() {#localizeerrors}

> `static` **localizeErrors**(`error`): [`IError`](../interfaces/IError.md) & `object`[]

Localize the content of an error and any causes.

#### Parameters

##### error

`unknown`

The error to format.

#### Returns

[`IError`](../interfaces/IError.md) & `object`[]

The localized version of the errors flattened.

***

### formatValidationErrors() {#formatvalidationerrors}

> `static` **formatValidationErrors**(`error`): `string`[] \| `undefined`

Localize the content of an error and any causes.

#### Parameters

##### error

[`IError`](../interfaces/IError.md)

The error to format.

#### Returns

`string`[] \| `undefined`

The localized version of the errors flattened.
