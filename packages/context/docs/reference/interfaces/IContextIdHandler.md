# Interface: IContextIdHandler

Interface describing a context ID handler.

## Extends

- `IComponent`

## Methods

### short()? {#short}

> `optional` **short**(`value`): `string`

The short form version of the context ID, should be unique enough to partition data.

#### Parameters

##### value

`string`

The full context ID value.

#### Returns

`string`

The short form version of the context ID.

***

### long()? {#long}

> `optional` **long**(`value`): `string`

The long form version of the context ID, expanded from a short version.

#### Parameters

##### value

`string`

The short form context ID value.

#### Returns

`string`

The long form version of the context ID.

***

### guard()? {#guard}

> `optional` **guard**(`value`): `void`

Performs a runtime guard on the provided context ID value.

#### Parameters

##### value

`string`

The context ID value to guard.

#### Returns

`void`

#### Throws

Guard error if the value is invalid.

***

### className() {#classname}

> **className**(): `string`

Returns the class name of the component.

#### Returns

`string`

The class name of the component.

#### Inherited from

`IComponent.className`

***

### bootstrap()? {#bootstrap}

> `optional` **bootstrap**(`nodeLoggingComponentType?`): `Promise`\<`boolean`\>

Bootstrap the component by creating and initializing any resources it needs.

#### Parameters

##### nodeLoggingComponentType?

`string`

The node logging component type.

#### Returns

`Promise`\<`boolean`\>

True if the bootstrapping process was successful.

#### Inherited from

`IComponent.bootstrap`

***

### teardown()? {#teardown}

> `optional` **teardown**(`nodeLoggingComponentType?`): `Promise`\<`boolean`\>

Teardown the component by releasing any resources it holds.

#### Parameters

##### nodeLoggingComponentType?

`string`

The node logging component type.

#### Returns

`Promise`\<`boolean`\>

True if the teardown process was successful.

#### Inherited from

`IComponent.teardown`

***

### start()? {#start}

> `optional` **start**(`nodeLoggingComponentType?`): `Promise`\<`void`\>

The component needs to be started when the node is initialized.

#### Parameters

##### nodeLoggingComponentType?

`string`

The node logging component type.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the component has started.

#### Inherited from

`IComponent.start`

***

### stop()? {#stop}

> `optional` **stop**(`nodeLoggingComponentType?`): `Promise`\<`void`\>

The component needs to be stopped when the node is closed.

#### Parameters

##### nodeLoggingComponentType?

`string`

The node logging component type.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the component has stopped.

#### Inherited from

`IComponent.stop`

***

### health()? {#health}

> `optional` **health**(): `Promise`\<`IHealth`[]\>

Returns the health status of the component.

#### Returns

`Promise`\<`IHealth`[]\>

The health status of the component, can return multiple entries for elements within the component.

#### Inherited from

`IComponent.health`
