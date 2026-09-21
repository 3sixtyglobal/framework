# Class: NativeModulesCrypto

Resolve node:crypto for callers which can only use it when the platform also
supports the specific algorithm being asked for.

## Constructors

### Constructor

> **new NativeModulesCrypto**(): `NativeModulesCrypto`

#### Returns

`NativeModulesCrypto`

## Methods

### getNodeCryptoCipher() {#getnodecryptocipher}

> `static` **getNodeCryptoCipher**(`cipher`): `__module` \| `undefined`

Get node:crypto, but only when this build's OpenSSL actually lists the cipher
as supported, so a restricted build falls back rather than failing at call time.

#### Parameters

##### cipher

`string`

The cipher to check for, e.g. "chacha20-poly1305".

#### Returns

`__module` \| `undefined`

The module to use natively, or undefined to use a pure JavaScript fallback.

***

### getNodeCryptoHash() {#getnodecryptohash}

> `static` **getNodeCryptoHash**(`hash`): `__module` \| `undefined`

Get node:crypto, but only when this build's OpenSSL actually lists the hash
as supported, so a restricted build falls back rather than failing at call time.

#### Parameters

##### hash

`string`

The hash to check for, e.g. "sha3-256".

#### Returns

`__module` \| `undefined`

The module to use natively, or undefined to use a pure JavaScript fallback.

***

### getNodeCryptoCurve() {#getnodecryptocurve}

> `static` **getNodeCryptoCurve**(`curve`): `__module` \| `undefined`

Get node:crypto, but only when this build's OpenSSL actually lists the elliptic
curve as supported, so a restricted build falls back rather than failing at call time.

#### Parameters

##### curve

`string`

The curve to check for, e.g. "secp256k1".

#### Returns

`__module` \| `undefined`

The module to use natively, or undefined to use a pure JavaScript fallback.

***

### getNodeCryptoArgon2() {#getnodecryptoargon2}

> `static` **getNodeCryptoArgon2**(): `__module` \| `undefined`

Get node:crypto, but only when it exposes Argon2, which was added in Node 24.

#### Returns

`__module` \| `undefined`

The module to use natively, or undefined to use a pure JavaScript fallback.

***

### getNodeCryptoEd25519() {#getnodecryptoed25519}

> `static` **getNodeCryptoEd25519**(): `__module` \| `undefined`

Get node:crypto, but only when it can work with Ed25519 keys. Ed25519 is absent from
getCurves(), so the only reliable check is to build a key and see whether it throws.

#### Returns

`__module` \| `undefined`

The module to use natively, or undefined to use a pure JavaScript fallback.

***

### reset() {#reset}

> `static` **reset**(): `void`

Clear the cached Ed25519 capability, so the next call probes again.
Intended for tests which swap the registered node:crypto.

#### Returns

`void`
