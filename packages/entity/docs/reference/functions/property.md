# Function: property()

> **property**(`options`): `any`

Decorator to produce schema property data for entities.

## Parameters

### options

`Omit`\<[`IEntitySchemaProperty`](../interfaces/IEntitySchemaProperty.md), `"property"`\>

The options for the property.

## Returns

`any`

The property decorator.

## Throws

GeneralError if an index group is declared on an object or array property.

## Throws

GeneralError if the same index group name is declared more than once for the property.
