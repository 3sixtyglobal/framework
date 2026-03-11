# Validate Locales Usage

Use this page to confirm validation options before scanning source files.

## Running

To install and run the CLI locally use the following commands:

```shell
npm install @twin.org/validate-locales -g
validate-locales
```

or run directly using NPX:

```shell
npx "@twin.org/validate-locales"
```

## Help

```shell
validate-locales --help

Usage: validate-locales [options]

Options:
  --cwd <path>                      Current working directory to scan. (default: ".")
  --source-glob <glob>              Glob for source files to validate.
  --locale-file <path>              Locale dictionary file to validate against.
  --ignore-key-pattern <pattern>    Regex pattern for keys to ignore.
  --report-unused                   Include unused locale keys in the report.
  --lang <lang>                     The language to display the output in. (default: "en")
  -h, --help                        display help for command
```
