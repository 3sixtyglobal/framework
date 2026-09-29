# Abstract Class: CLIBase

The main entry point for the CLI.

## Constructors

### Constructor

> **new CLIBase**(): `CLIBase`

#### Returns

`CLIBase`

## Methods

### execute() {#execute}

> **execute**(`options`, `localesDirectory`, `argv`): `Promise`\<`number`\>

Execute the command line processing.

#### Parameters

##### options

[`ICliOptions`](../interfaces/ICliOptions.md)

The options for the CLI.

##### localesDirectory

`string` \| `string`[]

The locales to load, each entry is either a path to a locales
directory or the name of an installed package to take the locales from. Entries are
merged in order, so later entries override earlier ones.

##### argv

`string`[]

The process arguments.

#### Returns

`Promise`\<`number`\>

The exit code.

***

### configureRoot() {#configureroot}

> `protected` **configureRoot**(`program`): `void`

Configure any options or actions at the root program level.

#### Parameters

##### program

`Command`

The root program command.

#### Returns

`void`

***

### getCommands() {#getcommands}

> `protected` **getCommands**(`program`): `Command`[]

Get the commands for the CLI, override in derived class to supply your own.

#### Parameters

##### program

`Command`

The main program that the commands will be added to.

#### Returns

`Command`[]

The commands for the CLI.
