# Class: PemHelper

Helper class for working with PEM (Privacy-Enhanced Mail) formatted data.

## Constructors

### Constructor

> **new PemHelper**(): `PemHelper`

#### Returns

`PemHelper`

## Methods

### formatPem()

> `static` **formatPem**(`marker`, `base64Content`, `lineLength`): `string`

Format the PEM content to have a specific line length.

#### Parameters

##### marker

`string`

The marker for the PEM content, e.g. RSA PRIVATE KEY

##### base64Content

`string`

The base64 content to format.

##### lineLength

`number` = `64`

The length of each line in the PEM content, default is 64 characters.

#### Returns

`string`

The formatted PEM content.
