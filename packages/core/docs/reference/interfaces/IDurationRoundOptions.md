# Interface: IDurationRoundOptions

Options for rounding a duration.

## Properties

### largestUnit? {#largestunit}

> `optional` **largestUnit?**: [`DurationUnit`](../type-aliases/DurationUnit.md)

The largest unit to include in the result, defaults to the larger of the largest
non-zero unit in the duration and the smallest unit.

***

### smallestUnit? {#smallestunit}

> `optional` **smallestUnit?**: [`DurationUnit`](../type-aliases/DurationUnit.md)

The smallest unit to include in the result, defaults to nanoseconds.

***

### roundingMode? {#roundingmode}

> `optional` **roundingMode?**: [`DurationRoundingMode`](../type-aliases/DurationRoundingMode.md)

The rounding mode to use, defaults to half expand.
