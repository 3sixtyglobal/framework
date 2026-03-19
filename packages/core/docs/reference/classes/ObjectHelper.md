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

> `static` **propertyGet**\<`T`\>(`obj`, `property`): `T` \| `undefined`

Get the property of an unknown object.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### obj

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

> `static` **propertySet**(`obj`, `property`, `value`): `void`

Set the property of an unknown object.

#### Parameters

##### obj

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

> `static` **propertyDelete**(`obj`, `property`): `void`

Delete the property of an unknown object.

#### Parameters

##### obj

`unknown`

The object to set the property from.

##### property

`string`

The property to set

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

> `static` **pick**\<`T`\>(`obj`, `keys?`): `Partial`\<`T`\>

Pick a subset of properties from an object.

#### Type Parameters

##### T

`T`

#### Parameters

##### obj

`T` \| `undefined`

The object to pick the properties from.

##### keys?

keyof `T`[]

The property keys to pick.

#### Returns

`Partial`\<`T`\>

The partial object.

***

### omit() {#omit}

> `static` **omit**\<`T`\>(`obj`, `keys?`): `Partial`\<`T`\>

Omit a subset of properties from an object.

#### Type Parameters

##### T

`T`

#### Parameters

##### obj

`T` \| `undefined`

The object to omit the properties from.

##### keys?

keyof `T`[]

The property keys to omit.

#### Returns

`Partial`\<`T`\>

The partial object.

***

### split() {#split}

> `static` **split**\<`T`\>(`obj`, `keys?`): `object`

Split an object into two with the specified keys.

#### Type Parameters

##### T

`T`

#### Parameters

##### obj

`T` \| `undefined`

The object to split.

##### keys?

keyof `T`[]

The property keys to split.

#### Returns

`object`

The two partial objects.

##### picked

> **picked**: `Partial`\<`T`\> \| `undefined`

##### omitted

> **omitted**: `Partial`\<`T`\> \| `undefined`

***

### toExtended() {#toextended}

> `static` **toExtended**(`obj`): `any`

Converter the non JSON primitives to extended types.

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

Converter the extended types to non JSON primitives.

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
