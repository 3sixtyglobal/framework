# TWIN Framework

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

## Contributing

To contribute to this package see the guidelines for building and publishing in [CONTRIBUTING](./CONTRIBUTING.md)
