# Modules Examples

These examples show dynamic module loading patterns for runtime extension points.

## ModuleHelper

```typescript
import { ModuleHelper } from '@twin.org/modules';

ModuleHelper.isRelativeModule('./workers/sendEmail.js'); // true
ModuleHelper.isLocalModule('file:///opt/app/plugins/exportCsv.js'); // true
```

```typescript
import { ModuleHelper } from '@twin.org/modules';

const result = await ModuleHelper.execModuleMethod(
  './workers/temperature.js',
  'convertToFahrenheit',
  [18]
);

result; // 64.4
```
