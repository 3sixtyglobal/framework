# Function: tsTransform()

> **tsTransform**(`args`, `cwd`): `Promise`\<`string`\>

Compile a project with the native TypeScript compiler, replacing the nameof calls
in the source files as they are read through a virtual file system. Uses the async
API as the sync API relies on Node internal pipe handles that other runtimes lack.

## Parameters

### args

`string`[]

The tsc command line arguments.

### cwd

`string`

The working directory containing the project.

## Returns

`Promise`\<`string`\>

The diagnostics output, empty if the compilation succeeded.
