# Configuration

The TypeScript compilation process reads the code from the .ts files and generates JavaScript .js from them.

This process is performed internally in the TypeScript compiler using a pipeline of transformers.

The transformer pipeline is not expose by the default `tsc` compiler, so for this reason we need to replace it's use in our compilation scripts with one that supports transformers.

## Native compiler

The package includes a `tstransform` command which compiles your project with the native TypeScript compiler, replacing the `nameof` calls as the source files are read. It accepts the same command line arguments as `tsc`, and does not need ts-patch or the `plugins` entry in `tsconfig.json`.

Modify your build scripts in `package.json`

```json
{
  "scripts": {
    "build": "tstransform",
    "test:build": "tstransform -p ./tests/tsconfig.json --noEmit"
  }
}
```

The same compilation is available from code using the `tsTransform` method, which returns the formatted diagnostics, or an empty string if the compilation succeeded.

```typescript
import { tsTransform } from '@3sixty/nameof-transformer';

const diagnostics = tsTransform(['-p', './tsconfig.json'], process.cwd());
```

## Transformer plugin

Add a transformer capable compiler.

```shell
npm install ts-patch -D
```

Modify your build script in `package.json`

```shell
{
    "scripts": {
        "prepare": "ts-patch install -s"
    }
}
```

Modify your `tsconfig.json` to use the transformer.

```json
{
    "compilerOptions": {
        ...
        "plugins": [
            { "transform": "@3sixty/nameof-transformer" }
        ]
    },
    ...
}
```
