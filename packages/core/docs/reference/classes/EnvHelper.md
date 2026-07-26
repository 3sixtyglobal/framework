# Class: EnvHelper

Environment variable helper.

## Constructors

### Constructor

> **new EnvHelper**(): `EnvHelper`

#### Returns

`EnvHelper`

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
