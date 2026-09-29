# Variable: ComparisonOperator

> `const` **ComparisonOperator**: `object`

The types of comparisons.

## Type Declaration

### Equals {#equals}

> `readonly` **Equals**: `"equals"` = `"equals"`

Equals.

### NotEquals {#notequals}

> `readonly` **NotEquals**: `"not-equals"` = `"not-equals"`

Not Equals.

### GreaterThan {#greaterthan}

> `readonly` **GreaterThan**: `"greater-than"` = `"greater-than"`

Greater Than.

### GreaterThanOrEqual {#greaterthanorequal}

> `readonly` **GreaterThanOrEqual**: `"greater-than-or-equal"` = `"greater-than-or-equal"`

Greater Than Or Equal.

### LessThan {#lessthan}

> `readonly` **LessThan**: `"less-than"` = `"less-than"`

Less Than.

### LessThanOrEqual {#lessthanorequal}

> `readonly` **LessThanOrEqual**: `"less-than-or-equal"` = `"less-than-or-equal"`

Less Than Or Equal.

### Includes {#includes}

> `readonly` **Includes**: `"includes"` = `"includes"`

Includes.
A string in a substring, this is a scan and cannot use an index.
A set contains an element.
A list contains an element.

### NotIncludes {#notincludes}

> `readonly` **NotIncludes**: `"not-includes"` = `"not-includes"`

Not Includes.
A string not in a substring.
A set does not contain an element.
A list does not contain an element.

### StartsWith {#startswith}

> `readonly` **StartsWith**: `"starts-with"` = `"starts-with"`

Starts With.
A string begins with a prefix, the anchored match can use an index.

### In {#in}

> `readonly` **In**: `"in"` = `"in"`

In.
A element is in a set.
