# Class: HeaderHelper

Class to helper with header operations.

## Constructors

### Constructor

> **new HeaderHelper**(): `HeaderHelper`

#### Returns

`HeaderHelper`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### createBearer() {#createbearer}

> `static` **createBearer**(`token`): `string`

Create a bearer token header.

#### Parameters

##### token

`unknown`

The token to create the header for.

#### Returns

`string`

The bearer token header.

***

### extractBearer() {#extractbearer}

> `static` **extractBearer**(`header`): `string`

Extract the bearer token from a header.

#### Parameters

##### header

`unknown`

The header value to extract the token from.

#### Returns

`string`

The extracted token if it exists.

***

### extractLinkHeaderRelation() {#extractlinkheaderrelation}

> `static` **extractLinkHeaderRelation**(`linkHeader`, `relation`): [`IHttpLinkHeader`](../interfaces/IHttpLinkHeader.md) \| `undefined`

Extract the first occurrence of properties from a Link header for a specific relation type.

#### Parameters

##### linkHeader

`unknown`

The Link header value in format `<url>; rel="..."; param1=""; param2=""`.

##### relation

`string` \| `RegExp`

The relation type to extract.

#### Returns

[`IHttpLinkHeader`](../interfaces/IHttpLinkHeader.md) \| `undefined`

The extracted URL, rel and optional params or undefined if invalid/missing.

#### See

https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link

***

### extractLinkHeaderRelations() {#extractlinkheaderrelations}

> `static` **extractLinkHeaderRelations**(`linkHeader`, `relation`): [`IHttpLinkHeader`](../interfaces/IHttpLinkHeader.md)[] \| `undefined`

Extract multiple properties from a Link header for a specific relation type.

#### Parameters

##### linkHeader

`unknown`

The Link header value in format `<url>; rel="..."; param1=""; param2=""`.

##### relation

`string` \| `RegExp`

The relation type to extract.

#### Returns

[`IHttpLinkHeader`](../interfaces/IHttpLinkHeader.md)[] \| `undefined`

The extracted URL, rel and optional params or undefined if invalid/missing.

#### See

https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link

***

### extractLinkHeaders() {#extractlinkheaders}

> `static` **extractLinkHeaders**(`linkHeader`): [`IHttpLinkHeader`](../interfaces/IHttpLinkHeader.md)[] \| `undefined`

Extract the link headers.

#### Parameters

##### linkHeader

`unknown`

The Link header value in format `<url>; rel="..."; param1=""; param2=""`.

#### Returns

[`IHttpLinkHeader`](../interfaces/IHttpLinkHeader.md)[] \| `undefined`

The extracted possible array of URL, rel and optional params or undefined if invalid/missing.

#### See

https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link

***

### extractLinkHeaderSegments() {#extractlinkheadersegments}

> `static` **extractLinkHeaderSegments**(`linkHeader`): `string`[]

Split a combined Link header value into individual link-value segments, comma separated.

#### Parameters

##### linkHeader

`string`

Raw Link header string.

#### Returns

`string`[]

Array of individual link-value segments.

#### See

https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link

***

### extractLinkHeader() {#extractlinkheader}

> `static` **extractLinkHeader**(`linkHeader`): [`IHttpLinkHeader`](../interfaces/IHttpLinkHeader.md) \| `undefined`

Extract the properties from a Link header.

#### Parameters

##### linkHeader

`string`

The Link header value in format `<url>; rel="..."; param1=""; param2=""`.

#### Returns

[`IHttpLinkHeader`](../interfaces/IHttpLinkHeader.md) \| `undefined`

The extracted URL, rel and optional params or undefined if invalid/missing.

#### See

https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link

***

### createLinkHeader() {#createlinkheader}

> `static` **createLinkHeader**(`url`, `urlQueryParams`, `rel`, `params?`): `string`

Create a compliant Link header.

#### Parameters

##### url

`string`

The URL to include in the Link header.

##### urlQueryParams

\{\[`id`: `string`\]: `string`; \} \| `undefined`

Optional query parameters to include in the URL.

##### rel

`string` \| `string`[] \| [`HttpLinkRelType`](../type-aliases/HttpLinkRelType.md)[]

The relation type (e.g., "next", "prev", "self").

##### params?

#### Returns

`string`

The formatted Link header string.

#### Throws

GeneralError if the URL or rel are invalid.

#### See

https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link
