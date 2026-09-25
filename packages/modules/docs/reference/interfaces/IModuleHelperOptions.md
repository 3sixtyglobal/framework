# Interface: IModuleHelperOptions

Options for module resolution.

## Properties

### executionDirectory {#executiondirectory}

> **executionDirectory**: `string`

The directory used to resolve local and package modules.

***

### maxSizeMb? {#maxsizemb}

> `optional` **maxSizeMb?**: `number`

The maximum size in MB for modules downloaded over https.

#### Default

```ts
10
```

***

### cacheDirectory? {#cachedirectory}

> `optional` **cacheDirectory?**: `string`

The cache directory for npm and https modules, relative to the execution directory.

#### Default

```ts
.tmp
```

***

### cacheTtlHours? {#cachettlhours}

> `optional` **cacheTtlHours?**: `number`

The time to live in hours for cached https modules.

#### Default

```ts
24
```

***

### forceRefresh? {#forcerefresh}

> `optional` **forceRefresh?**: `boolean`

Force https modules to be downloaded again even if they are cached.

#### Default

```ts
false
```

***

### onMessage? {#onmessage}

> `optional` **onMessage?**: (`level`, `key`, `properties?`) => `void`

Callback for progress and warning messages, the callback is responsible for formatting.

#### Parameters

##### level

`"info"` \| `"warning"`

The level of the message.

##### key

`string`

The locale key of the message.

##### properties?

The properties to format the message with.

#### Returns

`void`
