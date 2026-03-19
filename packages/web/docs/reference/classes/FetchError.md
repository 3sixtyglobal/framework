# Class: FetchError

Class to represent errors from fetch.

## Extends

- `BaseError`

## Constructors

### Constructor

> **new FetchError**(`source`, `message`, `httpStatus`, `properties?`, `cause?`): `FetchError`

Create a new instance of FetchError.

#### Parameters

##### source

`string`

The source of the error.

##### message

`string`

The message as a code.

##### httpStatus

[`HttpStatusCode`](../type-aliases/HttpStatusCode.md)

The http status code.

##### properties?

Any additional information for the error.

##### cause?

`unknown`

The cause of the error if we have wrapped another error.

#### Returns

`FetchError`

#### Overrides

`BaseError.constructor`

## Properties

### source? {#source}

> `optional` **source?**: `string`

The source of the error.

#### Inherited from

`BaseError.source`

***

### properties? {#properties}

> `optional` **properties?**: `object`

Any additional information for the error.

#### Index Signature

\[`id`: `string`\]: `unknown`

#### Inherited from

`BaseError.properties`

***

### cause? {#cause}

> `optional` **cause?**: `IError`

The cause of the error.

#### Inherited from

`BaseError.cause`

***

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### fromError() {#fromerror}

> `static` **fromError**(`err`): `BaseError`

Construct an error from an existing one.

#### Parameters

##### err

`unknown`

The existing error.

#### Returns

`BaseError`

The new instance.

#### Inherited from

`BaseError.fromError`

***

### flatten() {#flatten}

> `static` **flatten**(`err`): `IError`[]

Flatten an error tree.

#### Parameters

##### err

`unknown`

The starting error.

#### Returns

`IError`[]

The list of all internal errors.

#### Inherited from

`BaseError.flatten`

***

### expand() {#expand}

> `static` **expand**(`errors`): `IError` \| `undefined`

Expand an error tree.

#### Parameters

##### errors

`IError`[] \| `undefined`

The list of errors to expand.

#### Returns

`IError` \| `undefined`

The first level error.

#### Inherited from

`BaseError.expand`

***

### isErrorName() {#iserrorname}

> `static` **isErrorName**(`error`, `name`): `error is BaseError`

Test to see if the error has the specified error name.

#### Parameters

##### error

`unknown`

The error to test.

##### name

`string` \| `RegExp`

The name to check for.

#### Returns

`error is BaseError`

True if the error has the name.

#### Inherited from

`BaseError.isErrorName`

***

### isErrorMessage() {#iserrormessage}

> `static` **isErrorMessage**(`error`, `message`): `error is BaseError`

Test to see if the error has the specified error message.

#### Parameters

##### error

`unknown`

The error to test.

##### message

`string` \| `RegExp`

The message to check for.

#### Returns

`error is BaseError`

True if the error has the name.

#### Inherited from

`BaseError.isErrorMessage`

***

### isErrorCode() {#iserrorcode}

> `static` **isErrorCode**(`error`, `code`): `boolean`

Test to see if the error has the specified error code.

#### Parameters

##### error

`unknown`

The error to test.

##### code

`string` \| `RegExp`

The code to check for.

#### Returns

`boolean`

True if the error has the code.

#### Inherited from

`BaseError.isErrorCode`

***

### someErrorName() {#someerrorname}

> `static` **someErrorName**(`error`, `name`): `error is BaseError`

Test to see if any of the errors or children have the given error name.

#### Parameters

##### error

`unknown`

The error to test.

##### name

`string` \| `RegExp`

The name to check for.

#### Returns

`error is BaseError`

True if the error has the name.

#### Inherited from

`BaseError.someErrorName`

***

### someErrorMessage() {#someerrormessage}

> `static` **someErrorMessage**(`error`, `message`): `error is BaseError`

Test to see if any of the errors or children have the given error message.

#### Parameters

##### error

`unknown`

The error to test.

##### message

`string` \| `RegExp`

The message to check for.

#### Returns

`error is BaseError`

True if the error has the name.

#### Inherited from

`BaseError.someErrorMessage`

***

### someErrorClass() {#someerrorclass}

> `static` **someErrorClass**(`error`, `cls`): `error is BaseError`

Test to see if any of the errors or children are from a specific class.

#### Parameters

##### error

`unknown`

The error to test.

##### cls

`string`

The class to check for.

#### Returns

`error is BaseError`

True if the error has the specific class.

#### Inherited from

`BaseError.someErrorClass`

***

### someErrorCode() {#someerrorcode}

> `static` **someErrorCode**(`error`, `code`): `error is BaseError`

Test to see if any of the errors or children have the given error code.

#### Parameters

##### error

`unknown`

The error to test.

##### code

`string` \| `RegExp`

The code to check for.

#### Returns

`error is BaseError`

True if the error has the name.

#### Inherited from

`BaseError.someErrorCode`

***

### isEmpty() {#isempty}

> `static` **isEmpty**(`err`): `boolean`

Is the error empty, i.e. does it have no message, source, properties, or cause?

#### Parameters

##### err

`IError`

The error to check for being empty.

#### Returns

`boolean`

True if the error is empty.

#### Inherited from

`BaseError.isEmpty`

***

### isAggregateError() {#isaggregateerror}

> `static` **isAggregateError**(`err`): `err is AggregateError`

Is the error an aggregate error.

#### Parameters

##### err

`unknown`

The error to check for being an aggregate error.

#### Returns

`err is AggregateError`

True if the error is an aggregate error.

#### Inherited from

`BaseError.isAggregateError`

***

### fromAggregate() {#fromaggregate}

> `static` **fromAggregate**(`err`, `includeStackTrace?`): `IError`[]

Convert the aggregate error to an array of errors.

#### Parameters

##### err

`unknown`

The error to convert.

##### includeStackTrace?

`boolean`

Whether to include the error stack in the model, defaults to false.

#### Returns

`IError`[]

The array of errors.

#### Inherited from

`BaseError.fromAggregate`

***

### toJsonObject() {#tojsonobject}

> **toJsonObject**(`includeStackTrace?`): `IError`

Serialize the error to the error model.

#### Parameters

##### includeStackTrace?

`boolean`

Whether to include the error stack in the model, defaults to false.

#### Returns

`IError`

The error model.

#### Inherited from

`BaseError.toJsonObject`
