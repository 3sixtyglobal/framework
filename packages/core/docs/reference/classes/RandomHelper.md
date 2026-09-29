# Class: RandomHelper

Class to help with random generation.

## Constructors

### Constructor

> **new RandomHelper**(): `RandomHelper`

#### Returns

`RandomHelper`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### generate() {#generate}

> `static` **generate**(`length`): `Uint8Array`

Generate a new random array.

#### Parameters

##### length

`number`

The length of buffer to create.

#### Returns

`Uint8Array`

The random array.

#### Throws

GeneralError if the length is above the maximum getRandomValues accepts.

***

### generateUuidV7() {#generateuuidv7}

> `static` **generateUuidV7**(`format?`): `string`

Generate a new UUIDv7.

#### Parameters

##### format?

`"standard"` \| `"compact"`

The format of the UUIDv7 string.

#### Returns

`string`

The UUIDv7 string.

***

### uuidV7ExtractTimestamp() {#uuidv7extracttimestamp}

> `static` **uuidV7ExtractTimestamp**(`uuid`): `number`

Extract the unix timestamp (ms) from a UUIDv7.

#### Parameters

##### uuid

`string`

The UUIDv7 string.

#### Returns

`number`

The unix timestamp in milliseconds.
