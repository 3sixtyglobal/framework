# Interface: IFetchOptions

Options for call to the fetch helper.

## Properties

### headers? {#headers}

> `optional` **headers?**: [`IHttpHeaders`](IHttpHeaders.md)

#### Param

The headers for the request.

***

### timeoutMs? {#timeoutms}

> `optional` **timeoutMs?**: `number`

Timeout for requests in milliseconds.

***

### includeCredentials? {#includecredentials}

> `optional` **includeCredentials?**: `boolean`

Include credentials in the requests.

***

### retryCount? {#retrycount}

> `optional` **retryCount?**: `number`

The number of times to retry fetching defaults to no retries.

***

### retryDelayMs? {#retrydelayms}

> `optional` **retryDelayMs?**: `number`

The number of milliseconds we should delay before any retry.

***

### cacheTtlMs? {#cachettlms}

> `optional` **cacheTtlMs?**: `number`

The number of milliseconds to cache the response for, leave undefined for no cache, 0 means infinite.
