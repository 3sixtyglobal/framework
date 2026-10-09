# Nameof Transformer Examples

Use these snippets to apply source transforms before compile and test steps so typed name expressions become static strings.

## factory

```typescript
import { factory, name, version } from '@3sixty/nameof-transformer';
import ts from 'typescript';

const source = `
import { nameof } from '@3sixty/nameof';
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

name; // '@3sixty/nameof-transformer'
version; // current package version
result.outputText.includes("'Demo'"); // true
```

## manual

```typescript
import { manual } from '@3sixty/nameof-transformer';

const source = `
import { nameof } from '@3sixty/nameof';

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
import { svelte } from '@3sixty/nameof-transformer';

const transformed = svelte(`
  <script lang=\"ts\">
    import { nameof } from '@3sixty/nameof';
    class Widget {}
    const value = nameof<Widget>();
  </script>
`);

transformed.includes("'Widget'"); // true
```
