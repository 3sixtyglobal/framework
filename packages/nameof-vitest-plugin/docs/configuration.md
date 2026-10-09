# Configuration

When running vitest the default `esbuild` processing ignore any TypeScript transforms.

Instead we can include this plugin which will perform the same process as the TypeScript transformer.

In you vitest config include the following:

```js
import { NameOfPlugin } from "@3sixty/nameof-vitest-plugin";

export default defineConfig({
   ...
   plugins: [NameOfPlugin]
   ...
});
```
