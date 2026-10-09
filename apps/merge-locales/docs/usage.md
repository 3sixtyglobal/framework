# Merge Locales Usage

Use this page to check available options before combining locale files from dependencies.

## Running

To install and run the CLI locally use the following commands:

```shell
npm install @3sixty/merge-locales -g
merge-locales
```

or run directly using NPX:

```shell
npx "@3sixty/merge-locales"
```

## Help

```shell
merge-locales --help

Usage: merge-locales [options]

Options:
  --cwd <path>              Current working directory to scan. (default: ".")
  --package-json <path>     Path to the package json file. (default: "package.json")
  --output <path>           Output path for the merged locale file. (default: "./dist/locales/en.json")
  --input-glob <glob>       Glob for locale files in dependencies. (default: "**/locales/en.json")
  --override-existing       Override existing keys with later matches.
  --lang <lang>             The language to display the output in. (default: "en")
  -h, --help                display help for command
```
