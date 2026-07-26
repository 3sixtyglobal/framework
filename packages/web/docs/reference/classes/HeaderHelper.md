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

### extractAcceptLanguage() {#extractacceptlanguage}

> `static` **extractAcceptLanguage**(`headers?`): `object`[] \| `undefined`

Extract parsed language preferences from the Accept-Language header.

#### Parameters

##### headers?

[`IHttpHeaders`](../interfaces/IHttpHeaders.md)

The HTTP request headers.

#### Returns

`object`[] \| `undefined`

The parsed language preferences ordered by highest quality first, or undefined if missing or invalid.

***

### parseAcceptLanguage() {#parseacceptlanguage}

> `static` **parseAcceptLanguage**(`acceptLanguage`): `object`[] \| `undefined`

Parse one or more Accept-Language header values into language preferences.

#### Parameters

##### acceptLanguage

`string` \| `string`[] \| `undefined`

The Accept-Language header value or values.

#### Returns

`object`[] \| `undefined`

The parsed language preferences ordered by highest quality first, or undefined if missing or if any entry is invalid.

***

### extractAccept() {#extractaccept}

> `static` **extractAccept**(`headers?`): `object`[] \| `undefined`

Extract parsed media type preferences from the Accept header.

#### Parameters

##### headers?

[`IHttpHeaders`](../interfaces/IHttpHeaders.md)

The HTTP request headers.

#### Returns

`object`[] \| `undefined`

The parsed media type preferences ordered by highest quality first, or undefined if missing or invalid.

***

### parseAccept() {#parseaccept}

> `static` **parseAccept**(`accept`): `object`[] \| `undefined`

Parse one or more Accept header values into media type preferences.

#### Parameters

##### accept

`string` \| `string`[] \| `undefined`

The Accept header value or values.

#### Returns

`object`[] \| `undefined`

The parsed media type preferences ordered by highest quality first, or undefined if missing or if any entry is invalid.

#### See

https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept

***

### extractClientIps() {#extractclientips}

> `static` **extractClientIps**(`headers?`): `string`[]

Extract client IP addresses from HTTP request headers.
Checks all `X-Forwarded-For` and `X-Real-IP` header values for proxied requests.

#### Parameters

##### headers?

[`IHttpHeaders`](../interfaces/IHttpHeaders.md)

The HTTP request headers.

#### Returns

`string`[]

The extracted client IP addresses in header order.

***

### extractUserAgent() {#extractuseragent}

> `static` **extractUserAgent**(`headers?`, `maxLength?`): `string` \| `undefined`

Extract the User-Agent header from the HTTP request context.

#### Parameters

##### headers?

[`IHttpHeaders`](../interfaces/IHttpHeaders.md)

The HTTP request headers.

##### maxLength?

`number`

Optional maximum length for the User-Agent string to prevent excessively long values.

#### Returns

`string` \| `undefined`

The user agent string or undefined if not available.

***

### extractCorrelationId() {#extractcorrelationid}

> `static` **extractCorrelationId**(`headers?`, `maxLength?`): `string` \| `undefined`

Extract a correlation ID for request tracing from the X-Correlation-ID header.

#### Parameters

##### headers?

[`IHttpHeaders`](../interfaces/IHttpHeaders.md)

The HTTP request headers.

##### maxLength?

`number`

Optional maximum length for the extracted correlation ID.

#### Returns

`string` \| `undefined`

The correlation ID, or undefined if the header is missing or invalid.

***

### isIpAddress() {#isipaddress}

> `static` **isIpAddress**(`ip`): `boolean`

Validate if a string is a valid IP address (IPv4 or IPv6).

#### Parameters

##### ip

`string`

The IP address to validate.

#### Returns

`boolean`

True if valid, false otherwise.

***

### isIpAddressV4() {#isipaddressv4}

> `static` **isIpAddressV4**(`ip`): `boolean`

Validate if a string is a valid IP address IPv4.

#### Parameters

##### ip

`string`

The IP address to validate.

#### Returns

`boolean`

True if valid, false otherwise.

***

### isIpAddressV6() {#isipaddressv6}

> `static` **isIpAddressV6**(`ip`): `boolean`

Validate if a string is a valid IP address IPv6.

#### Parameters

##### ip

`string`

The IP address to validate.

#### Returns

`boolean`

True if valid, false otherwise.

***

### extractLinkHeaderRelation() {#extractlinkheaderrelation}

> `static` **extractLinkHeaderRelation**(`linkHeader`, `relation`): [`IHttpLinkHeader`](../interfaces/IHttpLinkHeader.md) \| `undefined`

Extract the first occurrence of properties from a Link header for a specific relation type.

#### Parameters

##### linkHeader

`string` \| `string`[] \| `undefined`

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

`string` \| `string`[] \| `undefined`

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

`string` \| `string`[] \| `undefined`

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

***

### parseWeightedHeader() {#parseweightedheader}

> `static` **parseWeightedHeader**(`header`, `valueValidator`): `object`[] \| `undefined`

Parse a quality-weighted comma-separated header into entries.

#### Parameters

##### header

`string` \| `string`[] \| `undefined`

The header value or values.

##### valueValidator

`RegExp`

Regex to validate the value portion of each entry.

#### Returns

`object`[] \| `undefined`

Entries ordered by quality descending, or undefined if any entry is invalid.
