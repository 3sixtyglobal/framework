# Interface: IMergeLocalesConfig

Configuration for the CLI.

## Properties

### locales? {#locales}

> `optional` **locales**: `ILocale`[]

The languages to include while merging, if none are supplied only English will be included.

***

### includePackages? {#includepackages}

> `optional` **includePackages**: `string`[]

Additional packages to add locales for, which are not part of the dependencies.

***

### excludePackages? {#excludepackages}

> `optional` **excludePackages**: `string`[]

Packages to exclude from the locales.

***

### outputDirectory? {#outputdirectory}

> `optional` **outputDirectory**: `string`

Output directory for the merged locales.
