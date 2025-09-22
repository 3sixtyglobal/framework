# Class: HeaderHelper

Class to helper with header operations.

## Constructors

### Constructor

> **new HeaderHelper**(): `HeaderHelper`

#### Returns

`HeaderHelper`

## Methods

### createBearer()

> `static` **createBearer**(`token`): `undefined` \| `string`

Create a bearer token header.

#### Parameters

##### token

`string`

The token to create the header for.

#### Returns

`undefined` \| `string`

The bearer token header.

***

### extractBearerToken()

> `static` **extractBearerToken**(`header`): `undefined` \| `string`

Extract the bearer token from a header.

#### Parameters

##### header

`unknown`

The header value to extract the token from.

#### Returns

`undefined` \| `string`

The extracted token if it exists.
