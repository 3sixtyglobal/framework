# Interface: IContextIdHandler

Interface describing a context ID handler.

## Extends

- `IComponent`

## Methods

### short()?

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

### guard()?

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

### className()

> **className**(): `string`

Returns the class name of the component.

#### Returns

`string`

The class name of the component.

#### Inherited from

`IComponent.className`

***

### bootstrap()?

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

### start()?

> `optional` **start**(`nodeLoggingComponentType?`): `Promise`\<`void`\>

The component needs to be started when the node is initialized.

#### Parameters

##### nodeLoggingComponentType?

`string`

The node logging component type.

#### Returns

`Promise`\<`void`\>

Nothing.

#### Inherited from

`IComponent.start`

***

### stop()?

> `optional` **stop**(`nodeLoggingComponentType?`): `Promise`\<`void`\>

The component needs to be stopped when the node is closed.

#### Parameters

##### nodeLoggingComponentType?

`string`

The node logging component type.

#### Returns

`Promise`\<`void`\>

Nothing.

#### Inherited from

`IComponent.stop`
