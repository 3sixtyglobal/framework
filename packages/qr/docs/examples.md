# QR Examples

Use these snippets to create QR symbols from different input modes and render them as text or bitmap output.

## QR

```typescript
import { QR } from '@3sixty/qr';

const qr = new QR(4, 'M');

qr.addText('https://example.org/pay?id=123');
const matrix = qr.generate();

matrix.length > 0; // true
```

```typescript
import { QR } from '@3sixty/qr';

const qr = new QR(2, 'Q');

qr.addNumber('20260309');
qr.addAlphaNumeric('INV-0042');
qr.generate();
```

## TextRenderer

```typescript
import { QR, TextRenderer } from '@3sixty/qr';

const qr = new QR(2, 'L');
qr.addText('Hello world');
const text = TextRenderer.render(qr.generate(), {
  marginSize: 1
});

text.length > 0; // true
```

## PngRenderer

```typescript
import { PngRenderer, QR } from '@3sixty/qr';

const qr = new QR(3, 'M');
qr.addText('QR as PNG');

const pngBytes = PngRenderer.render(qr.generate(), {
  moduleSize: 8,
  marginSize: 2
});

pngBytes.length > 0; // true
```

## JpegRenderer

```typescript
import { JpegRenderer, QR } from '@3sixty/qr';

const qr = new QR(3, 'M');
qr.addText('QR as JPEG');

const jpegBytes = JpegRenderer.render(qr.generate(), {
  moduleSize: 8,
  marginSize: 2,
  quality: 85
});

jpegBytes.length > 0; // true
```
