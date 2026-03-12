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

> `static` **extractLinkHeaderRelation**(`linkHeader`, `relation`): \{ `url`: `string`; `urlQueryParams?`: \{\[`id`: `string`\]: `string`; \}; `rel`: `string`; `params?`: \{\[`id`: `string`\]: `string`; \}; \} \| `undefined`

Extract the properties from a Link header for a specific relation type.

#### Parameters

##### linkHeader

`unknown`

The Link header value in format `<url>; rel="..."; param1=""; param2=""`.

##### relation

`string`

The relation type to extract.

#### Returns

\{ `url`: `string`; `urlQueryParams?`: \{\[`id`: `string`\]: `string`; \}; `rel`: `string`; `params?`: \{\[`id`: `string`\]: `string`; \}; \} \| `undefined`

The extracted URL, rel and optional params or undefined if invalid/missing.

#### See

https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link

***

### extractLinkHeaders() {#extractlinkheaders}

> `static` **extractLinkHeaders**(`linkHeader`): `object`[] \| `undefined`

Extract the link headers.

#### Parameters

##### linkHeader

`unknown`

The Link header value in format `<url>; rel="..."; param1=""; param2=""`.

#### Returns

`object`[] \| `undefined`

The extracted possible array of URL, rel and optional params or undefined if invalid/missing.

#### See

https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link

***

### extractLinkHeader() {#extractlinkheader}

> `static` **extractLinkHeader**(`linkHeader`): \{ `url`: `string`; `urlQueryParams?`: \{\[`id`: `string`\]: `string`; \}; `rel`: `string`; `params?`: \{\[`id`: `string`\]: `string`; \}; \} \| `undefined`

Extract the properties from a Link header.

#### Parameters

##### linkHeader

`string`

The Link header value in format `<url>; rel="..."; param1=""; param2=""`.

#### Returns

\{ `url`: `string`; `urlQueryParams?`: \{\[`id`: `string`\]: `string`; \}; `rel`: `string`; `params?`: \{\[`id`: `string`\]: `string`; \}; \} \| `undefined`

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

Optional query parameters to include in the URL.

\{\[`id`: `string`\]: `string`; \} | `undefined`

##### rel

`string`

The relation type (e.g., "next", "prev", "self").

##### params?

#### Returns

`string`

The formatted Link header string.

#### Throws

GeneralError if the URL or rel are invalid.

#### See

https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link
