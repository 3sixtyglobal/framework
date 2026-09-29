# Interface: ICliOptions

Options for the CLI.

## Properties

### title {#title}

> **title**: `string`

The title of the CLI.

***

### appName {#appname}

> **appName**: `string`

The name of the app used to execute it.

***

### version {#version}

> **version**: `string`

The version of the app.

***

### icon {#icon}

> **icon**: `string`

The icon for the CLI as an emoji character.

***

### supportsLang? {#supportslang}

> `optional` **supportsLang?**: `boolean`

Supports different languages.

***

### supportsEnvFiles? {#supportsenvfiles}

> `optional` **supportsEnvFiles?**: `boolean`

Supports the loading of env files.

***

### overrideOutputWidth? {#overrideoutputwidth}

> `optional` **overrideOutputWidth?**: `number`

Override the default output width.

***

### showDevToolWarning? {#showdevtoolwarning}

> `optional` **showDevToolWarning?**: `boolean`

Show a warning that this is a dev tool and not for production use.

***

### noColor? {#nocolor}

> `optional` **noColor?**: `boolean`

Disable colourised output, so that all output is plain text with no ANSI
escape sequences, defaults to false which uses the colour support detected
from the environment.
