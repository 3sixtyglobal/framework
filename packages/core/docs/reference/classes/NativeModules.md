# Class: NativeModules

Helper for detecting and resolving native platform modules (Node builtins and globals)
so a class can prefer a faster native implementation while keeping a pure JavaScript
fallback where the native form does not exist (e.g. a browser). See getModule() and
init() below for how a builtin is opted into, and getType() for a global.

## Constructors

### Constructor

> **new NativeModules**(): `NativeModules`

#### Returns

`NativeModules`

## Methods

### getRegistry() {#getregistry}

> `static` **getRegistry**(): `object`

Get the registry of modules resolved via init(), creating it if it does not yet exist.
The registry is live, so mutating it changes what getModule() and names() return.

#### Returns

`object`

The registry, keyed by module specifier.

***

### getType() {#gettype}

> `static` **getType**\<`T`\>(`name`): `T` \| `undefined`

Get a global of the given name from the current environment, typed as the caller requires.
Pass the constructor type, not the instance type, to reach statics e.g.
getType&lt;BufferConstructor&gt;("Buffer").

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### name

`string`

The name of the global to get, e.g. "Buffer".

#### Returns

`T` \| `undefined`

The global, or undefined if it does not exist (e.g. in a browser).

***

### getModule() {#getmodule}

> `static` **getModule**\<`T`\>(`name`): `T` \| `undefined`

Get a module previously registered by init(). Never resolves anything itself, even
a Node builtin - a specifier init() was never called for returns undefined here.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### name

`string`

The module specifier, e.g. "node:crypto".

#### Returns

`T` \| `undefined`

The module, or undefined if it was never registered via init().

***

### names() {#names}

> `static` **names**(): `string`[]

Get the specifiers of the modules registered via init().

#### Returns

`string`[]

The registered specifiers.

***

### init() {#init}

> `static` **init**(`modules`): `Promise`\<\{\[`specifier`: `string`\]: [`IError`](../interfaces/IError.md); \}\>

Resolve and register modules for getModule() to return, including Node builtins.

#### Parameters

##### modules

`string`[]

The module specifiers to import and register.

#### Returns

`Promise`\<\{\[`specifier`: `string`\]: [`IError`](../interfaces/IError.md); \}\>

The specifiers that failed, keyed by specifier, with the error raised.
