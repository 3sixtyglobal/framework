# Class: EnvHelper

Environment variable helper.

## Constructors

### Constructor

> **new EnvHelper**(): `EnvHelper`

#### Returns

`EnvHelper`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### envToJson() {#envtojson}

> `static` **envToJson**\<`T`\>(`envVars`, `prefix?`): `T`

Get the environment variable as an object with camel cased names.

#### Type Parameters

##### T

`T` = \{\[`id`: `string`\]: `string`; \}

#### Parameters

##### envVars

The environment variables.

##### prefix?

`string`

The prefix of the environment variables, if not provided gets all.

#### Returns

`T`

The object with camel cased names.

***

### envVarKeyToJsonKey() {#envvarkeytojsonkey}

> `static` **envVarKeyToJsonKey**(`envVarKey`, `prefix?`): `string`

Convert an environment variable key to a JSON key.
A trailing _* or * is preserved as a wildcard suffix (e.g. TWIN_REST_PATH_* → "restPath*").

#### Parameters

##### envVarKey

`string`

The environment variable key.

##### prefix?

`string`

The prefix of the environment variable key, if not provided gets all.

#### Returns

`string`

The JSON key.

***

### jsonKeyToEnvVarKey() {#jsonkeytoenvvarkey}

> `static` **jsonKeyToEnvVarKey**(`jsonKey`, `prefix?`): `string`

Convert a JSON key to an environment variable key.

#### Parameters

##### jsonKey

`string`

The JSON key.

##### prefix?

`string`

The prefix of the environment variable key, if not provided gets all.

#### Returns

`string`

The environment variable key.

***

### envString() {#envstring}

#### Call Signature

> `static` **envString**\<`T`\>(`envVars`, `key`, `defaultValue`): `string`

Returns an env var as a string when it holds a non-empty value, falling back to the supplied default.

##### Type Parameters

###### T

`T`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to read.

###### defaultValue

`string`

The value to return when the env var is absent or empty. Omit to return undefined when absent.

##### Returns

`string`

The string value, the default, or undefined when absent and no default given.

#### Call Signature

> `static` **envString**\<`T`\>(`envVars`, `key`): `string` \| `undefined`

Returns an env var as a string when it holds a non-empty value, falling back to the supplied default.

##### Type Parameters

###### T

`T`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to read.

##### Returns

`string` \| `undefined`

The string value, the default, or undefined when absent and no default given.

***

### envChoice() {#envchoice}

#### Call Signature

> `static` **envChoice**\<`T`, `U`\>(`envVars`, `key`, `choices`, `defaultValue`): `U`

Returns an env var constrained to one of the supplied choices, falling back to the supplied default.

##### Type Parameters

###### T

`T`

###### U

`U` *extends* `string`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to read.

###### choices

readonly `U`[]

The permitted values for the env var.

###### defaultValue

`U`

The value to return when the env var is absent or empty. Omit to return undefined when absent.

##### Returns

`U`

The matching choice, the default, or undefined when absent and no default given.

##### Throws

GeneralError if the value is set but is not one of the choices.

#### Call Signature

> `static` **envChoice**\<`T`, `U`\>(`envVars`, `key`, `choices`): `U` \| `undefined`

Returns an env var constrained to one of the supplied choices, falling back to the supplied default.

##### Type Parameters

###### T

`T`

###### U

`U` *extends* `string`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to read.

###### choices

readonly `U`[]

The permitted values for the env var.

##### Returns

`U` \| `undefined`

The matching choice, the default, or undefined when absent and no default given.

##### Throws

GeneralError if the value is set but is not one of the choices.

***

### envBoolean() {#envboolean}

#### Call Signature

> `static` **envBoolean**\<`T`\>(`envVars`, `key`, `defaultValue`): `boolean`

Coerces an env var to a boolean, falling back to the supplied default when not set.

##### Type Parameters

###### T

`T`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to coerce.

###### defaultValue

`boolean`

The value to return when the env var is absent. Omit to return undefined when absent.

##### Returns

