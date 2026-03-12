# Class: Color

Class to represent a color.

## Constructors

### Constructor

> **new Color**(`alpha`, `red`, `green`, `blue`): `Color`

Create a new instance of color.

#### Parameters

##### alpha

`number`

The alpha element of the color.

##### red

`number`

The red element of the color.

##### green

`number`

The green element of the color.

##### blue

`number`

The blue element of the color.

#### Returns

`Color`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### fromHex() {#fromhex}

> `static` **fromHex**(`hex`): `Color`

Construct a color from a hex string.

#### Parameters

##### hex

`string`

The hex string to parse.

#### Returns

`Color`

The color.

#### Throws

Error if the format is incorrect.

***

### coerce() {#coerce}

> `static` **coerce**(`value`): `Color` \| `undefined`

Coerce an unknown type to a color.

#### Parameters

##### value

`unknown`

The value to try and convert.

#### Returns

`Color` \| `undefined`

The color if one can be created.

***

### alpha() {#alpha}

> **alpha**(): `number`

Get the alpha element.

#### Returns

`number`

The alpha element.

***

### red() {#red}

> **red**(): `number`

Get the red element.

#### Returns

`number`

The red element.

***

### green() {#green}

> **green**(): `number`

Get the green element.

#### Returns

`number`

The green element.

***

### blue() {#blue}

> **blue**(): `number`

Get the blue element.

#### Returns

`number`

The blue element.

***

### argb() {#argb}

> **argb**(): `number`

Get color as argb.

#### Returns

`number`

The color as argb.

***

### rgba() {#rgba}

> **rgba**(): `number`

Get color as rgba.

#### Returns

`number`

The color as rgba.

***

### rgbText() {#rgbtext}

> **rgbText**(): `string`

Get color as rgb text.

#### Returns

`string`

The color as rgb.

***

### rgbaText() {#rgbatext}

> **rgbaText**(): `string`

Get color as rgba text.

#### Returns

`string`

The color as rgba.

***

### hex() {#hex}

> **hex**(): `string`

Get color as hex no alpha.

#### Returns

`string`

The color as hex with no alpha component.

***

### hexWithAlpha() {#hexwithalpha}

> **hexWithAlpha**(): `string`

Get color as hex with alpha.

#### Returns

`string`

The color as hex with with alpha component.
