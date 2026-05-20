# Class: IntegrityHelper

Helper class for creating integrity signatures.

## See

https://www.w3.org/TR/SRI/

## Constructors

### Constructor

> **new IntegrityHelper**(): `IntegrityHelper`

#### Returns

`IntegrityHelper`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### generate() {#generate}

> `static` **generate**(`type`, `content`): `string`

Generate an integrity signature for the given content using the specified hash algorithm.

#### Parameters

##### type

[`IntegrityAlgorithm`](../type-aliases/IntegrityAlgorithm.md)

The hash algorithm to use, either "sha256", "sha384" or "sha512".

##### content

`Uint8Array`

The content to hash as a Uint8Array.

#### Returns

`string`

The integrity signature in the format "type-base64hash".

***

### verify() {#verify}

> `static` **verify**(`integrity`, `content`): `boolean`

Verify an integrity signature for the given content.

#### Parameters

##### integrity

`string`

The integrity signature in the format "type-base64hash".

##### content

`Uint8Array`

The content to hash as a Uint8Array.

#### Returns

`boolean`

True if the integrity signature matches the content.

#### Throws

If the integrity signature is invalid.
