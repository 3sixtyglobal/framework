# Class: Is

Class to check types of objects.

## Constructors

### Constructor

> **new Is**(): `Is`

#### Returns

`Is`

## Methods

### undefined() {#undefined}

> `static` **undefined**(`value`): `value is undefined`

Is the property undefined.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is undefined`

True if the value is undefined.

***

### null() {#null}

> `static` **null**(`value`): `value is null`

Is the property null.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is null`

True if the value is null.

***

### empty() {#empty}

> `static` **empty**(`value`): value is null \| undefined

Is the property null or undefined.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

value is null \| undefined

True if the value is null or undefined.

***

### notEmpty() {#notempty}

> `static` **notEmpty**(`value`): `boolean`

Is the property not null or undefined.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`boolean`

True if the value is not null or undefined.

***

### string() {#string}

> `static` **string**(`value`): `value is string`

Is the value a string.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is string`

True if the value is a string.

***

### stringValue() {#stringvalue}

> `static` **stringValue**(`value`): `value is string`

Is the value a non-empty string.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is string`

True if the value is a non-empty string.

***

### json() {#json}

> `static` **json**(`value`): `value is string`

Is the value a JSON string.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is string`

True if the value is a JSON string.

***

### stringBase64() {#stringbase64}

> `static` **stringBase64**(`value`): `value is string`

Is the value a base64 string.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is string`

True if the value is a base64 string.

***

### stringBase64Url() {#stringbase64url}

> `static` **stringBase64Url**(`value`): `value is string`

Is the value a base64 url string.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is string`

True if the value is a base64 string.

***

### stringBase58() {#stringbase58}

> `static` **stringBase58**(`value`): `value is string`

Is the value a base58 string.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is string`

True if the value is a base58 string.

***

### stringHex() {#stringhex}

> `static` **stringHex**(`value`, `allowPrefix?`): `value is string`

Is the value a hex string.

#### Parameters

##### value

`unknown`

The value to test.

##### allowPrefix?

`boolean` = `false`

Allow the hex to have the 0x prefix.

#### Returns

`value is string`

True if the value is a hex string.

***

### stringHexLength() {#stringhexlength}

> `static` **stringHexLength**(`value`, `length`, `allowPrefix?`): `value is string`

Is the value a hex string of fixed length.

#### Parameters

##### value

`unknown`

The value to test.

##### length

`number`

The length to test.

##### allowPrefix?

`boolean` = `false`

Allow the hex to have the 0x prefix.

#### Returns

`value is string`

True if the value is a hex string of required length.

***

### number() {#number}

> `static` **number**(`value`): `value is number`

Is the value a number.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is number`

True if the value is a number.

***

### integer() {#integer}

> `static` **integer**(`value`): `value is number`

Is the value an integer.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is number`

True if the value is an integer.

***

### bigint() {#bigint}

> `static` **bigint**(`value`): `value is bigint`

Is the value a big integer.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is bigint`

True if the value is a big integer.

***

### boolean() {#boolean}

> `static` **boolean**(`value`): `value is boolean`

Is the value a boolean.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is boolean`

True if the value is a boolean.

***

### date() {#date}

> `static` **date**(`value`): `value is Date`

Is the value a date.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is Date`

True if the value is a date.

***

### dateEmpty() {#dateempty}

> `static` **dateEmpty**(`value`): `boolean`

Is the value an empty date.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`boolean`

True if the value is an empty date.

***

### dateString() {#datestring}

> `static` **dateString**(`value`): `boolean`

Is the value a date string.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`boolean`

True if the value is a string in ISO 8601 date format.

***

### dateTimeString() {#datetimestring}

> `static` **dateTimeString**(`value`): `boolean`

Is the value a date string.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`boolean`

True if the value is a string in ISO 8601 date/time format.

***

### timeString() {#timestring}

> `static` **timeString**(`value`): `boolean`

Is the value a time string.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`boolean`

True if the value is a string in ISO 8601 time format.

***

### timestampSeconds() {#timestampseconds}

> `static` **timestampSeconds**(`value`): `value is number`

Is the value a timestamp in seconds.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is number`

True if the value is a timestamp in seconds.

***

### timestampMilliseconds() {#timestampmilliseconds}

> `static` **timestampMilliseconds**(`value`): `value is number`

