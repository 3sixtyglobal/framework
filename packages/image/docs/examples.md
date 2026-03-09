# Image Examples

These examples show colour handling and image encoding for generated assets.

## Color

```typescript
import { Color } from '@twin.org/image';

const accent = Color.fromHex('#4a90e2');

accent.red(); // 74
accent.green(); // 144
accent.blue(); // 226
accent.hexWithAlpha(); // '#ff4a90e2'
```

## JpegEncoder

```typescript
import { Color, JpegEncoder } from '@twin.org/image';

const pixels = [
  [Color.fromHex('#111111'), Color.fromHex('#eeeeee')],
  [Color.fromHex('#eeeeee'), Color.fromHex('#111111')]
];

const jpegBytes = JpegEncoder.encode(pixels, {
  quality: 90
});

jpegBytes.length > 0; // true
```

## PngEncoder

```typescript
import { Color, PngEncoder } from '@twin.org/image';

const pixels = [
  [Color.fromHex('#ff0000'), Color.fromHex('#00ff00')],
  [Color.fromHex('#0000ff'), Color.fromHex('#ffffff')]
];

const pngBytes = PngEncoder.encode(pixels);

pngBytes.length > 0; // true
```
