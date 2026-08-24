# Class: Coerce

Coerce an object from one type to another.

## Constructors

### Constructor

> **new Coerce**(): `Coerce`

#### Returns

`Coerce`

## Methods

### string() {#string}

> `static` **string**(`value`): `string` \| `undefined`

Coerce the value to a string.

#### Parameters

##### value

`unknown`

The value to coerce.

#### Returns

`string` \| `undefined`

The coerced string, or undefined if the value cannot be coerced.

***

### number() {#number}

> `static` **number**(`value`): `number` \| `undefined`

Coerce the value to a number.

#### Parameters

##### value

`unknown`

The value to coerce.

#### Returns

`number` \| `undefined`

The coerced number, or undefined if the value cannot be coerced.

***

### integer() {#integer}

> `static` **integer**(`value`): `number` \| `undefined`

Coerce the value to an integer.

#### Parameters

##### value

`unknown`

The value to coerce.

#### Returns

`number` \| `undefined`

The coerced integer, or undefined if the value cannot be coerced.

***

### bigint() {#bigint}

> `static` **bigint**(`value`): `bigint` \| `undefined`

Coerce the value to a bigint.

#### Parameters

##### value

`unknown`

The value to coerce.

#### Returns

`bigint` \| `undefined`

The coerced bigint, or undefined if the value cannot be coerced.

***

### boolean() {#boolean}

> `static` **boolean**(`value`): `boolean` \| `undefined`

Coerce the value to a boolean.

#### Parameters

##### value

`unknown`

The value to coerce.

#### Returns

`boolean` \| `undefined`

The coerced boolean, or undefined if the value cannot be coerced.

***

### date() {#date}

> `static` **date**(`value`): `Date` \| `undefined`

Coerce the value to a date.

#### Parameters

##### value

`unknown`

The value to coerce.

#### Returns

`Date` \| `undefined`

The coerced date, or undefined if the value cannot be coerced.

***

### dateTime() {#datetime}

> `static` **dateTime**(`value`): `Date` \| `undefined`

Coerce the value to a date/time.

#### Parameters

##### value

`unknown`

The value to coerce.

#### Returns

`Date` \| `undefined`

The coerced date/time, or undefined if the value cannot be coerced.

***

### time() {#time}

> `static` **time**(`value`): `Date` \| `undefined`

Coerce the value to a time.

#### Parameters

##### value

`unknown`

The value to coerce.

#### Returns

`Date` \| `undefined`

The coerced time, or undefined if the value cannot be coerced.

***

### duration() {#duration}

> `static` **duration**(`value`): [`IDuration`](../interfaces/IDuration.md) \| `undefined`

Coerce the value to a duration object.
Accepts an IDuration object, ISO 8601 duration strings (e.g. "PT1H", "P1Y2M3DT4H5M6S"),
or numeric values already expressed as seconds (stored in the seconds field).

#### Parameters

##### value

`unknown`

The value to coerce.

#### Returns

[`IDuration`](../interfaces/IDuration.md) \| `undefined`

The duration object, or undefined if the value cannot be coerced.

***

### array() {#array}

> `static` **array**\<`T`\>(`value`): `T`[] \| `undefined`

Coerce the value to an array.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### value

`unknown`

The value to coerce.

#### Returns

`T`[] \| `undefined`

The coerced array, or undefined if the value cannot be coerced.

***

### object() {#object}

> `static` **object**\<`T`\>(`value`): `T` \| `undefined`

Coerce the value to an object.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### value

`unknown`

The value to coerce.

#### Returns

`T` \| `undefined`

The coerced object, or undefined if the value cannot be coerced.

***

### uint8Array() {#uint8array}

> `static` **uint8Array**(`value`): `Uint8Array`\<`ArrayBufferLike`\> \| `undefined`

Coerce the value to a Uint8Array.

#### Parameters

##### value

`unknown`

The value to coerce.

#### Returns

`Uint8Array`\<`ArrayBufferLike`\> \| `undefined`

The coerced Uint8Array, or undefined if the value cannot be coerced.

***

### byType() {#bytype}

> `static` **byType**(`value`, `type?`): `unknown`

Coerces a value based on the coercion type.

#### Parameters

##### value

`unknown`

The value to coerce.

##### type?

[`CoerceType`](../type-aliases/CoerceType.md)

The coercion type to perform.

#### Returns

`unknown`

The coerced value.
