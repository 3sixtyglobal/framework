# Class: HmacSha256

Class to help with HmacSha256 scheme.

## Constructors

### Constructor

> **new HmacSha256**(`key`, `bits?`): `HmacSha256`

Create a new instance of HmacSha256.

#### Parameters

##### key

`Uint8Array`

The key for the hmac.

##### bits?

`number` = `HmacSha256.SIZE_256`

The number of bits.

#### Returns

`HmacSha256`

#### Throws

GeneralError If the bits are not a valid size.

## Properties

### SIZE\_256 {#size_256}

> `readonly` `static` **SIZE\_256**: `number` = `256`

Sha256 256.

***

### SIZE\_224 {#size_224}

> `readonly` `static` **SIZE\_224**: `number` = `224`

Sha256 224.

***

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### sum224() {#sum224}

> `static` **sum224**(`key`, `block`): `Uint8Array`

Perform Sum 224 on the block.

#### Parameters

##### key

`Uint8Array`

The key for the hmac.

##### block

`Uint8Array`

The block to operate on.

#### Returns

`Uint8Array`

The sum 224 of the block.

***

### sum256() {#sum256}

> `static` **sum256**(`key`, `block`): `Uint8Array`

Perform Sum 256 on the block.

#### Parameters

##### key

`Uint8Array`

The key for the hmac.

##### block

`Uint8Array`

The block to operate on.

#### Returns

`Uint8Array`

The sum 256 of the block.

***

### update() {#update}

> **update**(`block`): `HmacSha256`

Update the hash with the block.

#### Parameters

##### block

`Uint8Array`

The block to update the hash with.

#### Returns

`HmacSha256`

The instance for chaining.

***

### digest() {#digest}

> **digest**(): `Uint8Array`

Get the digest for the hash.

#### Returns

`Uint8Array`

The computed hash as bytes.
