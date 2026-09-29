# Class: ModuleResolutionHelper

Helper functions for resolving modules to files, the platform modules are accessed through
NativeModules and are registered by initNativeModules().

## Constructors

### Constructor

> **new ModuleResolutionHelper**(): `ModuleResolutionHelper`

#### Returns

`ModuleResolutionHelper`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

***

### NATIVE\_MODULES {#native_modules}

> `readonly` `static` **NATIVE\_MODULES**: `string`[]

The native modules which must be registered with NativeModules.init() for resolution.

## Methods

### initNativeModules() {#initnativemodules}

> `static` **initNativeModules**(): `Promise`\<`void`\>

Register any of the native modules needed for resolution which are not already registered,
this only runs once, modules which fail to load (e.g. in a browser) leave resolution disabled.

#### Returns

`Promise`\<`void`\>

A promise that resolves when registration has been attempted.

***

### getDefaultOptions() {#getdefaultoptions}

> `static` **getDefaultOptions**(`moduleName`): [`IModuleHelperOptions`](../interfaces/IModuleHelperOptions.md) \| `undefined`

Get the options to use when none have been set, local and package modules are resolved from
the working directory, npm: and https: modules need options to be set as they install or download code.

#### Parameters

##### moduleName

`string`

The module name.

#### Returns

[`IModuleHelperOptions`](../interfaces/IModuleHelperOptions.md) \| `undefined`

The default options, or undefined if the module can not be resolved without options.

***

### parseModuleProtocol() {#parsemoduleprotocol}

> `static` **parseModuleProtocol**(`moduleName`): [`IModuleProtocol`](../interfaces/IModuleProtocol.md)

Parse the protocol from a module name.

#### Parameters

##### moduleName

`string`

The module name to parse.

#### Returns

[`IModuleProtocol`](../interfaces/IModuleProtocol.md)

The parsed protocol information.

***

### resolveModulePath() {#resolvemodulepath}

> `static` **resolveModulePath**(`moduleName`, `options`, `dependencyRootCache?`): `Promise`\<`string` \| `undefined`\>

Resolve a module name to a file path.

#### Parameters

##### moduleName

`string`

The module name.

##### options

[`IModuleHelperOptions`](../interfaces/IModuleHelperOptions.md)

The module resolution options.

##### dependencyRootCache?

`Map`\<`string`, `string` \| `undefined`\>

Cache of dependency tree searches, including misses.

#### Returns

`Promise`\<`string` \| `undefined`\>

The resolved file path, or undefined if it could not be resolved.

#### Throws

GeneralError if the module uses an insecure protocol or a native module is not registered.

***

### hashUrl() {#hashurl}

> `static` **hashUrl**(`url`): `string`

Hash a URL to create a safe filename.

#### Parameters

##### url

`string`

The URL to hash.

#### Returns

`string`

A hashed filename safe for the filesystem.

***

### getCacheDirectory() {#getcachedirectory}

> `static` **getCacheDirectory**(`executionDirectory`, `protocol`, `cacheDirectory?`): `string`

Get the cache directory for a protocol.

#### Parameters

##### executionDirectory

`string`

The execution directory.

##### protocol

[`ModuleProtocol`](../type-aliases/ModuleProtocol.md)

The protocol type for subdirectory organisation.

##### cacheDirectory?

`string`

The cache directory base path.

#### Returns

`string`

The cache directory path.

***

### handleNpmProtocol() {#handlenpmprotocol}

> `static` **handleNpmProtocol**(`packageName`, `options`): `Promise`\<[`IProtocolHandlerResult`](../interfaces/IProtocolHandlerResult.md)\>

Handle the npm: protocol by installing the package if needed.

#### Parameters

##### packageName

`string`

The npm package name without the npm: prefix.

##### options

[`IModuleHelperOptions`](../interfaces/IModuleHelperOptions.md)

The module resolution options.

#### Returns

`Promise`\<[`IProtocolHandlerResult`](../interfaces/IProtocolHandlerResult.md)\>

