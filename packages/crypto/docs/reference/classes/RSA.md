# Class: RSA

Implementation of the RSA cipher.

## Constructors

### Constructor

> **new RSA**(`publicKey`, `privateKey?`): `RSA`

Create a new instance of RSA.

#### Parameters

##### publicKey

`Uint8Array`

The public key for encryption (DER format as Uint8Array).

##### privateKey?

`Uint8Array`\<`ArrayBufferLike`\>

The private key for decryption (DER format as Uint8Array).

#### Returns

`RSA`

## Methods

### generateKeyPair()

> `static` **generateKeyPair**(`modulusLength`): `object`

Generate a new RSA key pair in PKCS8 format.

#### Parameters

##### modulusLength

`number` = `2048`

The key size in bits (default: 2048).

#### Returns

`object`

The public and private keys as Uint8Array.

##### publicKey

> **publicKey**: `Uint8Array`

##### privateKey

> **privateKey**: `Uint8Array`

***

### convertPkcs1ToPkcs8()

> `static` **convertPkcs1ToPkcs8**(`pkcs1Key`): `Uint8Array`

Convert a PKCS1 key to a PKCS8 key.

#### Parameters

##### pkcs1Key

`Uint8Array`

The PKCS1 key as Uint8Array.

#### Returns

`Uint8Array`

The PKCS8 key as Uint8Array.

***

### getPrivateKeyComponents()

> `static` **getPrivateKeyComponents**(`pkcs8Key`): `object`

Break the private key down in to its components.

#### Parameters

##### pkcs8Key

`Uint8Array`

The PKCS8 key as Uint8Array.

#### Returns

`object`

The key components.

##### n

> **n**: `bigint`

##### e

> **e**: `bigint`

##### d

> **d**: `bigint`

##### p

> **p**: `bigint`

##### q

> **q**: `bigint`

##### dp

> **dp**: `bigint`

##### dq

> **dq**: `bigint`

##### qi

> **qi**: `bigint`

***

### getPublicKeyComponents()

> `static` **getPublicKeyComponents**(`spkiKey`): `object`

Break the public key down in to its components.

#### Parameters

##### spkiKey

`Uint8Array`

The SPKI key as Uint8Array.

#### Returns

`object`

The key components.

##### n

> **n**: `bigint`

##### e

> **e**: `bigint`

***

### encrypt()

> **encrypt**(`data`): `Uint8Array`

Encrypt the data.

#### Parameters

##### data

`Uint8Array`

The data to encrypt.

#### Returns

`Uint8Array`

The data encrypted.

***

### decrypt()

> **decrypt**(`data`): `Uint8Array`

Decrypt the data.

#### Parameters

##### data

`Uint8Array`

The data to decrypt.

#### Returns

`Uint8Array`

The data decrypted.

#### Throws

GeneralError If no private key is provided.