`boolean`

The boolean value, the default, or undefined when absent and no default given.

##### Throws

GeneralError if the value is set but cannot be coerced to a boolean.

#### Call Signature

> `static` **envBoolean**\<`T`\>(`envVars`, `key`): `boolean` \| `undefined`

Coerces an env var to a boolean, falling back to the supplied default when not set.

##### Type Parameters

###### T

`T`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to coerce.

##### Returns

`boolean` \| `undefined`

The boolean value, the default, or undefined when absent and no default given.

##### Throws

GeneralError if the value is set but cannot be coerced to a boolean.

***

### envMs() {#envms}

#### Call Signature

> `static` **envMs**\<`T`\>(`envVars`, `key`, `defaultValue`): `number`

Coerces an env var that is already in milliseconds to an integer.

##### Type Parameters

###### T

`T`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to coerce.

###### defaultValue

`number`

The value to return when the env var is absent. Omit to return undefined when absent.

##### Returns

`number`

The millisecond value, the default, or undefined when absent and no default given.

##### Throws

GeneralError if the value is set but cannot be coerced to an integer.

#### Call Signature

> `static` **envMs**\<`T`\>(`envVars`, `key`): `number` \| `undefined`

Coerces an env var that is already in milliseconds to an integer.

##### Type Parameters

###### T

`T`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to coerce.

##### Returns

`number` \| `undefined`

The millisecond value, the default, or undefined when absent and no default given.

##### Throws

GeneralError if the value is set but cannot be coerced to an integer.

***

### envCount() {#envcount}

#### Call Signature

> `static` **envCount**\<`T`\>(`envVars`, `key`, `defaultValue`): `number`

Coerces an env var that represents an integer count or size to an integer.

##### Type Parameters

###### T

`T`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to coerce.

###### defaultValue

`number`

The value to return when the env var is absent. Omit to return undefined when absent.

##### Returns

`number`

The count, the default, or undefined when absent and no default given.

##### Throws

GeneralError if the value is set but cannot be coerced to an integer.

#### Call Signature

> `static` **envCount**\<`T`\>(`envVars`, `key`): `number` \| `undefined`

Coerces an env var that represents an integer count or size to an integer.

##### Type Parameters

###### T

`T`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to coerce.

##### Returns

`number` \| `undefined`

The count, the default, or undefined when absent and no default given.

##### Throws

GeneralError if the value is set but cannot be coerced to an integer.

***

### envInteger() {#envinteger}

#### Call Signature

> `static` **envInteger**\<`T`\>(`envVars`, `key`, `defaultValue`): `number`

Coerces an env var that represents an integer to an actual integer.

##### Type Parameters

###### T

`T`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to coerce.

###### defaultValue

`number`

The value to return when the env var is absent. Omit to return undefined when absent.

##### Returns

`number`

The integer, the default, or undefined when absent and no default given.

##### Throws

GeneralError if the value is set but cannot be coerced to an integer.

#### Call Signature

> `static` **envInteger**\<`T`\>(`envVars`, `key`): `number` \| `undefined`

Coerces an env var that represents an integer to an actual integer.

##### Type Parameters

###### T

`T`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to coerce.

##### Returns

`number` \| `undefined`

The integer, the default, or undefined when absent and no default given.

##### Throws

GeneralError if the value is set but cannot be coerced to an integer.

***

### envObject() {#envobject}

#### Call Signature

> `static` **envObject**\<`T`, `U`\>(`envVars`, `key`, `defaultValue`): `U`

Returns an env var as a typed object. Accepts a pre-parsed object, an inline JSON object string,
or a value already expanded from a @json: file reference.

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to coerce.

###### defaultValue

`U`

The value to return when the env var is absent or cannot be parsed.

##### Returns

`U`

The parsed object, or the default when absent or the value cannot be parsed.

#### Call Signature

> `static` **envObject**\<`T`, `U`\>(`envVars`, `key`): `U` \| `undefined`

Returns an env var as a typed object. Accepts a pre-parsed object, an inline JSON object string,
or a value already expanded from a @json: file reference.

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to coerce.

