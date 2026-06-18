# Class: Guards

Class to handle guard operations for parameters.

## Constructors

### Constructor

> **new Guards**(): `Guards`

#### Returns

`Guards`

## Methods

### defined() {#defined}

> `static` **defined**(`source`, `property`, `value`): `asserts value`

Is the property defined.

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

`asserts value`

#### Throws

GuardError If the value does not match the assertion.

***

### string() {#string}

> `static` **string**(`source`, `property`, `value`): `asserts value is string`

Is the property a string.

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

`asserts value is string`

#### Throws

GuardError If the value does not match the assertion.

***

### stringValue() {#stringvalue}

> `static` **stringValue**(`source`, `property`, `value`): `asserts value is string`

Is the property a string with a value.

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

`asserts value is string`

#### Throws

GuardError If the value does not match the assertion.

***

### json() {#json}

> `static` **json**(`source`, `property`, `value`): `asserts value is string`

Is the property a JSON value.

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

`asserts value is string`

#### Throws

GuardError If the value does not match the assertion.

***

### stringBase64() {#stringbase64}

> `static` **stringBase64**(`source`, `property`, `value`): `asserts value is string`

Is the property a base64 string.

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

`asserts value is string`

#### Throws

GuardError If the value does not match the assertion.

***

### stringBase64Url() {#stringbase64url}

> `static` **stringBase64Url**(`source`, `property`, `value`): `asserts value is string`

Is the property a base64 url string.

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

`asserts value is string`

#### Throws

GuardError If the value does not match the assertion.

***

### stringBase58() {#stringbase58}

> `static` **stringBase58**(`source`, `property`, `value`): `asserts value is string`

Is the property a base58 string.

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

`asserts value is string`

#### Throws

GuardError If the value does not match the assertion.

***

### stringHex() {#stringhex}

> `static` **stringHex**(`source`, `property`, `value`, `allowPrefix?`): `asserts value is string`

Is the property a string with a hex value.

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

##### allowPrefix?

`boolean` = `false`

Allow the hex to have the 0x prefix.

#### Returns

`asserts value is string`

#### Throws

GuardError If the value does not match the assertion.

***

### stringHexLength() {#stringhexlength}

> `static` **stringHexLength**(`source`, `property`, `value`, `length`, `allowPrefix?`): `asserts value is string`

Is the property a string with a hex value with fixed length.

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

##### length

`number`

The length of the string to match.

##### allowPrefix?

`boolean` = `false`

Allow the hex to have the 0x prefix.

#### Returns

`asserts value is string`

#### Throws

GuardError If the value does not match the assertion.

***

### number() {#number}

> `static` **number**(`source`, `property`, `value`): `asserts value is number`

Is the property a number.

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

`asserts value is number`

#### Throws

GuardError If the value does not match the assertion.

***

### integer() {#integer}

> `static` **integer**(`source`, `property`, `value`): `asserts value is number`

Is the property an integer.

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

`asserts value is number`

#### Throws

GuardError If the value does not match the assertion.

***

### bigint() {#bigint}

> `static` **bigint**(`source`, `property`, `value`): `asserts value is bigint`

Is the property a bigint.

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

`asserts value is bigint`

#### Throws

GuardError If the value does not match the assertion.

***

### boolean() {#boolean}

> `static` **boolean**(`source`, `property`, `value`): `asserts value is boolean`

Is the property a boolean.

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

`asserts value is boolean`

#### Throws

GuardError If the value does not match the assertion.

***

### date() {#date}

> `static` **date**(`source`, `property`, `value`): `asserts value is Date`

Is the property a date.

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

`asserts value is Date`

#### Throws

GuardError If the value does not match the assertion.

***

### dateString() {#datestring}

> `static` **dateString**(`source`, `property`, `value`): `asserts value is string`

Is the property a date-only string (ISO 8601 date, no time component).

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

`asserts value is string`

#### Throws

GuardError If the value does not match the assertion.

***

### dateTimeString() {#datetimestring}

> `static` **dateTimeString**(`source`, `property`, `value`): `asserts value is string`

Is the property a date-time string (ISO 8601 with T separator).

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

`asserts value is string`

#### Throws

GuardError If the value does not match the assertion.

***

### timeString() {#timestring}

> `static` **timeString**(`source`, `property`, `value`): `asserts value is string`

Is the property a time-only string (ISO 8601 time, no date component).

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

`asserts value is string`

#### Throws

GuardError If the value does not match the assertion.

***

### timestampMilliseconds() {#timestampmilliseconds}

> `static` **timestampMilliseconds**(`source`, `property`, `value`): `asserts value is number`

