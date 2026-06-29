# Class: Urn

Class to help with urns.

## Constructors

### Constructor

> **new Urn**(`namespaceIdentifier`, `namespaceSpecific`): `Urn`

Create a new instance of Urn.

#### Parameters

##### namespaceIdentifier

`string`

The identifier for the namespace.

##### namespaceSpecific

`string` \| `string`[]

The specific part of the namespace.

#### Returns

`Urn`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### generateRandom() {#generaterandom}

> `static` **generateRandom**(`namespace`): `Urn`

Generate a random identifier with 32 byte id.

#### Parameters

##### namespace

`string`

The prefix for the urn.

#### Returns

`Urn`

A new Id in URN format.

***

### hasNamespace() {#hasnamespace}

> `static` **hasNamespace**(`urn`, `namespace`): `boolean`

Does the provided urn match the namespace.

#### Parameters

##### urn

`string`

The urn to check.

##### namespace

`string`

The namespace to match.

#### Returns

`boolean`

True if the namespace matches.

***

### tryParseExact() {#tryparseexact}

> `static` **tryParseExact**(`urn`): `Urn` \| `undefined`

Try and parse a string into the urn parts.

#### Parameters

##### urn

`unknown`

The urn to parse.

#### Returns

`Urn` \| `undefined`

The formatted urn or undefined if the value is not a urn.

***

### fromValidString() {#fromvalidstring}

> `static` **fromValidString**(`urn`): `Urn`

Construct a urn from a string that has already been validated.

#### Parameters

##### urn

`string`

The urn to parse.

#### Returns

`Urn`

The formatted urn.

***

### addPrefix() {#addprefix}

> `static` **addPrefix**(`urn`): `string` \| `undefined`

Add a urn: prefix if there isn't one already.

#### Parameters

##### urn

`unknown`

The urn string to add a prefix to.

#### Returns

`string` \| `undefined`

The urn with a prefix.

***

### guard() {#guard}

> `static` **guard**(`source`, `property`, `value`, `options?`): `asserts value is string`

Parse a string into the urn parts.

#### Parameters

##### source

`string`

The source of the error.

##### property

`string`

The name of the property.

##### value

`unknown`

The urn to parse.

##### options?

Optional constraints to validate the urn namespace identifier and specific parts.

###### namespaceIdentifier?

`string`

The namespace identifier the urn must match.

###### namespaceSpecific?

`string` \| `string`[]

The namespace specific part(s) the urn must match.

#### Returns

`asserts value is string`

#### Throws

GuardError If the value does not match the assertion.

***

### validate() {#validate}

> `static` **validate**(`property`, `value`, `failures`, `fieldNameResource?`): `value is string`

Validate a string as a Urn.

#### Parameters

##### property

`string`

Throw an exception if the urn property is invalid.

##### value

`unknown`

The urn to parse.

##### failures

[`IValidationFailure`](../interfaces/IValidationFailure.md)[]

The list of failures to add to.

##### fieldNameResource?

`string`

The optional human readable name for the field as an i18 resource.

#### Returns

`value is string`

The formatted urn.

***

### parts() {#parts}

> **parts**(`startIndex?`): `string`[]

Get the parts.

#### Parameters

##### startIndex?

`number` = `0`

The index to start from, defaults to 0.

#### Returns

`string`[]

The parts.

***

### namespaceIdentifier() {#namespaceidentifier}

> **namespaceIdentifier**(): `string`

Get the namespace identifier.

#### Returns

`string`

The namespace identifier.

***

### namespaceMethod() {#namespacemethod}

> **namespaceMethod**(): `string`

Get the namespace method, the first component after the identifier.

#### Returns

`string`

The namespace method.

***

### namespaceSpecificParts() {#namespacespecificparts}

> **namespaceSpecificParts**(`startIndex?`, `count?`): `string`[]

Get the namespace specific parts.

#### Parameters

##### startIndex?

`number` = `0`

The index to start from, defaults to 0.

##### count?

`number`

The number of parts to return, defaults to all remaining parts.

#### Returns

`string`[]

The namespace specific parts.

***

### namespaceSpecific() {#namespacespecific}

> **namespaceSpecific**(`startIndex?`): `string`

Get the namespace specific.

#### Parameters

##### startIndex?

`number` = `0`

The index to start from, defaults to 0.

#### Returns

`string`

The namespace specific.

***

### toString() {#tostring}

> **toString**(`omitPrefix?`): `string`

Convert the parts in to a full string.

#### Parameters

##### omitPrefix?

`boolean` = `true`

Omit the urn: prefix from the string.

#### Returns

`string`

The formatted urn.
