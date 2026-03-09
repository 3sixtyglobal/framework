# CLI Core Examples

These examples show reusable building blocks for command line tools, including output formatting, option parsing and shell execution.

## CLIDisplay

```typescript
import { CLIDisplay } from '@twin.org/cli-core';

CLIDisplay.header('Data Import', '1.2.0');
CLIDisplay.section('Validation');
CLIDisplay.value('Records', 128);
CLIDisplay.warning('2 rows have missing optional fields');
CLIDisplay.done();
```

## CLIUtils

```typescript
import { CLIUtils } from '@twin.org/cli-core';

await CLIUtils.fileExists('./config/import.json'); // true
const config = await CLIUtils.readJsonFile<{ source: string }>('./config/import.json');
await CLIUtils.writeEnvFile('./dist/import.env', {
  SOURCE: config.source
});
```

## CLIParam

```typescript
import { CLIParam } from '@twin.org/cli-core';

const parsedCount = CLIParam.integer('count', '25');
const parsedDebug = CLIParam.boolean('debug', 'true');
const parsedUrl = CLIParam.url('endpoint', 'https://api.example.org');

parsedCount + 1; // 26
parsedDebug; // true
parsedUrl.host; // 'api.example.org'
```

## CLIBase

```typescript
import { CLIBase } from '@twin.org/cli-core';

class ToolCli extends CLIBase {
  protected configureRoot(): void {
    this.root.name('tool-cli');
  }
}

const cli = new ToolCli();
await cli.execute(['node', 'tool-cli', '--help']);
```

## CLIOptions

```typescript
import { CLIOptions } from '@twin.org/cli-core';

const options = new CLIOptions();

options.output({
  json: './dist/output.json'
});
```
