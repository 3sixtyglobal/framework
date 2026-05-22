# Class: CLIDisplay

Display utilities for the CLI.

## Constructors

### Constructor

> **new CLIDisplay**(): `CLIDisplay`

#### Returns

`CLIDisplay`

## Properties

### write {#write}

> `static` **write**: (`buffer`) => `void`

The default output method for writing standard messages.

#### Parameters

##### buffer

`string` \| `Uint8Array`\<`ArrayBufferLike`\>

The message to output.

#### Returns

`void`

***

### writeError {#writeerror}

> `static` **writeError**: (`buffer`) => `void`

The default output method for writing error messages.

#### Parameters

##### buffer

`string` \| `Uint8Array`\<`ArrayBufferLike`\>

The message to output.

#### Returns

`void`

***

### clearLine {#clearline}

> `static` **clearLine**: () => `void`

The default output method for clearing the current line.

#### Returns

`void`

## Methods

### header() {#header}

> `static` **header**(`title`, `version`, `icon`): `void`

Display the header for the CLI.

#### Parameters

##### title

`string`

The title of the CLI.

##### version

`string`

The version of the CLI.

##### icon

`string`

The icon for the CLI.

#### Returns

`void`

***

### error() {#error}

> `static` **error**(`error`, `lineBreaks?`, `options?`): `void`

Display an error message.

#### Parameters

##### error

`unknown`

The error to display.

##### lineBreaks?

`boolean` = `true`

Whether to add a line break after the error.

##### options?

Options for formatting the error.

###### includeStack?

`boolean`

Whether to include the stack trace in the output, defaults to false.

###### includeAdditional?

`boolean`

Whether to include additional error information in the output, defaults to false.

#### Returns

`void`

***

### errorMessage() {#errormessage}

> `static` **errorMessage**(`error`): `void`

Display an error message in simple form.

#### Parameters

##### error

`string`

The error to display.

#### Returns

`void`

***

### section() {#section}

> `static` **section**(`label`): `void`

Display a section.

#### Parameters

##### label

`string`

The label for the section.

#### Returns

`void`

***

### value() {#value}

> `static` **value**(`label`, `value`, `indentLevel?`): `void`

Display a value with a label.

#### Parameters

##### label

`string`

The label for the value.

##### value

`unknown`

The value to display.

##### indentLevel?

`number` = `0`

The level of indentation.

#### Returns

`void`

***

### task() {#task}

> `static` **task**(`label`, `task?`): `void`

Display a task with a label.

#### Parameters

##### label

`string`

The label for the value.

##### task?

`string`

The task to display.

#### Returns

`void`

***

### break() {#break}

> `static` **break**(): `void`

Display a break.

#### Returns

`void`

***

### json() {#json}

> `static` **json**(`obj`): `void`

Display formatted and colorized JSON.

#### Parameters

##### obj

`unknown`

The object to display.

#### Returns

`void`

***

### warning() {#warning}

> `static` **warning**(`label`): `void`

Display a warning.

#### Parameters

##### label

`string`

The label for the warning.

#### Returns

`void`

***

### done() {#done}

> `static` **done**(): `void`

Display the processing is done.

#### Returns

`void`

***

### spinnerStart() {#spinnerstart}

> `static` **spinnerStart**(`i18nMessage?`, `spinnerCharacters?`, `interval?`): `void`

Start the spinner.

#### Parameters

##### i18nMessage?

`string` = `"cli.progress.pleaseWait"`

The message to display with the spinner.

##### spinnerCharacters?

`string`[] = `...`

The characters to use in the spinner.

##### interval?

`number` = `100`

The interval for the spinner.

#### Returns

`void`

***

### spinnerStop() {#spinnerstop}

> `static` **spinnerStop**(): `void`

Stop the spinner.

#### Returns

`void`
