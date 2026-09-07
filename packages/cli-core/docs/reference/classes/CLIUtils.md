# Class: CLIUtils

Utilities function for helping in the CLI.

## Constructors

### Constructor

> **new CLIUtils**(): `CLIUtils`

#### Returns

`CLIUtils`

## Methods

### fileExists() {#fileexists}

> `static` **fileExists**(`filename`): `Promise`\<`boolean`\>

Does the specified file exist.

#### Parameters

##### filename

`string`

The filename to check for existence.

#### Returns

`Promise`\<`boolean`\>

True if the file exists.

***

### fileExistsSync() {#fileexistssync}

> `static` **fileExistsSync**(`filename`): `boolean`

Does the specified file exist, synchronously.

#### Parameters

##### filename

`string`

The filename to check for existence.

#### Returns

`boolean`

True if the file exists.

***

### dirExists() {#direxists}

> `static` **dirExists**(`dir`): `Promise`\<`boolean`\>

Check if the dir exists.

#### Parameters

##### dir

`string`

The directory to check.

#### Returns

`Promise`\<`boolean`\>

True if the dir exists.

***

### dirExistsSync() {#direxistssync}

> `static` **dirExistsSync**(`dir`): `boolean`

Check if the dir exists, synchronously.

#### Parameters

##### dir

`string`

The directory to check.

#### Returns

`boolean`

True if the dir exists.

***

### readJsonFile() {#readjsonfile}

> `static` **readJsonFile**\<`T`\>(`filename`): `Promise`\<`T` \| `undefined`\>

Read a JSON file and parse it.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### filename

`string`

The filename to read.

#### Returns

`Promise`\<`T` \| `undefined`\>

The parsed JSON.

***

### readJsonFileSync() {#readjsonfilesync}

> `static` **readJsonFileSync**\<`T`\>(`filename`): `T` \| `undefined`

Read a JSON file and parse it, synchronously.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### filename

`string`

The filename to read.

#### Returns

`T` \| `undefined`

The parsed JSON.

***

### readLinesFile() {#readlinesfile}

> `static` **readLinesFile**(`filename`): `Promise`\<`string`[] \| `undefined`\>

Read a file as lines.

#### Parameters

##### filename

`string`

The filename to read.

#### Returns

`Promise`\<`string`[] \| `undefined`\>

The lines.

***

### readLinesFileSync() {#readlinesfilesync}

> `static` **readLinesFileSync**(`filename`): `string`[] \| `undefined`

Read a file as lines, synchronously.

#### Parameters

##### filename

`string`

The filename to read.

#### Returns

`string`[] \| `undefined`

The lines.

***

### findPackageRoot() {#findpackageroot}

> `static` **findPackageRoot**(`packageName`, `startFolder`): `Promise`\<`string` \| `undefined`\>

Find the root folder of a package by walking up the directory tree looking in the
node_modules folders, this supports package managers which do not install a flat structure.

#### Parameters

##### packageName

`string`

The name of the package to locate.

##### startFolder

`string`

The folder to start the search from.

#### Returns

`Promise`\<`string` \| `undefined`\>

The resolved root folder of the package, or undefined if it could not be located.

***

### runShellCmd() {#runshellcmd}

> `static` **runShellCmd**(`command`, `args`, `cwd`): `Promise`\<`void`\>

Run a shell command.

#### Parameters

##### command

`string`

The app to run in the shell.

##### args

`string`[]

The args for the app.

##### cwd

`string`

The working directory to execute the command in.

#### Returns

`Promise`\<`void`\>

Promise to wait for command execution to complete.

***

### runShellApp() {#runshellapp}

> `static` **runShellApp**(`app`, `args`, `cwd`): `Promise`\<`void`\>

Run a shell app.

#### Parameters

##### app

`string`

The app to run in the shell.

##### args

`string`[]

The args for the app.

##### cwd

`string`

The working directory to execute the command in.

#### Returns

`Promise`\<`void`\>

Promise to wait for command execution to complete.

***

### writeJsonFile() {#writejsonfile}

> `static` **writeJsonFile**\<`T`\>(`jsonFilename`, `data`, `append`): `Promise`\<`void`\>

Write a JSON file.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### jsonFilename

`string` \| `undefined`

The filename to write.

##### data

`T`

The data to write.

##### append

`boolean`

Append to the file.

#### Returns

`Promise`\<`void`\>

***

### writeEnvFile() {#writeenvfile}

> `static` **writeEnvFile**(`envFilename`, `data`, `append`): `Promise`\<`void`\>

Write an env file.

#### Parameters

##### envFilename

`string` \| `undefined`

The filename to write.

##### data

`string`[]

The data to write.

##### append

`boolean`

Append to the file.

#### Returns

`Promise`\<`void`\>
