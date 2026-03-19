# Class: FetchHelper

Class to helper with fetch operations.

## Constructors

### Constructor

> **new FetchHelper**(): `FetchHelper`

#### Returns

`FetchHelper`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### fetch() {#fetch}

> `static` **fetch**(`source`, `url`, `method`, `body?`, `options?`): `Promise`\<`Response`\>

Perform a fetch request.

#### Parameters

##### source

`string`

The source for the request.

##### url

`string`

The url for the request.

##### method

[`HttpMethod`](../type-aliases/HttpMethod.md)

The http method.

##### body?

`string` \| `Uint8Array`\<`ArrayBufferLike`\>

Request to send to the endpoint.

##### options?

`Omit`\<[`IFetchOptions`](../interfaces/IFetchOptions.md), `"cacheTtlSeconds"`\>

Options for sending the requests.

#### Returns

`Promise`\<`Response`\>

The response.

***

### fetchJson() {#fetchjson}

> `static` **fetchJson**\<`T`, `U`\>(`source`, `url`, `method`, `requestData?`, `options?`): `Promise`\<`U`\>

Perform a request in json format.

#### Type Parameters

##### T

`T`

##### U

`U`

#### Parameters

##### source

`string`

The source for the request.

##### url

`string`

The url for the request.

##### method

[`HttpMethod`](../type-aliases/HttpMethod.md)

The http method.

##### requestData?

`T`

Request to send to the endpoint.

##### options?

[`IFetchOptions`](../interfaces/IFetchOptions.md)

Options for sending the requests.

#### Returns

`Promise`\<`U`\>

The response.

***

### fetchBinary() {#fetchbinary}

> `static` **fetchBinary**\<`T`\>(`source`, `url`, `method`, `requestData?`, `options?`): `Promise`\<`Uint8Array`\<`ArrayBufferLike`\> \| `T`\>

Perform a request for binary data.

#### Type Parameters

##### T

`T`

#### Parameters

##### source

`string`

The source for the request.

##### url

`string`

The url for the request.

##### method

`"GET"` \| `"POST"`

The http method.

##### requestData?

`Uint8Array`\<`ArrayBufferLike`\>

Request to send to the endpoint.

##### options?

[`IFetchOptions`](../interfaces/IFetchOptions.md)

Options for sending the requests.

#### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\> \| `T`\>

The response.

***

### clearCache() {#clearcache}

> `static` **clearCache**(): `void`

Clears the cache.

#### Returns

`void`

***

### getCacheEntry() {#getcacheentry}

> `static` **getCacheEntry**\<`T`\>(`url`): `Promise`\<`T` \| `undefined`\>

Get a cache entry.

#### Type Parameters

##### T

`T`

#### Parameters

##### url

`string`

The url for the request.

#### Returns

`Promise`\<`T` \| `undefined`\>

The cache entry if it exists.

***

### setCacheEntry() {#setcacheentry}

> `static` **setCacheEntry**\<`T`\>(`url`, `value`): `Promise`\<`void`\>

Set a cache entry.

#### Type Parameters

##### T

`T`

#### Parameters

##### url

`string`

The url for the request.

##### value

`T`

The value to cache.

#### Returns

`Promise`\<`void`\>

The cache entry if it exists.

***

### removeCacheEntry() {#removecacheentry}

> `static` **removeCacheEntry**(`url`): `void`

Remove a cache entry.

#### Parameters

##### url

`string`

The url for the request.

#### Returns

`void`
