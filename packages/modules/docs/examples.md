# Modules Examples

Use these snippets for dynamic module loading patterns at runtime extension points.

## ModuleHelper

```typescript
import { ModuleHelper } from '@3sixty/modules';

console.log(ModuleHelper.isRelativeModule('./workers/sendEmail.js')); // true
console.log(ModuleHelper.isLocalModule('./workers/sendEmail.js')); // true
console.log(ModuleHelper.isLocalModule('@3sixty/core')); // false
```

```typescript
import { ModuleHelper } from '@3sixty/modules';

const convertToFahrenheit = await ModuleHelper.getModuleMethod<(celsius: number) => number>(
  './workers/temperature.js',
  'convertToFahrenheit'
);

console.log(convertToFahrenheit(18)); // 64.4
```

```typescript
import { ModuleHelper } from '@3sixty/modules';

const sum = await ModuleHelper.getModuleEntry<(left: number, right: number) => number>(
  './workers/math.js',
  'sum'
);

console.log(sum(7, 5)); // 12
```

```typescript
import { ModuleHelper } from '@3sixty/modules';

const result = await ModuleHelper.execModuleMethod<number>(
  './workers/temperature.js',
  'convertToFahrenheit',
  [18]
);

console.log(result); // 64.4
```

```typescript
import { ModuleHelper } from '@3sixty/modules';

ModuleHelper.overrideImport(async moduleName => {
  if (moduleName === './workers/math.js') {
    return {
      module: {
        sum: (left: number, right: number) => left + right
      },
      useDefault: false
    };
  }

  return {
    useDefault: true
  };
});

const sum = await ModuleHelper.execModuleMethod<number>('./workers/math.js', 'sum', [3, 4]);

console.log(sum); // 7
```

```typescript
import { ModuleHelper } from '@3sixty/modules';

const threaded = await ModuleHelper.execModuleMethodThread<number>(
  './workers/temperature.js',
  'convertToFahrenheit',
  [18],
  {
    traceId: 'trc-01',
    spanId: 'spn-02'
  }
);

console.log(threaded); // 64.4
```

```typescript
import { ModuleHelper } from '@3sixty/modules';

// The worker starts with the native modules already registered on this thread
// via NativeModules.init().
const worker = ModuleHelper.execModuleMethodThreadMessage(
  './workers/temperature.js',
  (operation, result, err) => {
    if (err) {
      console.log(err.message); // resultError
      return;
    }

    if (operation === 'convertToFahrenheit') {
      console.log(result); // 64.4
    }
  },
  {
    threadName: 'temperature-worker'
  }
);

worker.executeMethod('convertToFahrenheit', [18]);
await worker.terminate();
```
