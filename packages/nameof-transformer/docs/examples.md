# Nameof Transformer Examples

These examples show how to apply source transforms before compile and test steps so strongly typed name expressions are converted into static strings.

## factory

```typescript
import { factory, name, version } from '@twin.org/nameof-transformer';
import ts from 'typescript';

const source = `
import { nameof } from '@twin.org/nameof';
class Demo {}
const value = nameof<Demo>();
`;

const result = ts.transpileModule(source, {
  transformers: {
    before: [factory()]
  },
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022
  }
});

name; // '@twin.org/nameof-transformer'
version; // current package version
result.outputText.includes("'Demo'"); // true
```

## manual

```typescript
import { manual } from '@twin.org/nameof-transformer';

const source = `
import { nameof } from '@twin.org/nameof';

interface Customer {
  profile?: {
    displayName: string;
  };
}

const className = nameof<Customer>();
const propName = nameof(({ profile }: Customer) => profile?.displayName);
`;

const transformed = manual(source);

transformed.includes("'Customer'"); // true
transformed.includes("'profile.displayName'"); // true
```

## svelte

```typescript
import { svelte } from '@twin.org/nameof-transformer';

const transformed = svelte(`
  <script lang=\"ts\">
    import { nameof } from '@twin.org/nameof';
    class Widget {}
    const value = nameof<Widget>();
  </script>
`);

transformed.includes("'Widget'"); // true
```
