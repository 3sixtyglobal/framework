# Interface: IModuleWorker

Worker definition for modules.

## Methods

### executeMethod() {#executemethod}

> **executeMethod**(`method`, `args?`, `contextIds?`): `void`

Execute a method in the module.

#### Parameters

##### method

`string`

The method to execute.

##### args?

`unknown`

The arguments for the method.

##### contextIds?

`IContextIds`

The context IDs.

#### Returns

`void`

The result of the method.

***

### terminate() {#terminate}

> **terminate**(): `Promise`\<`number`\>

Terminate the worker.

#### Returns

`Promise`\<`number`\>

A promise that resolves when the worker is terminated including the exit code.
