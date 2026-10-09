# 3Sixty Framework

This repository brings together shared libraries and practical command line tools that make it easier to build, validate, and maintain framework-based projects with a consistent developer experience. The packages focus on common concerns such as runtime helpers, data modelling, cryptography, media handling, and web-facing utilities.

Alongside those libraries, the workspace includes applications that support operational tasks like locale management and cryptographic workflows, so teams can apply the same standards and tooling patterns across multiple projects.

## Packages

- [nameof-transformer](packages/nameof-transformer/README.md) - Typed transformer which converts types and properties to their actual name for use at runtime.
- [nameof-vitest-plugin](packages/nameof-vitest-plugin/README.md) - Vitest plugin which perform the nameof transformation.
- [nameof](packages/nameof/README.md) - The definitions for the methods which are processed by the nameof-transformer.
- [core](packages/core/README.md) - Helper methods/classes for data type checking/validation/guarding/error handling.
- [cli-core](packages/cli-core/README.md) - Core classes for building a CLI.
- [entity](packages/entity/README.md) - Helpers for defining and working with entities.
- [crypto](packages/crypto/README.md) - Helper methods and classes which implement cryptographic functions.
- [image](packages/image/README.md) - Classes for image manipulation.
- [qr](packages/qr/README.md) - Creating QR codes.
- [web](packages/web/README.md) - Classes for use with web operations.
- [context](packages/context/README.md) - Helper methods/classes for context handling.
- [modules](packages/modules/README.md) - Helper classes for loading and executing from modules.

## Apps

- [merge-locales](apps/merge-locales/README.md) - Merge locale files from all dependencies.
- [validate-locales](apps/validate-locales/README.md) - Validate source files against the locales.
- [crypto-cli](apps/crypto-cli/README.md) - Command line interface for interacting with the crypto tools.

## Architecture

- [Codebase](docs/architecture/codebase.mdx) - Overview of the repository structure, package layering, and packaging model.
- [Codebase Philosophy](docs/architecture/codebase-philosophy.mdx) - Why standardised patterns such as factories, transformers, and lint guard rails are - [Development Workflow](docs/architecture/development-workflow.mdx) - Workspace scripts, local development patterns, and sibling repository linking.
- [TypeScript Transformers](docs/architecture/typescript-transformers.mdx) - Transformer pipeline, build integration, and runtime naming strategy.
- [i18n Support](docs/architecture/i18n-support.mdx) - Internationalisation support model, locale conventions, and runtime usage patterns.
- [Components](docs/architecture/components.mdx) - Domain component contracts, implementations, factories, and lifecycle behaviour.
- [Connectors](docs/architecture/connectors.mdx) - Connector interfaces, capability types, factory composition, and runtime integration.
- [Context IDs](docs/architecture/context-ids.mdx) - Context propagation, key derivation, short forms, and data partitioning rules.
- [Data Validation](docs/architecture/data-validation.mdx) - Validation architecture across type handlers, JSON Schema, JSON-LD, and schema generation tooling.
- [Engine](docs/architecture/engine.mdx) - Engine responsibilities, data model, initialisation pipeline, and lifecycle semantics.
  used to keep behaviour consistent across packages.

## Contributing

To contribute to this package see the guidelines for building and publishing in [CONTRIBUTING](./CONTRIBUTING.md)

## Origin

This repository is derived from the original [iotaledger/twin-framework](https://github.com/iotaledger/twin-framework) repository.