The resolved path to the installed module.

#### Throws

GeneralError if the package could not be installed.

***

### isCacheExpired() {#iscacheexpired}

> `static` **isCacheExpired**(`metadataPath`, `ttlHours`, `forceRefresh`): `Promise`\<`boolean`\>

Check if a cached file has expired based on TTL and force refresh settings.

#### Parameters

##### metadataPath

`string`

Path to the cache metadata file.

##### ttlHours

`number`

Time to live in hours.

##### forceRefresh

`boolean`

Whether to force refresh regardless of TTL.

#### Returns

`Promise`\<`boolean`\>

True if the cache is expired or should be refreshed.

***

### handleHttpsProtocol() {#handlehttpsprotocol}

> `static` **handleHttpsProtocol**(`url`, `options`): `Promise`\<[`IProtocolHandlerResult`](../interfaces/IProtocolHandlerResult.md)\>

Handle the https: protocol by downloading the module if needed.

#### Parameters

##### url

`string`

The HTTPS URL to download from.

##### options

[`IModuleHelperOptions`](../interfaces/IModuleHelperOptions.md)

The module resolution options.

#### Returns

`Promise`\<[`IProtocolHandlerResult`](../interfaces/IProtocolHandlerResult.md)\>

The resolved path to the downloaded module.

#### Throws

GeneralError if the download failed.

***

### resolvePackageEntryPoint() {#resolvepackageentrypoint}

> `static` **resolvePackageEntryPoint**(`packagePath`, `packageName`, `fallback?`): `Promise`\<`string`\>

Resolve the main entry point from a package directory.

#### Parameters

##### packagePath

`string`

The absolute path to the package directory.

##### packageName

`string`

The package name.

##### fallback?

`string` = `"index.js"`

The fallback file name if no entry point is found.

#### Returns

`Promise`\<`string`\>

The resolved entry point file name relative to the package directory.

***

### findPackageRoot() {#findpackageroot}

> `static` **findPackageRoot**(`packageName`, `startFolder`): `Promise`\<`string` \| `undefined`\>

Find the root folder of a package by walking up the node_modules folders from a start folder.

#### Parameters

##### packageName

`string`

The name of the package to locate.

##### startFolder

`string`

The folder to start the search from.

#### Returns

`Promise`\<`string` \| `undefined`\>

The real path of the package root folder, or undefined if it was not found.

***

### findDependencyPackageRoot() {#finddependencypackageroot}

> `static` **findDependencyPackageRoot**(`packageName`, `startFolder`): `Promise`\<`string` \| `undefined`\>

Find the root folder of a package anywhere in the dependency tree of a folder, this locates
packages which are only reachable from a nested dependency when the package manager does not hoist them.

#### Parameters

##### packageName

`string`

The name of the package to locate.

##### startFolder

`string`

The folder to start the search from, the nearest folder at or above it with a package.json is used.

#### Returns

`Promise`\<`string` \| `undefined`\>

The resolved root folder of the package, or undefined if it is not in the dependency tree.

***

### findPnpmHoistedPackageRoot() {#findpnpmhoistedpackageroot}

> `static` **findPnpmHoistedPackageRoot**(`packageName`, `startFolder`): `Promise`\<`string` \| `undefined`\>

Find a package in the pnpm virtual store hoisted folder (node_modules/.pnpm/node_modules) by walking
up from a start folder, this is where a bare import from an installed package finds undeclared dependencies.

#### Parameters

##### packageName

`string`

The name of the package to locate.

##### startFolder

`string`

The folder to start the search from.

#### Returns

`Promise`\<`string` \| `undefined`\>

The real path of the package root folder, or undefined if it was not found.

***

### createModuleImportUrl() {#createmoduleimporturl}

> `static` **createModuleImportUrl**(`filePath`): `string`

Convert a file path to an import compatible URL, adding the file:// prefix on Windows.

#### Parameters

##### filePath

`string`

The absolute file path to convert.

#### Returns

`string`

A URL string compatible with dynamic import().
