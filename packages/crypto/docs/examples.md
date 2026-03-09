# Crypto Examples

Use these snippets as practical building blocks for hashes, signatures, key derivation, passwords and one-time passwords.

## Sha3, Sha512, HmacSha512

```typescript
import { HmacSha512, Sha3, Sha512 } from '@twin.org/crypto';

const message = new TextEncoder().encode('hello twin');
const key = new TextEncoder().encode('super-secret');

Sha3.sum256(message);
Sha512.sum512(message);
HmacSha512.sum512(key, message);
```

## Blake2b, Blake3, Sha256, HmacSha256, Sha1, HmacSha1

```typescript
import { Blake2b, Blake3, HmacSha1, HmacSha256, Sha1, Sha256 } from '@twin.org/crypto';

const bytes = new TextEncoder().encode('digest me');
const hmacKey = new TextEncoder().encode('key-01');

Blake2b.sum256(bytes);
Blake3.sum256(bytes);
Sha256.sum256(bytes);
Sha1.sum(bytes);
HmacSha256.sum256(hmacKey, bytes);
HmacSha1.sum(hmacKey, bytes);
```

## Ed25519, Secp256k1, X25519, Zip215

```typescript
import { Ed25519, Secp256k1, X25519, Zip215 } from '@twin.org/crypto';

const privateKey = new Uint8Array(32).fill(7);
const payload = new TextEncoder().encode('payload');

const edPublic = Ed25519.publicKeyFromPrivateKey(privateKey);
const edSignature = Ed25519.sign(privateKey, payload);
Ed25519.verify(edPublic, payload, edSignature); // true

const secpPublic = Secp256k1.publicKeyFromPrivateKey(privateKey);
const secpSignature = Secp256k1.sign(privateKey, payload);
Secp256k1.verify(secpPublic, payload, secpSignature); // true

X25519.convertPublicKeyToX25519(edPublic);
Zip215.verify(edPublic, payload, edSignature); // true
```

## Bip39, Bip32Path, Slip0010, Bip44, Bech32

```typescript
import { Bech32, Bip32Path, Bip39, Bip44, Slip0010 } from '@twin.org/crypto';

const entropy = new Uint8Array(32).fill(1);
const mnemonic = Bip39.entropyToMnemonic(entropy);
const seed = Bip39.mnemonicToSeed(mnemonic, 'passphrase');

const path = Bip32Path.fromPath("m/44'/4218'/0'/0'/0'");
path.numberSegments(); // 5

const master = Slip0010.getMasterKeyFromSeed(seed);
const derived = Slip0010.derivePath(master.privateKey, master.chainCode, path.toString());

Bip44.address(derived.privateKey); // '0x...'
Bech32.encode('twin', new Uint8Array([1, 2, 3, 4]));
```

## ChaCha20Poly1305, Pbkdf2, IntegrityHelper, PemHelper

```typescript
import { ChaCha20Poly1305, IntegrityHelper, Pbkdf2, PemHelper } from '@twin.org/crypto';

const password = new TextEncoder().encode('passw0rd!');
const salt = new Uint8Array(16).fill(2);
const key = Pbkdf2.sha512(password, salt, 4096, 32);

const nonce = new Uint8Array(12).fill(3);
const plaintext = new TextEncoder().encode('encrypted-content');
const cipher = ChaCha20Poly1305.encrypt(key, nonce, plaintext, new Uint8Array(0));
ChaCha20Poly1305.decrypt(key, nonce, cipher, new Uint8Array(0));

const checksum = IntegrityHelper.generate('sha256', plaintext);
IntegrityHelper.verify('sha256', plaintext, checksum); // true

PemHelper.formatPem('PUBLIC KEY', new Uint8Array([10, 11, 12]));
```

## Hotp and Totp

```typescript
import { Hotp, Totp } from '@twin.org/crypto';

const secret = Totp.generateSecret();

Hotp.generate(secret, 42, 6); // '123456'
const token = Totp.generate(secret, {
  periodSeconds: 30,
  digits: 6,
  timestamp: Date.now()
});

Totp.verify(secret, token, {
  periodSeconds: 30,
  digits: 6,
  timestamp: Date.now()
}); // true
```

## PasswordGenerator and PasswordValidator

```typescript
import { PasswordGenerator, PasswordValidator } from '@twin.org/crypto';

const generated = PasswordGenerator.generate({
  length: 20,
  includeLowercase: true,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: true
});

const hashed = await PasswordGenerator.hashPassword(generated);
PasswordValidator.validate(generated);
await PasswordValidator.comparePasswordHashes(generated, hashed); // true
```
