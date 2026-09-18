# Core Examples

Use these snippets to validate input, transform data and handle errors consistently in shared runtime code.

## Is

```typescript
import { Is } from '@twin.org/core';

console.log(Is.string('alpha')); // true
console.log(Is.number(42)); // true
console.log(Is.array(['a', 'b'])); // true
console.log(Is.objectValue({ id: 'u-1' })); // true
console.log(Is.boolean(false)); // true
console.log(Is.json('{"ok":true}')); // true
console.log(Is.email('dev@example.org')); // true
console.log(Is.dateTimeString('2026-03-09T11:32:00Z')); // true
console.log(Is.stringHex('aabbccdd')); // true
console.log(Is.uuidV7('019531ce-6f7d-7c08-a6f3-f6f7cf9f41b0')); // true
```

## Guards

```typescript
import { Guards } from '@twin.org/core';
import { nameof } from '@twin.org/nameof';

const name = 'Ari';
const profile = {
  age: 31,
  active: true
};
const createdAt = new Date('2026-03-09T10:00:00.000Z');

Guards.stringValue(this.CLASS_NAME, nameof(name), name);
Guards.objectValue(this.CLASS_NAME, nameof(profile), profile);
Guards.integer(this.CLASS_NAME, nameof(profile.age), profile.age);
Guards.boolean(this.CLASS_NAME, nameof(profile.active), profile.active);
Guards.date(this.CLASS_NAME, nameof(createdAt), createdAt);

console.log(name.toUpperCase()); // ARI
console.log(profile.age + 1); // 32

const amount = 'ten';

try {
  Guards.number(this.CLASS_NAME, nameof(amount), amount);
} catch (error) {
  if (error instanceof GuardError) {
    console.log(error.message); // guard.number
  }
}
```

## Validation

```typescript
import type { IValidationFailure } from '@twin.org/core';
import { Validation } from '@twin.org/core';

const failures: IValidationFailure[] = [];

Validation.stringValue('customer.name', 'Ari', failures, undefined, {
  minLength: 2,
  maxLength: 30
});
Validation.integer('customer.age', 31, failures, undefined, {
  minValue: 18,
  maxValue: 120
});
Validation.email('customer.email', 'customer@example.org', failures);

console.log(failures.length); // 0
```

## ObjectHelper

```typescript
import { ObjectHelper } from '@twin.org/core';

const source = {
  id: 'u-01',
  profile: {
    givenName: 'Ari'
  },
  tags: ['admin']
};

ObjectHelper.propertyGet(source, 'profile.givenName'); // 'Ari'
ObjectHelper.pick(source, ['id', 'tags']); // { id: 'u-01', tags: ['admin'] }
ObjectHelper.clone(source).id; // 'u-01'
```

## Converter

```typescript
import { Converter } from '@twin.org/core';

const bytes = Converter.utf8ToBytes('twin');
Converter.bytesToHex(bytes); // '7477696e'
Converter.bytesToBase64Url(bytes); // 'dHdpbg'
```

## Coerce

```typescript
import { Coerce } from '@twin.org/core';

Coerce.integer('19'); // 19
Coerce.boolean('true'); // true
Coerce.dateTime('2026-03-09T11:32:00Z')?.toISOString(); // '2026-03-09T11:32:00.000Z'
```

## StringHelper

```typescript
import { StringHelper } from '@twin.org/core';

StringHelper.kebabCase('OrderCreatedEvent'); // 'order-created-event'
StringHelper.camelCase('order-created-event'); // 'orderCreatedEvent'
StringHelper.words('PaymentReferenceId'); // ['Payment', 'Reference', 'Id']
```

## Error Classes

```typescript
import {
  AlreadyExistsError,
  BaseError,
  ConflictError,
  GeneralError,
  GuardError,
  NotFoundError,
  NotImplementedError,
  NotSupportedError,
  UnauthorizedError,
  UnprocessableError,
  ValidationError
} from '@twin.org/core';

const base = new BaseError(this.CLASS_NAME, 'baseUnexpectedFailure', { module: 'orders' });
new AlreadyExistsError(this.CLASS_NAME, 'alreadyExistsOrder', { orderId: 'o-1' });
new ConflictError(this.CLASS_NAME, 'conflictVersionMismatch', { expected: 3, actual: 2 });
new GeneralError(this.CLASS_NAME, 'generalUnexpectedFailure', { retryable: false });
new GuardError(this.CLASS_NAME, 'guardValidationFailed', { field: 'name' });
new NotFoundError(this.CLASS_NAME, 'notFoundOrder', { orderId: 'o-1' });
new NotImplementedError(this.CLASS_NAME, 'notImplementedFeature', {
  feature: 'export'
});
new NotSupportedError(this.CLASS_NAME, 'notSupportedFormat', { format: 'xml' });
new UnauthorizedError(this.CLASS_NAME, 'unauthorizedInvalidToken', {
  scope: 'orders:write'
});
new UnprocessableError(this.CLASS_NAME, 'unprocessableInvalidContent', { field: 'email' });
new ValidationError(this.CLASS_NAME, 'validationInputFailed', { failures: 2 });
base.toJsonObject().name; // 'BaseError'
```

## Factory

```typescript
import { Factory } from '@twin.org/core';

interface IHasher {
  hash(value: string): string;
}

class SimpleHasher implements IHasher {
  public hash(value: string): string {
    return `${value}-hash`;
  }
}

const factory = Factory.createFactory<IHasher>('hashers');
factory.register('simple', () => new SimpleHasher());

factory.create('simple').hash('abc'); // 'abc-hash'
```

