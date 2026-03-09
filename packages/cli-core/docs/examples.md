# CLI Core Examples

Use these snippets to compose clear command line workflows with consistent output, argument parsing and file handling.

## CLIDisplay

```typescript
import { CLIDisplay } from '@twin.org/cli-core';

CLIDisplay.header('Data Import', '1.2.0');
CLIDisplay.section('Validation');
CLIDisplay.value('Records', 128);
CLIDisplay.warning('2 rows have missing optional fields');
CLIDisplay.done();
```

## CLIParam

```typescript
import { CLIParam } from '@twin.org/cli-core';

const parsedCount = CLIParam.integer('count', '25');
const parsedDebug = CLIParam.boolean('debug', 'true');
const parsedUrl = CLIParam.url('endpoint', 'https://api.example.org');

console.log(parsedCount + 1); // 26
console.log(parsedDebug); // true
console.log(parsedUrl.host); // api.example.org
```

## CLIBase

```typescript
import { CLIBase } from '@twin.org/cli-core';
import type { Command } from 'commander';

class ToolCli extends CLIBase {
  protected getCommands(program: Command): Command[] {
    return [program.command('status').action(() => {})];
  }
}

const cli = new ToolCli();
const exitCode = await cli.execute(
  {
    appName: 'tool-cli',
    title: 'Tool CLI',
    version: '1.0.0'
  },
  './locales',
  ['node', 'tool-cli', 'status']
);

console.log(exitCode); // 0
```

## CLIUtils

```typescript
import { CLIUtils } from '@twin.org/cli-core';

console.log(await CLIUtils.fileExists('./config/import.json')); // true
const config = await CLIUtils.readJsonFile<{ source: string }>('./config/import.json');
await CLIUtils.writeEnvFile('./dist/import.env', {
  SOURCE: config.source
});
console.log(config.source); // ./data/source.json
```

## CLIOptions

```typescript
import { CLIOptions } from '@twin.org/cli-core';

const options = new CLIOptions();

options.output({
  json: './dist/output.json'
});

console.log(options.toObject().json); // ./dist/output.json
```
