# Image Examples

Use these snippets for colour handling and image encoding when generating image assets.

## Color

```typescript
import { Color } from '@3sixty/image';

const accent = Color.fromHex('#4a90e2');

accent.red(); // 74
accent.green(); // 144
accent.blue(); // 226
accent.hexWithAlpha(); // '#ff4a90e2'
```

## JpegEncoder

```typescript
import { Color, JpegEncoder } from '@3sixty/image';

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
import { Color, PngEncoder } from '@3sixty/image';

const pixels = [
  [Color.fromHex('#ff0000'), Color.fromHex('#00ff00')],
  [Color.fromHex('#0000ff'), Color.fromHex('#ffffff')]
];

const pngBytes = PngEncoder.encode(pixels);

pngBytes.length > 0; // true
```
