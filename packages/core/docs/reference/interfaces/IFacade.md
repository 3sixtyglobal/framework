# Interface: IFacade\<T\>

A facade wraps a component so a cross cutting concern can be applied to it without the
component being modified. The wrapped component is returned in place of the original.

## Type Parameters

### T

`T` = `unknown`

## Methods

### wrap() {#wrap}

> **wrap**(`target`): `T`

Wrap the target, returning a replacement.

#### Parameters

##### target

`T`

The component to wrap.

#### Returns

`T`

The wrapped component.
