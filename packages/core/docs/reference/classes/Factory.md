# Class: Factory\<T\>

Factory for creating implementation of generic types.

## Type Parameters

### T

`T`

## Properties

### CLASS\_NAME

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### createFactory()

> `static` **createFactory**\<`U`\>(`typeName`, `autoInstance`, `matcher?`): `Factory`\<`U`\>

Create a new factory, which is shared throughout all library instances.

#### Type Parameters

##### U

`U`

#### Parameters

##### typeName

`string`

The type name for the instances.

##### autoInstance

`boolean` = `false`

Automatically create an instance when registered.

##### matcher?

(`names`, `name`) => `string` \| `undefined`

Match the name of the instance.

#### Returns

`Factory`\<`U`\>

The factory instance.

***

### getFactories()

> `static` **getFactories**(): `object`

Get all the factories.

#### Returns

`object`

All the factories.

***

### resetFactories()

> `static` **resetFactories**(): `void`

Reset all the factories, which removes any created instances, but not the registrations.

#### Returns

`void`

***

### clearFactories()

> `static` **clearFactories**(): `void`

Clear all the factories, which removes anything registered with the factories.

#### Returns

`void`

***

### typeName()

> **typeName**(): `string`

Get the type name of the factory.

#### Returns

`string`

The type name of the factory.

***

### register()

> **register**\<`U`\>(`name`, `generator`, `options?`): `void`

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

##### options?

Options for the generator.

###### isDefault?

`boolean`

Whether the generator is the default one i.e. should be the first generator.

#### Returns

`void`

***

### unregister()

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

### get()

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

### getIfExists()

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

### create()

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

### createIfExists()

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

### reset()

> **reset**(): `void`

Remove all the instances and leave the generators intact.

#### Returns

`void`

***

### clear()

> **clear**(): `void`

Remove all the instances and the generators.

#### Returns

`void`

***

### instancesMap()

> **instancesMap**(): `object`

Get all the instances as a map.

#### Returns

`object`

The instances as a map.

***

### instancesList()

> **instancesList**(): `T`[]

Get all the instances as a list in the order they were registered.

#### Returns

`T`[]

The instances as a list in the order they were registered.

***

### names()

> **names**(): `string`[]

Get all the generator names in the order they were registered.

#### Returns

`string`[]

The ordered generator names.

***

### hasName()

> **hasName**(`name`): `boolean`

Does the factory contain the name.

#### Parameters

##### name

`string`

The name of the instance to find.

#### Returns

`boolean`

True if the factory has a matching name.
