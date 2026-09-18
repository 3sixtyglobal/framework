# Class: NativeModules

Helper for detecting and resolving native platform modules (Node builtins and globals)
so a class can prefer a faster native implementation while keeping a pure JavaScript
fallback where the native form does not exist (e.g. a browser). See getModule() and
init() below for how a builtin is opted into, and typeExists() for a global.

## Constructors

### Constructor

> **new NativeModules**(): `NativeModules`

#### Returns

`NativeModules`

## Methods

### typeExists() {#typeexists}

> `static` **typeExists**(`name`): `boolean`

Check whether a global of the given name exists in the current environment.

#### Parameters

##### name

`string`

The name of the global to check for, e.g. "Buffer".

#### Returns

`boolean`

True if the global exists, false otherwise (e.g. in a browser).

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
