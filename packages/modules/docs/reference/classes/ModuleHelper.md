# Class: ModuleHelper

Helper functions for modules.

## Constructors

### Constructor

> **new ModuleHelper**(): `ModuleHelper`

#### Returns

`ModuleHelper`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### setOptions() {#setoptions}

> `static` **setOptions**(`options`): `void`

Set the options for module resolution, this enables resolving local, package, npm: and https:
modules from the execution directory for both main thread and worker thread imports.
Setting the options clears the resolution caches.

#### Parameters

##### options

[`IModuleHelperOptions`](../interfaces/IModuleHelperOptions.md)

The options for module resolution.

#### Returns

`void`

***

### getOptions() {#getoptions}

> `static` **getOptions**(): [`IModuleHelperOptions`](../interfaces/IModuleHelperOptions.md) \| `undefined`

Get the options for module resolution, worker threads are started with these options.

#### Returns

[`IModuleHelperOptions`](../interfaces/IModuleHelperOptions.md) \| `undefined`

The options, or undefined if they have not been set.

***

### importModule() {#importmodule}

> `static` **importModule**\<`T`\>(`module`): `Promise`\<`T`\>

Import a module on the main thread, resolving and caching it.

#### Type Parameters

##### T

`T` = \{\[`key`: `string`\]: `unknown`; \}

#### Parameters

##### module

`string`

The module.

#### Returns

`Promise`\<`T`\>

The imported module.

***

### getModuleEntry() {#getmoduleentry}

> `static` **getModuleEntry**\<`T`\>(`module`, `entry`): `Promise`\<`T`\>

Get the module entry.

#### Type Parameters

##### T

`T`

#### Parameters

##### module

`string`

The module.

##### entry

`string`

The entry to get from the module.

#### Returns

`Promise`\<`T`\>

The entry from the module.

#### Throws

GeneralError if getting the module entry failed.

***

### getModuleMethod() {#getmodulemethod}

> `static` **getModuleMethod**\<`T`\>(`module`, `method`): `Promise`\<`T`\>

Get the method from a module.

#### Type Parameters

##### T

`T` *extends* (...`args`) => `any` = (...`args`) => `any`

#### Parameters

##### module

`string`

The module.

##### method

`string`

The method to execute from the module, use dot notation to get a static class method.

#### Returns

`Promise`\<`T`\>

The result of the method execution.

#### Throws

GeneralError if executing the module entry failed.

***

### execModuleMethod() {#execmodulemethod}

> `static` **execModuleMethod**\<`T`\>(`module`, `method`, `args?`): `Promise`\<`T`\>

Execute the method in the module.

#### Type Parameters

##### T

`T`

#### Parameters

##### module

`string`

The module.

##### method

`string`

The method to execute from the module.

##### args?

`unknown`[]

The arguments to pass to the method.

#### Returns

`Promise`\<`T`\>

The result of the method execution.

#### Throws

GeneralError if executing the module entry failed.

***

### execModuleMethodThread() {#execmodulemethodthread}

> `static` **execModuleMethodThread**\<`T`\>(`module`, `method`, `args?`, `contextIds?`): `Promise`\<`T`\>

Execute the method in the module in a thread.

#### Type Parameters

##### T

`T`

#### Parameters

##### module

`string`

The module.

##### method

`string`

The method to execute from the module.

##### args?

`unknown`[]

The arguments to pass to the method.

##### contextIds?

`IContextIds`

The context IDs.

#### Returns

`Promise`\<`T`\>

The result of the method execution.

#### Throws

GeneralError if executing the module entry failed.

***

### execModuleMethodThreadMessage() {#execmodulemethodthreadmessage}

> `static` **execModuleMethodThreadMessage**(`module`, `completed`, `options?`): [`IModuleWorker`](../interfaces/IModuleWorker.md)

Load the module and provide a messaging interface. The worker starts with the native
modules already registered on this thread via NativeModules.init() and the options from
setOptions, messages from the worker's onMessage option are forwarded to this thread.

#### Parameters

##### module

`string`

The module.

##### completed

(`operation`, `result?`, `err?`) => `void`

Callback called when the worker thread processes a completion.

##### options?

Optional settings.

###### threadName?

`string`

The name of the thread.

#### Returns

[`IModuleWorker`](../interfaces/IModuleWorker.md)

The messaging interface.

#### Throws

GeneralError if executing the module entry failed.

***

### resolveModule() {#resolvemodule}

> `static` **resolveModule**(`module`): `Promise`\<`string`\>

Resolve a module name to the specifier to import, using the options from setOptions. Without
options, local and package modules are resolved from the working directory, npm: and https:
modules are only resolved once options are set. The native modules needed are registered on first use.

#### Parameters

##### module

`string`

The module name.

#### Returns

`Promise`\<`string`\>

The specifier to import, or the module name unchanged if it could not be resolved.

#### Throws

GeneralError if the module uses an insecure protocol or could not be installed or downloaded.
