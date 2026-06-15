# Class: Argon2id

Implementation of the Argon2id password based key derivation function.

## Constructors

### Constructor

> **new Argon2id**(): `Argon2id`

#### Returns

`Argon2id`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### hash() {#hash}

> `static` **hash**(`password`, `salt`, `options?`): `Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

Derive a key from the parameters using Argon2id.

#### Parameters

##### password

`Uint8Array`

The password to derive the key from.

##### salt

`Uint8Array`

The salt for the derivation.

##### options?

The options for the derivation.

###### t?

`number`

Number of iterations to perform, default 1.

###### m?

`number`

Amount of memory to use in kibibytes, default 8.

###### p?

`number`

Number of parallel threads to use, default 1.

###### dkLen?

`number`

The length of the derived key in bytes, default 32.

###### maxmem?

`number`

The maximum amount of memory to use in bytes, default 2^30.

#### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

A promise that resolves with the derived key bytes.