##### Returns

`U` \| `undefined`

The parsed object, or undefined when the var is absent or the value cannot be parsed.

***

### envArray() {#envarray}

#### Call Signature

> `static` **envArray**\<`T`, `U`\>(`envVars`, `key`, `defaultValue`): `U`[]

Returns an env var as a typed array. Accepts a pre-parsed array, an inline JSON array string,
or a value already expanded from a @json: file reference.

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to coerce.

###### defaultValue

`U`[]

The value to return when the env var is absent or cannot be parsed.

##### Returns

`U`[]

The parsed array, or the default when absent or the value cannot be parsed.

#### Call Signature

> `static` **envArray**\<`T`, `U`\>(`envVars`, `key`): `U`[] \| `undefined`

Returns an env var as a typed array. Accepts a pre-parsed array, an inline JSON array string,
or a value already expanded from a @json: file reference.

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to coerce.

##### Returns

`U`[] \| `undefined`

The parsed array, or undefined when the var is absent or the value cannot be parsed.

***

### envSeconds() {#envseconds}

#### Call Signature

> `static` **envSeconds**\<`T`\>(`envVars`, `key`, `defaultValue`): `number`

Coerces an env var that is already in seconds to an integer.

##### Type Parameters

###### T

`T`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to coerce.

###### defaultValue

`number`

The value to return when the env var is absent. Omit to return undefined when absent.

##### Returns

`number`

The second value, the default, or undefined when absent and no default given.

##### Throws

GeneralError if the value is set but cannot be coerced to an integer.

#### Call Signature

> `static` **envSeconds**\<`T`\>(`envVars`, `key`): `number` \| `undefined`

Coerces an env var that is already in seconds to an integer.

##### Type Parameters

###### T

`T`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to coerce.

##### Returns

`number` \| `undefined`

The second value, the default, or undefined when absent and no default given.

##### Throws

GeneralError if the value is set but cannot be coerced to an integer.

***

### envMinutes() {#envminutes}

#### Call Signature

> `static` **envMinutes**\<`T`\>(`envVars`, `key`, `defaultValue`): `number`

Coerces an env var that is already in minutes to an integer.

##### Type Parameters

###### T

`T`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to coerce.

###### defaultValue

`number`

The value to return when the env var is absent. Omit to return undefined when absent.

##### Returns

`number`

The minute value, the default, or undefined when absent and no default given.

##### Throws

GeneralError if the value is set but cannot be coerced to an integer.

#### Call Signature

> `static` **envMinutes**\<`T`\>(`envVars`, `key`): `number` \| `undefined`

Coerces an env var that is already in minutes to an integer.

##### Type Parameters

###### T

`T`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to coerce.

##### Returns

`number` \| `undefined`

The minute value, the default, or undefined when absent and no default given.

##### Throws

GeneralError if the value is set but cannot be coerced to an integer.

***

### envDateTime() {#envdatetime}

#### Call Signature

> `static` **envDateTime**\<`T`\>(`envVars`, `key`, `defaultValue`): `string`

Coerces an env var that is a datetime string, throwing when the value is set but not a valid datetime.

##### Type Parameters

###### T

`T`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to coerce.

###### defaultValue

`string`

The value to return when the env var is absent. Omit to return undefined when absent.

##### Returns

`string`

The datetime ISO string, the default, or undefined when absent and no default given.

##### Throws

GeneralError if the value is set but cannot be coerced to a datetime.

#### Call Signature

> `static` **envDateTime**\<`T`\>(`envVars`, `key`): `string` \| `undefined`

Coerces an env var that is a datetime string, throwing when the value is set but not a valid datetime.

##### Type Parameters

###### T

`T`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to coerce.

##### Returns

`string` \| `undefined`

The datetime ISO string, the default, or undefined when absent and no default given.

##### Throws

GeneralError if the value is set but cannot be coerced to a datetime.

***

### envSecToMs() {#envsectoms}

#### Call Signature

