# Class: CookieHelper

Class to help with cookie operations.

## Constructors

### Constructor

> **new CookieHelper**(): `CookieHelper`

#### Returns

`CookieHelper`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### createCookie() {#createcookie}

> `static` **createCookie**(`cookieName`, `cookieValue`, `options?`): `string`

Create a cookie string.

#### Parameters

##### cookieName

`string`

The name of the cookie.

##### cookieValue

`string`

The value of the cookie.

##### options?

Additional cookie options.

###### secure?

`boolean`

Should this be a secure cookie.

###### httpOnly?

`boolean`

Should this be an http only cookie.

###### sameSite?

`"Strict"` \| `"Lax"` \| `"None"`

The same site option for the cookie.

###### path?

`string`

The path for the cookie.

#### Returns

`string`

The created cookie string.

***

### deleteCookie() {#deletecookie}

> `static` **deleteCookie**(`cookieName`, `options?`): `string`

Create a cookie string which will delete a cookie.

#### Parameters

##### cookieName

`string`

The name of the cookie.

##### options?

Additional cookie options.

###### secure?

`boolean`

Should this be a secure cookie.

###### httpOnly?

`boolean`

Should this be an http only cookie.

###### sameSite?

`"Strict"` \| `"Lax"` \| `"None"`

The same site option for the cookie.

###### path?

`string`

The path for the cookie.

#### Returns

`string`

The created cookie string.

***

### getCookieFromHeaders() {#getcookiefromheaders}

> `static` **getCookieFromHeaders**(`headers`, `cookieName`): `string` \| `undefined`

Get cookies from headers.

#### Parameters

##### headers

The headers to get cookies from.

`string` | `string`[] | `undefined`

##### cookieName

`string`

The name of the cookie to get.

#### Returns

`string` \| `undefined`

The cookies found in the headers.