## Factory Facades

A facade wraps the components a factory produces, so a cross cutting concern can be applied without modifying them.

```typescript
import { ComponentFactory, FacadeFactory, Is, type IFacade } from '@twin.org/core';

class LoggingFacade implements IFacade {
  public wrap(target: unknown): unknown {
    return new Proxy(target as object, {
      get(t, prop, receiver): unknown {
        const value = Reflect.get(t, prop, receiver);

        if (!Is.function(value)) {
          return value;
        }

        return (...args: unknown[]): unknown => {
          globalThis.console.log('calling', String(prop));
          return value.apply(t, args);
        };
      }
    });
  }
}

FacadeFactory.register('logging', () => new LoggingFacade());

// Every component the factory produces from here on is wrapped.
ComponentFactory.useFacade('logging');

// No longer wrapped, for instances produced after this call.
ComponentFactory.unuseFacade('logging');
```

An instance is passed through the facades in the order they were activated, so the first activated is the outermost.

## Encoding and Compression

```typescript
import { Base32, Base58, Base64, Base64Url, Compression, HexHelper } from '@twin.org/core';

const bytes = new Uint8Array([1, 2, 3, 4]);

Base32.encode(bytes);
Base58.encode(bytes);
Base64.encode(bytes);
Base64Url.encode(bytes);
Compression.compress(bytes, 'gzip');
HexHelper.addPrefix('aabbcc'); // '0xaabbcc'
```

## AsyncCache and SharedStore

```typescript
import { AsyncCache, SharedStore } from '@twin.org/core';

const cache = new AsyncCache<string, number>({ expirySeconds: 30 });
await cache.exec('invoice-1', async () => 4200); // 4200

SharedStore.set('region', 'eu-west-1');
SharedStore.get<string>('region'); // 'eu-west-1'
```

## NativeModules

```typescript
import { NativeModules } from '@twin.org/core';

NativeModules.typeExists('Buffer'); // true on Node, false in a browser without a polyfill

// Node builtins are only used by classes such as Sha256 once a host has registered them,
// typically once at startup. The returned object lists any specifiers that failed to load.
const failures = await NativeModules.init(['node:crypto']);
NativeModules.getModule('node:crypto'); // the module, or undefined if init() was never called for it
NativeModules.names(); // ['node:crypto']
```

## RandomHelper and NumberHelper

```typescript
import { NumberHelper, RandomHelper } from '@twin.org/core';

NumberHelper.clamp(150, 0, 100); // 100
RandomHelper.generate(16).length; // 16
RandomHelper.generateUuidV7(); // 'xxxxxxxx-xxxx-7xxx-xxxx-xxxxxxxxxxxx'
```

## Url, Urn and BitString

```typescript
import { BitString, Url, Urn } from '@twin.org/core';

const url = Url.fromParts({
  scheme: 'https',
  host: 'example.org',
  pathname: '/products'
});

url.toString(); // 'https://example.org/products'
Urn.fromValidString('urn:example:widget:123').namespaceMethod(); // 'example'

const bits = BitString.fromBits([1, 0, 1, 1]);
bits.getLength(); // 4
```

## JsonHelper

```typescript
import { JsonHelper } from '@twin.org/core';

const left = { id: 'u-1', active: true };
const right = { id: 'u-1', active: false };

const patch = JsonHelper.diff(left, right);
JsonHelper.patch(left, patch); // { id: 'u-1', active: false }
```

## ErrorHelper

```typescript
import { BaseError, ErrorHelper } from '@twin.org/core';

const error = new BaseError(this.CLASS_NAME, 'saveFailed', { entityId: 'u-1' });
const messages = ErrorHelper.formatErrors(error);

messages[0]; // 'saveFailed'
```

## Type Utilities

```typescript
import type { ObjectOrArray, SingleOccurrenceArray } from '@twin.org/core';

type IdOrIds = ObjectOrArray<string>;

const singleId: IdOrIds = 'id-1';
const manyIds: IdOrIds = ['id-1', 'id-2'];

const withOneNumber: SingleOccurrenceArray<string, number> = ['alpha', 7, 'beta'];
const numberOnly: SingleOccurrenceArray<string, number> = [7];

interface IFoo {
  foo: boolean;
}

interface IBar {
  bar: string;
}

const mixedObjects: SingleOccurrenceArray<IFoo, IBar> = [
  { foo: true },
  { bar: 'marker' },
  { foo: false }
];
```

## Array, Uint8Array, Filename and Env Helpers

```typescript
import { ArrayHelper, EnvHelper, FilenameHelper, Uint8ArrayHelper } from '@twin.org/core';

ArrayHelper.matches([1, 2, 3], [1, 2, 3]); // true
Uint8ArrayHelper.concat(new Uint8Array([1, 2]), new Uint8Array([3, 4]));
FilenameHelper.safeFilename('Q1 Report: Europe/West.csv'); // 'Q1-Report-Europe-West.csv'
EnvHelper.envToJson('API_KEY=abc\nLOG_LEVEL=debug'); // { API_KEY: 'abc', LOG_LEVEL: 'debug' }
```

## I18n

```typescript
import { I18n } from '@twin.org/core';

I18n.setLocale('en');
I18n.addDictionary('en', {
  greeting: 'Hello {name}'
});

I18n.formatMessage('greeting', { name: 'Ari' }); // 'Hello Ari'
```
