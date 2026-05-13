# Class: ArrayHelper

Class to help with arrays.

## Constructors

### Constructor

> **new ArrayHelper**(): `ArrayHelper`

#### Returns

`ArrayHelper`

## Methods

### matches() {#matches}

> `static` **matches**(`arr1`, `arr2`): `boolean`

Do the two arrays match.

#### Parameters

##### arr1

`unknown`

The first array.

##### arr2

`unknown`

The second array.

#### Returns

`boolean`

True if both arrays are empty of have the same values.

***

### fromObjectOrArray() {#fromobjectorarray}

> `static` **fromObjectOrArray**\<`T`\>(`value`): `T` *extends* `undefined` ? `undefined` : `T`[]

Convert an object or array to an array.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### value

`T` \| `T`[] \| `undefined`

The object or array to convert.

#### Returns

`T` *extends* `undefined` ? `undefined` : `T`[]

The array.