> `static` **envSecToMs**\<`T`\>(`envVars`, `key`, `defaultValue`): `number`

Coerces an env var to an integer and converts from seconds to milliseconds.
Values of zero or less are returned unchanged so sentinels such as -1 keep their meaning.

##### Type Parameters

###### T

`T`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to coerce.

###### defaultValue

`number`

The value to return when the env var is absent. Omit to return undefined when absent.

##### Returns

`number`

The value in milliseconds, the default, or undefined when absent and no default given.

##### Throws

GeneralError if the value is set but cannot be coerced to an integer.

#### Call Signature

> `static` **envSecToMs**\<`T`\>(`envVars`, `key`): `number` \| `undefined`

Coerces an env var to an integer and converts from seconds to milliseconds.
Values of zero or less are returned unchanged so sentinels such as -1 keep their meaning.

##### Type Parameters

###### T

`T`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to coerce.

##### Returns

`number` \| `undefined`

The value in milliseconds, the default, or undefined when absent and no default given.

##### Throws

GeneralError if the value is set but cannot be coerced to an integer.

***

### envMinToMs() {#envmintoms}

#### Call Signature

> `static` **envMinToMs**\<`T`\>(`envVars`, `key`, `defaultValue`): `number`

Coerces an env var to an integer and converts from minutes to milliseconds.
Values of zero or less are returned unchanged so sentinels such as -1 keep their meaning.

##### Type Parameters

###### T

`T`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to coerce.

###### defaultValue

`number`

The value to return when the env var is absent. Omit to return undefined when absent.

##### Returns

`number`

The value in milliseconds, the default, or undefined when absent and no default given.

##### Throws

GeneralError if the value is set but cannot be coerced to an integer.

#### Call Signature

> `static` **envMinToMs**\<`T`\>(`envVars`, `key`): `number` \| `undefined`

Coerces an env var to an integer and converts from minutes to milliseconds.
Values of zero or less are returned unchanged so sentinels such as -1 keep their meaning.

##### Type Parameters

###### T

`T`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var to coerce.

##### Returns

`number` \| `undefined`

The value in milliseconds, the default, or undefined when absent and no default given.

##### Throws

GeneralError if the value is set but cannot be coerced to an integer.

***

### envListToArray() {#envlisttoarray}

#### Call Signature

> `static` **envListToArray**\<`T`, `U`\>(`envVars`, `key`, `expectedValues?`): `U`[]

Converts a comma separated list to an array.

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var.

###### expectedValues?

`U`[]

An optional array of expected values.

##### Returns

`U`[]

The array, empty when the env var is absent.

##### Throws

GeneralError if the list contains a value not in the expected values.

#### Call Signature

> `static` **envListToArray**\<`T`, `U`\>(`envVars`, `key`, `expectedValues`, `defaultValue`): `U`[]

Converts a comma separated list to an array.

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var.

###### expectedValues

`U`[] \| `undefined`

An optional array of expected values.

###### defaultValue

`U`[]

The default value to return when the list is empty or undefined.

##### Returns

`U`[]

The array, or the default when the env var is absent.

##### Throws

GeneralError if the list contains a value not in the expected values.

#### Call Signature

> `static` **envListToArray**\<`T`, `U`\>(`envVars`, `key`, `expectedValues`, `defaultValue`): `U`[] \| `undefined`

Converts a comma separated list to an array.

##### Type Parameters

###### T

`T`

###### U

`U`

##### Parameters

###### envVars

`T`

The environment variables object.

###### key

keyof `T`

The property name of the env var.

###### expectedValues

`U`[] \| `undefined`

An optional array of expected values.

###### defaultValue

`U`[] \| `undefined`

The default value to return when the list is empty or undefined.

##### Returns

`U`[] \| `undefined`

The array, or the default when the env var is absent, which may be undefined.

##### Throws

GeneralError if the list contains a value not in the expected values.

***

### commaSeparatedListToArray() {#commaseparatedlisttoarray}

#### Call Signature

