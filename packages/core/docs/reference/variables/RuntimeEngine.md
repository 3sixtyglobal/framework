# Variable: RuntimeEngine

> `const` **RuntimeEngine**: `object`

The JavaScript runtime engines that can be detected.

## Type Declaration

### Node {#node}

> `readonly` **Node**: `"node"` = `"node"`

Node.js.

### Bun {#bun}

> `readonly` **Bun**: `"bun"` = `"bun"`

Bun.

### Deno {#deno}

> `readonly` **Deno**: `"deno"` = `"deno"`

Deno.

### Workerd {#workerd}

> `readonly` **Workerd**: `"workerd"` = `"workerd"`

Cloudflare Workers.

### Browser {#browser}

> `readonly` **Browser**: `"browser"` = `"browser"`

A browser window.

### WebWorker {#webworker}

> `readonly` **WebWorker**: `"webWorker"` = `"webWorker"`

A web worker.

### Unknown {#unknown}

> `readonly` **Unknown**: `"unknown"` = `"unknown"`

A runtime that could not be identified.
