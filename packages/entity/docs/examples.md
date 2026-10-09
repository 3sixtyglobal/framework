# Entity Examples

Use these snippets to build schemas, compose conditions and order data for query-style workflows.

## EntitySchemaHelper

```typescript
import { EntitySchemaHelper } from '@3sixty/entity';

class Product {
  public id!: string;
  public sku!: string;
  public price!: number;
}

const schema = EntitySchemaHelper.getSchema(Product);
EntitySchemaHelper.getPrimaryKey(schema); // 'id'
EntitySchemaHelper.getSortProperties(schema); // ['sku', 'price']
```

## EntityConditions

```typescript
import { EntityConditions } from '@3sixty/entity';

const product = {
  sku: 'A-100',
  price: 49.99,
  active: true
};

EntityConditions.compare('eq', product.sku, 'A-100'); // true
EntityConditions.check(product, [{ property: 'price', comparison: 'gt', value: 10 }]); // true
```

## EntitySorter

```typescript
import { EntitySorter } from '@3sixty/entity';

const records = [
  { sku: 'A-300', price: 15 },
  { sku: 'A-100', price: 20 },
  { sku: 'A-200', price: 10 }
];

EntitySorter.sort(records, [{ property: 'sku', sortDirection: 'ascending' }]);
```

## DecoratorHelper

```typescript
import { DecoratorHelper } from '@3sixty/entity';

class Customer {
  public id!: string;
}

DecoratorHelper.setSchema(Customer, {
  primaryKey: 'id',
  type: 'customer',
  properties: {
    id: {
      type: 'string'
    }
  }
});

DecoratorHelper.getSchema(Customer)?.primaryKey; // 'id'
```
