# Class: ObjectHelper

Class to help with objects.

## Constructors

### Constructor

> **new ObjectHelper**(): `ObjectHelper`

#### Returns

`ObjectHelper`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### toBytes() {#tobytes}

> `static` **toBytes**\<`T`\>(`obj`, `format?`): `Uint8Array`

Convert an object to bytes.

#### Type Parameters

##### T

`T`

#### Parameters

##### obj

`T` \| `undefined`

The object to convert.

##### format?

`boolean` = `false`

Format the JSON content.

#### Returns

`Uint8Array`

The object as bytes.

***

### fromBytes() {#frombytes}

> `static` **fromBytes**\<`T`\>(`bytes`): `T`

Convert a bytes to an object.

#### Type Parameters

##### T

`T`

#### Parameters

##### bytes

`Uint8Array`\<`ArrayBufferLike`\> \| `null` \| `undefined`

The bytes to convert to an object.

#### Returns

`T`

The object.

#### Throws

GeneralError if there was an error parsing the JSON.

***

### clone() {#clone}

> `static` **clone**\<`T`\>(`obj`): `T`

Make a deep clone of an object.

#### Type Parameters

##### T

`T`

#### Parameters

##### obj

`T`

The object to clone.

#### Returns

`T`

The objects clone.

***

### merge() {#merge}

> `static` **merge**\<`T`, `U`\>(`obj1`, `obj2`): `T` & `U`

Deep merge objects.

#### Type Parameters

##### T

`T` = `unknown`

##### U

`U` = `unknown`

#### Parameters

##### obj1

`T`

The first object to merge.

##### obj2

`U`

The second object to merge.

#### Returns

`T` & `U`

The combined deep merge of the objects.

***

### equal() {#equal}

> `static` **equal**\<`T`\>(`obj1`, `obj2`, `strictPropertyOrder?`): `boolean`

Does one object equal another.

#### Type Parameters

##### T

`T`

#### Parameters

##### obj1

`T`

The first object to compare.

##### obj2

`T`

The second object to compare.

##### strictPropertyOrder?

`boolean`

Should the properties be in the same order, defaults to true.

#### Returns

`boolean`

True is the objects are equal.

***

### propertyGet() {#propertyget}

> `static` **propertyGet**\<`T`\>(`object`, `property`): `T` \| `undefined`

Get the property of an unknown object.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### object

`unknown`

The object to get the property from.

##### property

`string`

The property to get, can be separated by dots for nested path.

#### Returns

`T` \| `undefined`

The property.

***

### propertySet() {#propertyset}

> `static` **propertySet**(`object`, `property`, `value`): `void`

Set the property of an unknown object.

#### Parameters

##### object

`unknown`

The object to set the property from.

##### property

`string`

The property to set.

##### value

`unknown`

The value to set.

#### Returns

`void`

#### Throws

GeneralError if the property target is not an object.

***

### propertyDelete() {#propertydelete}

> `static` **propertyDelete**(`object`, `property`): `void`

Delete the property of an unknown object.

#### Parameters

##### object

`unknown`

The object to delete the property from.

##### property

`string`

The property to delete.

#### Returns

`void`

***

### extractProperty() {#extractproperty}

> `static` **extractProperty**\<`T`\>(`obj`, `propertyNames`, `removeProperties?`): `T` \| `undefined`

Extract a property from the object, providing alternative names.

#### Type Parameters

##### T

`T`

#### Parameters

##### obj

`unknown`

The object to extract from.

##### propertyNames

`string` \| `string`[]

The possible names for the property.

##### removeProperties?

`boolean` = `true`

Remove the properties from the object, defaults to true.

#### Returns

`T` \| `undefined`

The property if available.

***

### pick() {#pick}

Pick a subset of properties from an object.

#### Param

**obj**

The object to pick the properties from.

#### Param

**keys**

The property keys to pick.

#### Call Signature

> `static` **pick**\<`T`, `K`\>(`obj`, `keys?`): `Pick`\<`T`, `K`\>

Pick a subset of properties from an object.

##### Type Parameters

###### T

`T`

###### K

`K` *extends* `string` \| `number` \| `symbol`

##### Parameters

###### obj

`T`

The object to pick the properties from.

###### keys?

`K`[]

The property keys to pick.

##### Returns

`Pick`\<`T`, `K`\>

The picked object.

#### Call Signature

> `static` **pick**\<`T`, `K`\>(`obj`, `keys?`): `Pick`\<`T`, `K`\> \| `undefined`

Pick a subset of properties from an object.

##### Type Parameters

###### T

`T`

###### K

`K` *extends* `string` \| `number` \| `symbol`

##### Parameters

###### obj

`T` \| `undefined`

The object to pick the properties from.

###### keys?

`K`[]

The property keys to pick.

##### Returns

`Pick`\<`T`, `K`\> \| `undefined`

The picked object, or undefined if the input was undefined.

***

### omit() {#omit}

Omit a subset of properties from an object.

#### Param

**obj**

The object to omit the properties from.

#### Param

**keys**

The property keys to omit.

#### Call Signature

> `static` **omit**\<`T`, `K`\>(`obj`, `keys?`): `Omit`\<`T`, `K`\>

Omit a subset of properties from an object.

##### Type Parameters

###### T

`T`

###### K

`K` *extends* `string` \| `number` \| `symbol`

##### Parameters

###### obj

`T`

The object to omit the properties from.

###### keys?

`K`[]

The property keys to omit.

##### Returns

`Omit`\<`T`, `K`\>

The object without the omitted keys.

#### Call Signature

> `static` **omit**\<`T`, `K`\>(`obj`, `keys?`): `Omit`\<`T`, `K`\> \| `undefined`

Omit a subset of properties from an object.

##### Type Parameters

###### T

`T`

###### K

`K` *extends* `string` \| `number` \| `symbol`

##### Parameters

###### obj

`T` \| `undefined`

The object to omit the properties from.

###### keys?

`K`[]

The property keys to omit.

##### Returns

`Omit`\<`T`, `K`\> \| `undefined`

The object without the omitted keys, or undefined if the input was undefined.

***

### toExtended() {#toextended}

> `static` **toExtended**(`obj`): `any`

Convert the non JSON primitives to extended types.

#### Parameters

##### obj

`any`

The object to convert.

#### Returns

`any`

The object with extended properties.

***

### fromExtended() {#fromextended}

> `static` **fromExtended**(`obj`): `any`

Convert the extended types to non JSON primitives.

#### Parameters

##### obj

`any`

The object to convert.

#### Returns

`any`

The object with regular properties.

***

### removeEmptyProperties() {#removeemptyproperties}

> `static` **removeEmptyProperties**\<`T`\>(`obj`, `options?`): `T`

Remove empty properties from an object.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### obj

`T`

The object to remove the empty properties from.

##### options?

The options for the removal.

###### removeUndefined?

`boolean`

Remove undefined properties, defaults to true.

###### removeNull?

`boolean`

Remove null properties, defaults to false.

#### Returns

`T`

The object with empty properties removed.