Is the value a timestamp in milliseconds.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is number`

True if the value is a timestamp in milliseconds.

***

### object() {#object}

> `static` **object**\<`T`\>(`value`): `value is T`

Is the value an object.

#### Type Parameters

##### T

`T` = \{\[`id`: `string`\]: `unknown`; \}

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is T`

True if the value is a object.

***

### objectValue() {#objectvalue}

> `static` **objectValue**\<`T`\>(`value`): `value is T`

Is the value an object with at least one property.

#### Type Parameters

##### T

`T` = \{\[`id`: `string`\]: `unknown`; \}

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is T`

True if the value is a object.

***

### array() {#array}

> `static` **array**\<`T`\>(`value`): `value is T[]`

Is the value an array.

#### Type Parameters

##### T

`T`

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is T[]`

True if the value is an array.

***

### arrayValue() {#arrayvalue}

> `static` **arrayValue**\<`T`\>(`value`): `value is T[]`

Is the value an array with at least one element.

#### Type Parameters

##### T

`T`

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is T[]`

True if the value is an array with at least one element.

***

### arrayOneOf() {#arrayoneof}

> `static` **arrayOneOf**\<`T`\>(`value`, `options`): `value is T`

Is the value an array with at least one element.

#### Type Parameters

##### T

`T`

#### Parameters

##### value

`T`

The value to test.

##### options

`T`[]

The options the value must be one of.

#### Returns

`value is T`

True if the value is an element from the options array.

***

### uint8Array() {#uint8array}

> `static` **uint8Array**(`value`): `value is Uint8Array<ArrayBufferLike>`

Is the value a Uint8Array.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is Uint8Array<ArrayBufferLike>`

True if the value is a Uint8Array.

***

### typedArray() {#typedarray}

> `static` **typedArray**(`value`): value is Uint8Array\<ArrayBufferLike\> \| Int8Array\<ArrayBufferLike\> \| Uint16Array\<ArrayBufferLike\> \| Int16Array\<ArrayBufferLike\> \| Uint32Array\<ArrayBufferLike\> \| Int32Array\<ArrayBufferLike\> \| Float32Array\<ArrayBufferLike\> \| Float64Array\<ArrayBufferLike\>

Is the value a TypedArray.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

value is Uint8Array\<ArrayBufferLike\> \| Int8Array\<ArrayBufferLike\> \| Uint16Array\<ArrayBufferLike\> \| Int16Array\<ArrayBufferLike\> \| Uint32Array\<ArrayBufferLike\> \| Int32Array\<ArrayBufferLike\> \| Float32Array\<ArrayBufferLike\> \| Float64Array\<ArrayBufferLike\>

True if the value is a TypedArray.

***

### function() {#function}

> `static` **function**\<`T`\>(`value`): `value is T`

Is the property a function.

#### Type Parameters

##### T

`T` *extends* (...`args`) => `any` = (...`args`) => `any`

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is T`

True if the value is a function.

***

### email() {#email}

> `static` **email**(`value`): `value is string`

Is the value a string formatted as an email address.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is string`

True if the value is a string.

***

### promise() {#promise}

> `static` **promise**\<`T`\>(`value`): `value is Promise<T>`

Is the value a promise.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is Promise<T>`

True if the value is a promise.

***

### regexp() {#regexp}

> `static` **regexp**(`value`): `value is RegExp`

Is the value a regexp.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is RegExp`

True if the value is a regexp.

***

### class() {#class}

> `static` **class**\<`T`\>(`obj`): `obj is (args: any[]) => T`

Is the provided object a class constructor.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### obj

`unknown`

The object to check.

#### Returns

`obj is (args: any[]) => T`

True if the object is a class, false otherwise.

***

### uuidV7() {#uuidv7}

> `static` **uuidV7**(`value`, `format?`): `value is string`

Is the value a uuidV7 string.

#### Parameters

##### value

`unknown`

The value to test.

##### format?

`"standard"` \| `"compact"`

The format of the UUIDv7 string.

#### Returns

`value is string`

True if the value is a uuidV7 string.

***

### duration() {#duration}

> `static` **duration**(`value`): `value is string`

Is the value a valid ISO 8601 duration string.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

`value is string`

True if the value is a valid ISO 8601 duration string.
