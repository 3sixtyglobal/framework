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

### is() {#is}

> `static` **is**(`value`): value is string \| IDuration

Is the value a valid ISO 8601 duration string or an IDuration object.
Components must be integers with a consistent sign, as required by Temporal.

#### Parameters

##### value

`unknown`

The value to test.

#### Returns

value is string \| IDuration

True if the value is a valid ISO 8601 duration string or an IDuration object.

***

### guard() {#guard}

> `static` **guard**(`source`, `property`, `value`): asserts value is string \| IDuration

Guard that the property is a valid ISO 8601 duration string or an IDuration object.

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

GuardError If the value is not a valid duration.

***

### parse() {#parse}

> `static` **parse**(`value`): [`IDuration`](../interfaces/IDuration.md) \| `undefined`

Parse an ISO 8601 duration string into its component parts.
A fraction on the smallest time unit is balanced into the smaller units, e.g. "PT1.5H" is
1 hour 30 minutes, matching Temporal.

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

`string` \| [`IDuration`](../interfaces/IDuration.md)

The duration to convert.

#### Returns

`string`

The ISO 8601 duration string (e.g. "P1Y2M3DT4H5M6S").

***

### toLocaleString() {#tolocalestring}

> `static` **toLocaleString**(`duration`, `style?`, `locale?`): `string`

Format a duration as a human readable string for a locale, e.g. "1 hr, 30 min".
Zero components are omitted, so a zero duration is formatted as an empty string, except for the
digital style which formats it as zero time, e.g. "0:00:00", matching Temporal.

#### Parameters

##### duration

`string` \| [`IDuration`](../interfaces/IDuration.md)

The duration to format.

##### style?

[`DurationFormatStyle`](../type-aliases/DurationFormatStyle.md)

The format style, defaults to short.

##### locale?

`string`

The locale to format for, defaults to the current I18n locale.

#### Returns

`string`

The formatted duration.

#### Throws

GeneralError if the duration exceeds the limits of Intl.DurationFormat, years, months
and weeks must be less than 2^32 and the remaining components less than 2^53 seconds.

***

### toNumber() {#tonumber}

> `static` **toNumber**(`duration`, `units`): `number`

Convert a duration object to a total value in the requested units.
Year and month components use the average values 365.25 days and 30.4375 days.

#### Parameters

##### duration

`string` \| [`IDuration`](../interfaces/IDuration.md)

The duration to convert.

##### units

[`DurationUnit`](../type-aliases/DurationUnit.md)

The units to convert the duration to.

#### Returns

`number`

The total value in the requested units.

#### Throws

GeneralError if the whole part of the value exceeds the maximum safe integer.

***

### toBigInt() {#tobigint}

> `static` **toBigInt**(`duration`, `units`): `bigint`

Convert a duration object to a total value in the requested units without precision loss.
Year and month components use the average values 365.25 days and 30.4375 days.
The result is truncated towards zero to a whole number of units.

#### Parameters

##### duration

`string` \| [`IDuration`](../interfaces/IDuration.md)

The duration to convert.

##### units

[`DurationUnit`](../type-aliases/DurationUnit.md)

The units to convert the duration to.

#### Returns

`bigint`

The total value in the requested units.

***

### from() {#from}

> `static` **from**(`value`, `units`): [`IDuration`](../interfaces/IDuration.md)

Create a duration from a total value in the given units.
The value is balanced into the given units and smaller, e.g. 1.5 hours becomes 1 hour 30 minutes.
Fractional values are rounded to the nearest nanosecond.

#### Parameters

##### value

`number` \| `bigint`

The total value.

##### units

[`DurationUnit`](../type-aliases/DurationUnit.md)

The units of the value.

#### Returns

[`IDuration`](../interfaces/IDuration.md)

The duration.

#### Throws

GeneralError if a component of the duration exceeds the maximum safe integer.

***

### compare() {#compare}

> `static` **compare**(`duration1`, `duration2`): `-1` \| `0` \| `1`

Compare two durations.
Year and month components use the average values 365.25 days and 30.4375 days.

#### Parameters

##### duration1

`string` \| [`IDuration`](../interfaces/IDuration.md)

The first duration.

##### duration2

`string` \| [`IDuration`](../interfaces/IDuration.md)

The second duration.

#### Returns

`-1` \| `0` \| `1`

-1 if the first duration is shorter, 1 if it is longer, 0 if they are equal.

***

### equals() {#equals}

> `static` **equals**(`duration1`, `duration2`): `boolean`

Check if two durations have the same total length, e.g. 1 hour and 60 minutes are equal.
Year and month components use the average values 365.25 days and 30.4375 days.

#### Parameters

##### duration1

`string` \| [`IDuration`](../interfaces/IDuration.md)

The first duration.

##### duration2

`string` \| [`IDuration`](../interfaces/IDuration.md)

The second duration.

#### Returns

`boolean`

True if the durations have the same total number of nanoseconds.

***

### round() {#round}

> `static` **round**(`duration`, `options?`): [`IDuration`](../interfaces/IDuration.md)

Round a duration and balance it between the largest and smallest units.
Year and month components use the average values 365.25 days and 30.4375 days.
Weeks are only included in the result when they are the largest or smallest unit.

#### Parameters

##### duration

`string` \| [`IDuration`](../interfaces/IDuration.md)

The duration to round.

##### options?

[`IDurationRoundOptions`](../interfaces/IDurationRoundOptions.md)

The rounding options.

#### Returns

[`IDuration`](../interfaces/IDuration.md)

The rounded duration.

#### Throws

GeneralError if a component of the result exceeds the maximum safe integer.

#### Throws

GeneralError if the largest unit is smaller than the smallest unit.

***

### addToDate() {#addtodate}

> `static` **addToDate**(`date`, `duration`): `Date`

Add a duration to a date.
Years and months are added to the calendar date in UTC, clamping the day to the end of the
resulting month, e.g. 31 January plus 1 month is 28 or 29 February.
The remaining components are added as exact time, days are always 24 hours.
The result is truncated to millisecond precision.

#### Parameters

##### date

`Date`

The date to add the duration to.

##### duration

`string` \| [`IDuration`](../interfaces/IDuration.md)

The duration to add, negative durations subtract.

#### Returns

`Date`

A new date with the duration added.

#### Throws

GeneralError if the resulting date is outside the range supported by Date.
