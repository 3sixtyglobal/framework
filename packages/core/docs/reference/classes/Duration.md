# Class: Duration

Helper methods for working with ISO 8601 durations.

## Constructors

### Constructor

> **new Duration**(): `Duration`

#### Returns

`Duration`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### parse() {#parse}

> `static` **parse**(`value`): [`IDuration`](../interfaces/IDuration.md) \| `undefined`

Parse an ISO 8601 duration string into its component parts.

#### Parameters

##### value

`string`

The string to parse.

#### Returns

[`IDuration`](../interfaces/IDuration.md) \| `undefined`

The parsed duration, or undefined if the string is not a valid ISO 8601 duration.

***

### toString() {#tostring}

> `static` **toString**(`duration`): `string`

Convert a duration object to an ISO 8601 duration string.

#### Parameters

##### duration

[`IDuration`](../interfaces/IDuration.md)

The duration to convert.

#### Returns

`string`

The ISO 8601 duration string (e.g. "P1Y2M3DT4H5M6S").

***

### toSeconds() {#toseconds}

> `static` **toSeconds**(`duration`): `number`

Convert a duration object to total seconds.
Year and month components use the average values 365.25 days and 30.4375 days.

#### Parameters

##### duration

[`IDuration`](../interfaces/IDuration.md)

The duration to convert.

#### Returns

`number`

The total number of seconds.
