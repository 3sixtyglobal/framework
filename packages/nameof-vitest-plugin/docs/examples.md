# Nameof Vitest Plugin Examples

These examples show how to enable compile-time name replacement during test execution so test code can use typed name helpers without runtime overhead.

## nameOfPluginTransform

```typescript
import { nameOfPluginTransform } from '@twin.org/nameof-vitest-plugin';

const source = `
import { nameof } from '@twin.org/nameof';
class UserSession {}
const className = nameof<UserSession>();
`;

const transformed = nameOfPluginTransform(source, 'session.spec.ts');

transformed.includes("'UserSession'"); // true
```

## NameOfPlugin

```typescript
import { defineConfig } from 'vitest/config';
import { NameOfPlugin } from '@twin.org/nameof-vitest-plugin';

export default defineConfig({
  plugins: [NameOfPlugin],
  test: {
    include: ['tests/**/*.spec.ts']
  }
});
```
