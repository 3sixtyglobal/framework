# Class: LfuCache\<T\>

A fixed-capacity LFU cache with time-to-idle eviction.

Entries are removed in two ways:
- Capacity eviction: when the cache is full the least-frequently-used entry is removed first.
Ties in frequency are broken by recency the least-recently-used entry among those with the
minimum frequency is evicted.
- TTI eviction: a background timer sweeps idle entries every ttiMs milliseconds.
The timer only runs while there are entries; it stops automatically when the cache empties.

`get` and `set` increment an entry's access frequency and reset its idle timer.
`set` and `getOrSet` accept an optional hard expiry timestamp; the entry is removed once that
time is reached however recently it was used, and the TTI still applies alongside it.
`has` and `keys` are pure peeks they evict idle entries but do not affect frequency or TTI.
Call `destroy` when the cache is no longer needed to stop the background timer.

## Type Parameters

### T

`T`

## Constructors

### Constructor

> **new LfuCache**\<`T`\>(`options?`): `LfuCache`\<`T`\>

Create a new instance of LfuCache.

#### Parameters

##### options?

The cache options.

###### capacity?

`number`

Maximum number of entries. Defaults to 1000. Must be a positive integer.

###### ttiMs?

`number`

Time-to-idle in milliseconds. Defaults to 10000. Must be a positive integer.

###### mutexTimeoutMs?

`number`

Maximum time in milliseconds to wait for getOrSet mutex acquisition.

#### Returns

`LfuCache`\<`T`\>

#### Throws

ValidationError if capacity or ttiMs is not a positive integer.

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

***

### DEFAULT\_CAPACITY {#default_capacity}

> `readonly` `static` **DEFAULT\_CAPACITY**: `1000` = `1000`

Default capacity.

***

### DEFAULT\_TTI\_MS {#default_tti_ms}

> `readonly` `static` **DEFAULT\_TTI\_MS**: `10000` = `10000`

Default time-to-idle in milliseconds.

## Methods

### count() {#count}

> **count**(): `number`

The number of entries currently held in the cache.

#### Returns

`number`

The number of entries in the cache.

***

### get() {#get}

> **get**(`key`): `T` \| `undefined`

Get a value from the cache.
Returns undefined if the key is absent or the entry has idled out.
A successful hit increments the entry's frequency and resets its idle timer.

#### Parameters

##### key

`string`

The key to retrieve.

#### Returns

`T` \| `undefined`

The cached value, or undefined on a miss or idle eviction.

***

### set() {#set}

> **set**(`key`, `value`, `expires?`): `void`

Store a value in the cache.
If the key already exists its value and frequency are updated.
When the cache is at capacity, idle entries are swept first; if it is still full the
least-frequently-used entry is evicted (LRU among ties).

#### Parameters

##### key

`string`

The key to store.

##### value

`T`

The value to cache.

##### expires?

`number`

Hard expiry timestamp in milliseconds since the epoch. The entry is removed
once this time is reached regardless of how recently it was used. Must be an integer.

#### Returns

`void`

***

### getOrSet() {#getorset}

> **getOrSet**(`key`, `valueFactory`, `expires?`): `Promise`\<`T`\>

Atomically get an existing value or create and store it once using an async factory.
Concurrent calls for the same key are serialized via a mutex.

#### Parameters

##### key

`string`

The key to get or create.

##### valueFactory

() => `Promise`\<`T`\>

Async callback used to build a value when the key is absent.

##### expires?

`number`

Hard expiry timestamp in milliseconds since the epoch, applied to the entry
when one is created. Must be an integer.

#### Returns

`Promise`\<`T`\>

The existing or newly created value.

***

### has() {#has}

> **has**(`key`): `boolean`

Check whether a key exists in the cache and has not idled out.
Idle entries are evicted on peek, but a live entry's frequency and TTI are not updated.

#### Parameters

##### key

`string`

The key to test.

#### Returns

`boolean`

True if the key is present and not idle.

***

### keys() {#keys}

> **keys**(): `string`[]

Return all keys for entries that have not idled out.
Idle entries encountered during iteration are evicted.
Keys are returned in ascending frequency order; within the same frequency, LRU first.

#### Returns

`string`[]

An array of live keys ordered from least-frequently-used to most-frequently-used.

***

### delete() {#delete}

> **delete**(`key`): `void`

Remove an entry from the cache.
Cancels the background timer if the cache becomes empty.

#### Parameters

##### key

`string`

The key to remove.

#### Returns

`void`

***

### clear() {#clear}

> **clear**(): `void`

Remove all entries from the cache and cancel the background timer.

#### Returns

`void`

***

### destroy() {#destroy}

> **destroy**(): `void`

Stop the background idle-sweep timer and release all entries.
The cache must not be used after this call.

#### Returns

`void`
