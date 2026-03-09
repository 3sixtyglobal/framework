# Web Examples

Use these snippets for token handling, fetch utilities and HTTP header helpers in browser and server runtimes.

## Jwt

```typescript
import { Jwt } from '@twin.org/web';

const payload = {
  sub: 'user-01',
  role: 'editor'
};

const token = Jwt.encode(payload, {
  alg: 'HS256'
});

Jwt.decode(token).sub; // 'user-01'
```

```typescript
import { Jwt } from '@twin.org/web';

const token = Jwt.encode({ sub: 'u-2' }, { alg: 'HS256' });
Jwt.verify(token, {
  key: 'local-signing-key'
}); // true
```

## FetchHelper

```typescript
import { FetchHelper } from '@twin.org/web';

const response = await FetchHelper.fetchJson<{ status: string }>('https://api.example.org/status', {
  method: 'GET',
  cacheSeconds: 30
});

response.status; // 'ok'
```

## HeaderHelper

```typescript
import { HeaderHelper } from '@twin.org/web';

const header = HeaderHelper.createBearer('token-123');

HeaderHelper.extractBearer(header); // 'token-123'
```

## Jwk and Jws

```typescript
import { Jwk, Jws } from '@twin.org/web';

const jwk = Jwk.fromEd25519Public(new Uint8Array(32));
const compact = Jws.create(
  {
    typ: 'JWT',
    alg: 'EdDSA'
  },
  {
    iss: 'issuer-1'
  },
  async signingBytes => signingBytes
);

Jws.verify(compact, async () => true); // true
jwk.kty; // 'OKP'
```

## CookieHelper

```typescript
import { CookieHelper } from '@twin.org/web';

CookieHelper.createCookie('sessionId', 'abc123', {
  path: '/',
  maxAge: 1800,
  secure: true,
  httpOnly: true
}); // 'sessionId=abc123; Max-Age=1800; Path=/; Secure; HttpOnly'
```

## MimeTypeHelper

```typescript
import { MimeTypeHelper } from '@twin.org/web';

MimeTypeHelper.detect('avatar.png'); // 'image/png'
MimeTypeHelper.defaultExtension('application/json'); // 'json'
```

## FetchError

```typescript
import { FetchError } from '@twin.org/web';

const error = new FetchError(this.CLASS_NAME, 'fetchFailed', {
  statusCode: 503,
  retryable: true
});

error.toJsonObject().statusCode; // 503
```
