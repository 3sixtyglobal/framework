# Function: tsTransform()

> **tsTransform**(`args`, `cwd`): `string`

Compile a project with the native TypeScript compiler, replacing the nameof calls
in the source files as they are read through a virtual file system.

## Parameters

### args

`string`[]

The tsc command line arguments.

### cwd

`string`

The working directory containing the project.

## Returns

`string`

The diagnostics output, empty if the compilation succeeded.
