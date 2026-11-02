# Class: SvgRenderer

Class to render qr data as SVG, which stays sharp at any size.

## Constructors

### Constructor

> **new SvgRenderer**(): `SvgRenderer`

#### Returns

`SvgRenderer`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### render() {#render}

> `static` **render**(`cellData`, `options?`): `Promise`\<`string`\>

Render the QR code data as SVG, with each run of dark cells in a row drawn as one rectangle of a single path.

#### Parameters

##### cellData

[`QRCellData`](../type-aliases/QRCellData.md)

The cell data for the QR code.

##### options?

[`ISvgRendererOptions`](../interfaces/ISvgRendererOptions.md)

The options for rendering.

#### Returns

`Promise`\<`string`\>

The SVG markup.