Is the property a timestamp in milliseconds.

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

`asserts value is number`

#### Throws

GuardError If the value does not match the assertion.

***

### timestampSeconds() {#timestampseconds}

> `static` **timestampSeconds**(`source`, `property`, `value`): `asserts value is number`

Is the property a timestamp in seconds.

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

`asserts value is number`

#### Throws

GuardError If the value does not match the assertion.

***

### object() {#object}

> `static` **object**\<`T`\>(`source`, `property`, `value`): `asserts value is T`

Is the property an object.

#### Type Parameters

##### T

`T` = \{\[`id`: `string`\]: `unknown`; \}

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

`asserts value is T`

#### Throws

GuardError If the value does not match the assertion.

***

### objectValue() {#objectvalue}

> `static` **objectValue**\<`T`\>(`source`, `property`, `value`): `asserts value is T`

Is the property is an object with at least one property.

#### Type Parameters

##### T

`T` = \{\[`id`: `string`\]: `unknown`; \}

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

`asserts value is T`

#### Throws

GuardError If the value does not match the assertion.

***

### array() {#array}

> `static` **array**\<`T`\>(`source`, `property`, `value`): `asserts value is T[]`

Is the property is an array.

#### Type Parameters

##### T

`T`

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

`asserts value is T[]`

#### Throws

GuardError If the value does not match the assertion.

***

### arrayValue() {#arrayvalue}

> `static` **arrayValue**\<`T`\>(`source`, `property`, `value`): `asserts value is T[]`

Is the property is an array with at least one item.

#### Type Parameters

##### T

`T`

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

`asserts value is T[]`

#### Throws

GuardError If the value does not match the assertion.

***

### arrayOneOf() {#arrayoneof}

> `static` **arrayOneOf**\<`T`\>(`source`, `property`, `value`, `options`): `asserts value is T`

Is the property one of a list of items.

#### Type Parameters

##### T

`T`

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`T`

The value to test.

##### options

`T`[]

The options the value must be one of.

#### Returns

`asserts value is T`

#### Throws

GuardError If the value does not match the assertion.

***

### arrayStartsWith() {#arraystartswith}

> `static` **arrayStartsWith**\<`T`\>(`source`, `property`, `value`, `startValues`): `asserts value is T[]`

Does the array start with the specified data.

#### Type Parameters

##### T

`T`

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

##### startValues

[`ObjectOrArray`](../type-aliases/ObjectOrArray.md)\<`T`\>

The values that must start the array.

#### Returns

`asserts value is T[]`

#### Throws

GuardError If the value does not match the assertion.

***

### arrayEndsWith() {#arrayendswith}

> `static` **arrayEndsWith**\<`T`\>(`source`, `property`, `value`, `endValues`): `asserts value is T[]`

Does the array end with the specified data.

#### Type Parameters

##### T

`T`

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

##### endValues

[`ObjectOrArray`](../type-aliases/ObjectOrArray.md)\<`T`\>

The values that must end the array.

#### Returns

`asserts value is T[]`

#### Throws

GuardError If the value does not match the assertion.

***

### uint8Array() {#uint8array}

> `static` **uint8Array**(`source`, `property`, `value`): `asserts value is Uint8Array<ArrayBufferLike>`

Is the property a Uint8Array.

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

`asserts value is Uint8Array<ArrayBufferLike>`

#### Throws

GuardError If the value does not match the assertion.

***

### function() {#function}

> `static` **function**\<`T`\>(`source`, `property`, `value`): `asserts value is T`

Is the property a function.

#### Type Parameters

##### T

`T` *extends* (...`args`) => `any` = (...`args`) => `any`

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

`asserts value is T`

#### Throws

GuardError If the value does not match the assertion.

***

### email() {#email}

> `static` **email**(`source`, `property`, `value`): `asserts value is string`

Is the property a string formatted as an email address.

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

`asserts value is string`

#### Throws

GuardError If the value does not match the assertion.

***

### uuidV7() {#uuidv7}

> `static` **uuidV7**(`source`, `property`, `value`, `format?`): `asserts value is string`

Is the property a string containing uuidV7.

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

##### format?

`"standard"` \| `"compact"`

The format of the uuidV7, either standard or compact.

#### Returns

`asserts value is string`

#### Throws

GuardError If the value does not match the assertion.

***

### duration() {#duration}

> `static` **duration**(`source`, `property`, `value`): asserts value is string \| IDuration

Is the property a valid ISO 8601 duration string or IDuration object.

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The value to test.

#### Returns

asserts value is string \| IDuration

#### Throws

GuardError If the value does not match the assertion.