> `static` **commaSeparatedListToArray**\<`U`\>(`value`): `U`[]

Converts a comma separated list to an array.

##### Type Parameters

###### U

`U`

##### Parameters

###### value

`string` \| `undefined`

The comma separated list.

##### Returns

`U`[]

The array, empty when the list is empty or undefined.

#### Call Signature

> `static` **commaSeparatedListToArray**\<`U`\>(`value`, `defaultValue`): `U`[] \| `undefined`

Converts a comma separated list to an array.

##### Type Parameters

###### U

`U`

##### Parameters

###### value

`string` \| `undefined`

The comma separated list.

###### defaultValue

`U`[] \| `undefined`

The default value to return when the list is empty or undefined.

##### Returns

`U`[] \| `undefined`

The array, or the default when the list is empty or undefined.

***

### envKeyIntegerPairs() {#envkeyintegerpairs}

> `static` **envKeyIntegerPairs**\<`T`\>(`envVars`, `key`): \{\[`key`: `string`\]: `number`; \} \| `undefined`

Gets named key integer pairs from an env var holding comma separated key=integer pairs.

#### Type Parameters

##### T

`T`

#### Parameters

##### envVars

`T`

The environment variables object.

##### key

keyof `T`

The property name of the env var to read.

#### Returns

\{\[`key`: `string`\]: `number`; \} \| `undefined`

The named key integer pairs, or undefined when the env var is absent or empty.

#### Throws

GeneralError if an entry is not a unique name=value pair with an integer value.

***

### matchesPatternSet() {#matchespatternset}

> `static` **matchesPatternSet**(`camelKey`, `patternSet`): `boolean`

Test whether a camelCase key matches an entry in a pattern set.
Entries ending with "*" are treated as prefix patterns; all others require an exact match.

#### Parameters

##### camelKey

`string`

The camelCase key to test.

##### patternSet

`ReadonlySet`\<`string`\> \| `Set`\<`string`\>

The set of exact keys and/or wildcard patterns (e.g. "restPath*").

#### Returns

`boolean`

True if the key matches any entry.

***

### warnDeprecatedEnvVarKeys() {#warndeprecatedenvvarkeys}

> `static` **warnDeprecatedEnvVarKeys**(`envVars`, `prefix`, `deprecatedKeys?`): `object`[]

Report any environment variables which are still recognised but no longer used.

#### Parameters

##### envVars

The already-converted camelCase env variables.

##### prefix

`string`

The prefix used for the environment variables (e.g. "TWIN_").

##### deprecatedKeys?

`ReadonlyMap`\<`string`, readonly `string`[]\>

An optional map of deprecated keys to their replacements. If not provided, the default set is used.

#### Returns

`object`[]

An array of warnings, each containing the deprecated key and its suggested replacements if any.

***

### validateEnvVarKeys() {#validateenvvarkeys}

> `static` **validateEnvVarKeys**(`envVars`, `prefix`, `allowSets`, `deprecatedKeys?`): `string`[] \| `undefined`

Validate that every key in envVars maps to a recognised property.
All unknown keys are collected, then reported together as a single error or warning.
Raw env var names listed in the allow list (e.g. TWIN_MY_EXTENSION_SECRET, TWIN_REST_PATH_*) are always accepted.
Wildcard patterns ending with * are supported in both allow sets and the allow list.

#### Parameters

##### envVars

`object` & `object`

The already-converted camelCase env variables.

##### prefix

`string`

The prefix used for the environment variables (e.g. "TWIN_").

##### allowSets

`ReadonlySet`\<`string`\>[]

An array of sets of allowed keys and/or wildcard patterns.

##### deprecatedKeys?

`ReadonlyMap`\<`string`, readonly `string`[]\>

An optional map of deprecated keys to their replacements. If not provided, the default set is used.

#### Returns

`string`[] \| `undefined`

A warning message if unknown env var properties are found and the strict mode is "warn", otherwise undefined.

#### Throws

GeneralError If any unknown env var properties are found and strict mode is "error", or if the strict mode value is invalid.
