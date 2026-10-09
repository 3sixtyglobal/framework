# Validate Locales Usage

Use this page to confirm validation options before scanning source files.

## Running

To install and run the CLI locally use the following commands:

```shell
npm install @3sixty/validate-locales -g
validate-locales
```

or run directly using NPX:

```shell
npx "@3sixty/validate-locales"
```

## Help

```shell
validate-locales --help

Usage: validate-locales

Options:
  -V, --version        output the version number
  --source <glob>      Glob for the source files to check. (default: "src/**/*.ts")
  --locales <glob>     Glob for the locale files to check. (default: "locales/**/*.json")
  --ignoreFile <path>  File containing keys to ignore. (default: "locales/.validate-ignore")
  --lang <lang>        The language to display the output in. (default: "en")
  -h, --help           display help for command
```
