# Class: AsyncCache

Cache the results from asynchronous requests.

## Constructors

### Constructor

> **new AsyncCache**(): `AsyncCache`

#### Returns

`AsyncCache`

## Methods

### exec() {#exec}

> `static` **exec**\<`T`\>(`key`, `ttlMs`, `requestMethod`, `cacheFailures?`): `Promise`\<`T`\>

Execute an async request and cache the result.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### key

`string`

The key for the entry in the cache.

##### ttlMs

`number` \| `undefined`

The TTL of the entry in the cache.

##### requestMethod

() => `Promise`\<`T`\>

The method to call if not cached.

##### cacheFailures?

`boolean`

Cache failure results, defaults to false.

#### Returns

`Promise`\<`T`\>

The response.

***

### get() {#get}

> `static` **get**\<`T`\>(`key`): `Promise`\<`T` \| `undefined`\>

Get an entry from the cache.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### key

`string`

The key to get from the cache.

#### Returns

`Promise`\<`T` \| `undefined`\>

The item from the cache if it exists.

***

### set() {#set}

> `static` **set**\<`T`\>(`key`, `value`, `ttlMs?`): `Promise`\<`void`\>

Set an entry into the cache.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### key

`string`

The key to set in the cache.

##### value

`T`

The value to set in the cache.

##### ttlMs?

`number`

The TTL of the entry in the cache in ms, defaults to 1s.

#### Returns

`Promise`\<`void`\>

Nothing.

***

### remove() {#remove}

> `static` **remove**(`key`): `void`

Remove an entry from the cache.

#### Parameters

##### key

`string`

The key to remove from the cache.

#### Returns

`void`

***

### clearCache() {#clearcache}

> `static` **clearCache**(`prefix?`): `void`

Clear the cache.

#### Parameters

##### prefix?

`string`

Optional prefix to clear only entries with that prefix.

#### Returns

`void`

***

### cleanupExpired() {#cleanupexpired}

> `static` **cleanupExpired**(): `void`

Perform a cleanup of the expired entries in the cache.

#### Returns

`void`
