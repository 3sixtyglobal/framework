# Class: TextRenderer

Class to render qr data as text.

## Constructors

### Constructor

> **new TextRenderer**(): `TextRenderer`

#### Returns

`TextRenderer`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### render() {#render}

> `static` **render**(`cellData`, `options?`): `Promise`\<`string`\>

Render the QR code data as text.

#### Parameters

##### cellData

[`QRCellData`](../type-aliases/QRCellData.md)

The cell data for the QR code.

##### options?

[`ITextRendererOptions`](../interfaces/ITextRendererOptions.md)

The options for rendering.

#### Returns

`Promise`\<`string`\>

The text content.
