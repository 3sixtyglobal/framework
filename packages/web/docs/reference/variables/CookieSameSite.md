# Variable: CookieSameSite

> `const` **CookieSameSite**: `object`

The values of the SameSite attribute of a cookie.

## Type Declaration

### Strict {#strict}

> `readonly` **Strict**: `"Strict"` = `"Strict"`

Only sent with requests from the site that set the cookie.

### Lax {#lax}

> `readonly` **Lax**: `"Lax"` = `"Lax"`

Also sent when navigating to the site from another site, but not with requests other sites make.

### None {#none}

> `readonly` **None**: `"None"` = `"None"`

Sent with every request, including those other sites make, the cookie must be Secure.

## See

https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#samesitesamesite-value
