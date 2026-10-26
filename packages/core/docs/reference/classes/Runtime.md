# Class: Runtime

Detect the JavaScript runtime the code is executing in.

## Constructors

### Constructor

> **new Runtime**(): `Runtime`

#### Returns

`Runtime`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### engine() {#engine}

> `static` **engine**(): [`RuntimeEngine`](../type-aliases/RuntimeEngine.md)

Get the runtime engine. Bun, Deno and Cloudflare Workers are checked before Node
as they all provide a Node compatible process global.

#### Returns

[`RuntimeEngine`](../type-aliases/RuntimeEngine.md)

The runtime engine.

***

### version() {#version}

> `static` **version**(): `string`

Get the version of the runtime engine.

#### Returns

`string`

The version, the user agent for browsers and workers, or an empty string if unknown.

***

### os() {#os}

> `static` **os**(): [`RuntimeOs`](../type-aliases/RuntimeOs.md)

Get the operating system.

#### Returns

[`RuntimeOs`](../type-aliases/RuntimeOs.md)

The operating system.
