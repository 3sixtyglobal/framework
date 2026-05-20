# Context Examples

Use these snippets to keep trace identifiers consistent across asynchronous operations and service boundaries.

## ContextIdHelper

```typescript
import { ContextIdHelper } from '@twin.org/context';

const traceContext = {
  traceId: 'trc-0011223344556677',
  spanId: 'spn-9a8b7c6d5e4f3210'
};

ContextIdHelper.short(traceContext.traceId); // '0011223344556677'
ContextIdHelper.shortAll(traceContext); // { traceId: '0011223344556677', spanId: '9a8b7c6d5e4f3210' }
```

```typescript
import { ContextIdHelper } from '@twin.org/context';

const contextIds = {
  traceId: 'trace-1234',
  spanId: 'span-5678',
  requestId: 'req-90ab'
};

const combined = ContextIdHelper.shortCombined(contextIds); // '1234:5678:90ab'
ContextIdHelper.shortSplit(combined); // ['1234', '5678', '90ab']
```

## ContextIdStore

```typescript
import { ContextIdStore } from '@twin.org/context';

await ContextIdStore.run({ traceId: 'trc-01', spanId: 'spn-02' }, async () => {
  ContextIdStore.getContextIds(); // { traceId: 'trc-01', spanId: 'spn-02' }
});
```

## ContextIdHandlerFactory

```typescript
import { ContextIdHandlerFactory } from '@twin.org/context';
import type { IContextIdHandler } from '@twin.org/context';

class RequestContextHandler implements IContextIdHandler {
  public getContextIds() {
    return { traceId: 'trc-1001', spanId: 'spn-2002' };
  }
}

ContextIdHandlerFactory.register('request', () => new RequestContextHandler());
const handler = ContextIdHandlerFactory.create('request');
handler.getContextIds().traceId; // 'trc-1001'
```
