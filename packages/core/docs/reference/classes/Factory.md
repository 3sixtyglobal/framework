# Class: Factory\<T\>

Factory for creating implementation of generic types.

## Type Parameters

### T

`T`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### createFactory() {#createfactory}

> `static` **createFactory**\<`U`\>(`typeName`, `autoInstance?`, `matcher?`): `Factory`\<`U`\>

Create a new factory, which is shared throughout all library instances.

#### Type Parameters

##### U

`U`

#### Parameters

##### typeName

`string`

The type name for the instances.

##### autoInstance?

`boolean` = `false`

Automatically create an instance when registered.

##### matcher?

(`names`, `name`) => `string` \| `undefined`

Match the name of the instance.

#### Returns

`Factory`\<`U`\>

The factory instance.

***

### getFactories() {#getfactories}

> `static` **getFactories**(): `object`

Get all the factories.

#### Returns

`object`

All the factories.

***

### getFactory() {#getfactory}

> `static` **getFactory**\<`T`\>(`typeName`): `Factory`\<`T`\> \| `undefined`

Get a specific factory by type name.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### typeName

`string`

The type name of the factory.

#### Returns

`Factory`\<`T`\> \| `undefined`

The factory instance if it exists, otherwise undefined.

***

### resetFactories() {#resetfactories}

> `static` **resetFactories**(): `void`

Reset all the factories, which removes any created instances, but not the registrations.

#### Returns

`void`

***

### clearFactories() {#clearfactories}

> `static` **clearFactories**(): `void`

Clear all the factories, which removes anything registered with the factories.

#### Returns

`void`

***

### typeName() {#typename}

> **typeName**(): `string`

Get the type name of the factory.

#### Returns

`string`

The type name of the factory.

***

### register() {#register}

> **register**\<`U`\>(`name`, `generator`): `void`

Register a new generator.

#### Type Parameters

##### U

`U`

#### Parameters

##### name

`string`

The name of the generator.

##### generator

(`args?`) => `U`

The function to create an instance.

#### Returns

`void`

***

### unregister() {#unregister}

> **unregister**(`name`): `void`

Unregister a generator.

#### Parameters

##### name

`string`

The name of the generator to unregister.

#### Returns

`void`

#### Throws

GuardError if the parameters are invalid.

#### Throws

GeneralError if no generator exists.

***

### get() {#get}

> **get**\<`U`\>(`name`): `U`

Get a generator instance.

#### Type Parameters

##### U

`U`

#### Parameters

##### name

`string`

The name of the instance to generate.

#### Returns

`U`

An instance of the item.

#### Throws

GuardError if the parameters are invalid.

#### Throws

GeneralError if no item exists to get.

***

### getIfExists() {#getifexists}

> **getIfExists**\<`U`\>(`name?`): `U` \| `undefined`

Get a generator instance with no exceptions.

#### Type Parameters

##### U

`U`

#### Parameters

##### name?

`string`

The name of the instance to generate.

#### Returns

`U` \| `undefined`

An instance of the item or undefined if it does not exist.

***

### create() {#create}

> **create**\<`U`\>(`name`, `args?`): `U`

Create a new instance without caching it.

#### Type Parameters

##### U

`U`

#### Parameters

##### name

`string`

The name of the instance to generate.

##### args?

`unknown`

The arguments to pass to the generator.

#### Returns

`U`

A new instance of the item.

#### Throws

GuardError if the parameters are invalid.

#### Throws

GeneralError if no item exists to create.

***

### createIfExists() {#createifexists}

> **createIfExists**\<`U`\>(`name`, `args?`): `U` \| `undefined`

Create a new instance without caching it if it exists.

#### Type Parameters

##### U

`U`

#### Parameters

##### name

`string`

The name of the instance to generate.

##### args?

`unknown`

The arguments to pass to the generator.

#### Returns

`U` \| `undefined`

A new instance of the item if it exists.

#### Throws

GuardError if the parameters are invalid.

***

### reset() {#reset}

> **reset**(): `void`

Remove all the instances and leave the generators intact.

#### Returns

`void`

***

### clear() {#clear}

> **clear**(): `void`

Remove all the instances and the generators.

#### Returns

`void`

***

### useFacade() {#usefacade}

> **useFacade**(`name`, `excludeTypes?`): `void`

Activate a facade for this factory, so every instance it produces is wrapped by it.
An instance is passed through the facades in the order they were activated, so the facade
activated first is the outermost. Activating a facade which is already active does nothing.

#### Parameters

##### name

`string`

The name of the facade, as registered with the facade factory.

##### excludeTypes?

`string`[]

The instance types the facade is not applied to, named as they are
registered with this factory.

#### Returns

`void`

#### Throws

GuardError if the parameters are invalid.

#### Throws

GeneralError if no facade is registered with the name, or the factory is the facade
factory itself.

***

### unuseFacade() {#unusefacade}

> **unuseFacade**(`name`): `void`

Deactivate a facade for this factory. Deactivating a facade which is not active does nothing.

#### Parameters

##### name

`string`

The name of the facade to deactivate.

#### Returns

`void`

#### Throws

GuardError if the parameters are invalid.

***

### instancesMap() {#instancesmap}

> **instancesMap**(`withFacade?`): `object`

Get all the instances as a map.

#### Parameters

##### withFacade?

`boolean`

Return the instances with the active facades applied, defaults to false.

#### Returns

`object`

The instances as a map.

***

### instancesList() {#instanceslist}

> **instancesList**(`withFacade?`): `T`[]

Get all the instances as a list in the order they were registered.

#### Parameters

##### withFacade?

`boolean`

Return the instances with the active facades applied, defaults to false.

#### Returns

`T`[]

The instances as a list in the order they were registered.

***

### names() {#names}

> **names**(): `string`[]

Get all the generator names in the order they were registered.

#### Returns

`string`[]

The ordered generator names.

***

### hasName() {#hasname}

> **hasName**(`name`): `boolean`

Does the factory contain the name.

#### Parameters

##### name

`string`

The name of the instance to find.

#### Returns

`boolean`

True if the factory has a matching name.
