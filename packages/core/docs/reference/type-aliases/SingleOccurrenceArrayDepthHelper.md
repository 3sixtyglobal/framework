# Type Alias: SingleOccurrenceArrayDepthHelper\<T, U, Depth\>

> **SingleOccurrenceArrayDepthHelper**\<`T`, `U`, `Depth`\> = `Depth`\[`"length"`\] *extends* `16` ? \[`U`, `...T[]`\] : \[`U`, `...T[]`\] \| \[`T`, `...SingleOccurrenceArrayDepthHelper<T, U, [0, ...Depth]>`\]

Helper with bounded recursion depth to keep type instantiation tractable.

## Type Parameters

### T {#t}

`T`

### U {#u}

`U`

### Depth {#depth}

`Depth` *extends* `0`[]
