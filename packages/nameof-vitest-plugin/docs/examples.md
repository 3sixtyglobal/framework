# Nameof Vitest Plugin Examples

Use these snippets to enable compile-time name replacement during test execution so typed name helpers add no runtime overhead.

## nameOfPluginTransform

```typescript
import { nameOfPluginTransform } from '@3sixty/nameof-vitest-plugin';

const source = `
import { nameof } from '@3sixty/nameof';
class UserSession {}
const className = nameof<UserSession>();
`;

const transformed = nameOfPluginTransform(source, 'session.spec.ts');

transformed.includes("'UserSession'"); // true
```

## NameOfPlugin

```typescript
import { defineConfig } from 'vitest/config';
import { NameOfPlugin } from '@3sixty/nameof-vitest-plugin';

export default defineConfig({
  plugins: [NameOfPlugin],
  test: {
    include: ['tests/**/*.spec.ts']
  }
});
```
