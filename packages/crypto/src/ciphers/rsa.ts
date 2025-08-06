// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	createPrivateKey,
	createPublicKey,
	type KeyObject,
	publicEncrypt,
	constants,
	privateDecrypt,
	generateKeyPairSync
} from "node:crypto";
import { Converter, GeneralError, Guards, Is, Uint8ArrayHelper } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";

/**
 * Implementation of the RSA cipher.
 */
export class RSA {
	/**
	 * Runtime name for the class.
	 * @internal
	 */
	private static readonly _CLASS_NAME: string = nameof<RSA>();

	/**
	 * The public key for encryption.
	 * @internal
	 */
	private readonly _publicKey: KeyObject;

	/**
	 * The private key for decryption.
	 * @internal
	 */
	private readonly _privateKey?: KeyObject;

	/**
	 * The block size for encryption.
	 * @internal
	 */
	private readonly _blockSize: number;

	/**
	 * The key size for decryption.
	 * @internal
	 */
	private readonly _keySize: number;

	/**
	 * Create a new instance of RSA.
	 * @param publicKey The public key for encryption (DER format as Uint8Array).
	 * @param privateKey The private key for decryption (DER format as Uint8Array).
	 */
	constructor(publicKey: Uint8Array, privateKey?: Uint8Array) {
		Guards.uint8Array(RSA._CLASS_NAME, nameof(publicKey), publicKey);

		this._publicKey = createPublicKey({
			key: Buffer.from(publicKey),
			format: "der",
			type: "spki"
		});

		if (!Is.empty(privateKey)) {
			this._privateKey = createPrivateKey({
				key: Buffer.from(privateKey),
				format: "der",
				type: "pkcs8"
			});
		}

		// Get modulus length in bits from key details
		const modulusLengthBits = this._publicKey.asymmetricKeyDetails?.modulusLength;
		if (Is.empty(modulusLengthBits)) {
			throw new GeneralError(RSA._CLASS_NAME, "invalidKeySize");
		}

		// Convert bits to bytes
		this._keySize = Math.ceil(modulusLengthBits / 8);

		// Calculate block size for OAEP with SHA-256
		// Formula: keySize - 2 * hashLength - 2
		const hashLength = 32; // SHA-256 = 32 bytes
		// eslint-disable-next-line no-mixed-operators
		this._blockSize = this._keySize - 2 * hashLength - 2;
	}

	/**
	 * Generate a new RSA key pair in PKCS8 format.
	 * @param modulusLength The key size in bits (default: 2048).
	 * @returns The public and private keys as Uint8Array.
	 */
	public static generateKeyPair(modulusLength: number = 2048): {
		publicKey: Uint8Array;
		privateKey: Uint8Array;
	} {
		const { publicKey, privateKey } = generateKeyPairSync("rsa", {
			modulusLength,
			publicKeyEncoding: {
				type: "spki",
				format: "der"
			},
			privateKeyEncoding: {
				type: "pkcs8",
				format: "der"
			}
		});

		return {
			publicKey: new Uint8Array(publicKey),
			privateKey: new Uint8Array(privateKey)
		};
	}

	/**
	 * Convert a PKCS1 key to a PKCS8 key.
	 * @param pkcs1Key The PKCS1 key as Uint8Array.
	 * @returns The PKCS8 key as Uint8Array.
	 */
	public static convertPkcs1ToPkcs8(pkcs1Key: Uint8Array): Uint8Array {
		Guards.uint8Array(RSA._CLASS_NAME, nameof(pkcs1Key), pkcs1Key);

		const privateKey = createPrivateKey({
			key: Buffer.from(pkcs1Key),
			format: "der",
			type: "pkcs1"
		});

		return new Uint8Array(
			privateKey.export({
				format: "der",
				type: "pkcs8"
			})
		);
	}

	/**
	 * Break the private key down in to its components.
	 * @param pkcs8Key The PKCS8 key as Uint8Array.
	 * @returns The key components.
	 */
	public static getPrivateKeyComponents(pkcs8Key: Uint8Array): {
		n: bigint;
		e: bigint;
		d: bigint;
		p: bigint;
		q: bigint;
		dp: bigint;
		dq: bigint;
		qi: bigint;
	} {
		Guards.uint8Array(RSA._CLASS_NAME, nameof(pkcs8Key), pkcs8Key);

		const privateKey = createPrivateKey({
			key: Buffer.from(pkcs8Key),
			format: "der",
			type: "pkcs8"
		});

		const jwk = privateKey.export({ format: "jwk" });
		return {
			n: this.base64UrlToBigInt(jwk.n),
			e: this.base64UrlToBigInt(jwk.e),
			d: this.base64UrlToBigInt(jwk.d),
			p: this.base64UrlToBigInt(jwk.p),
			q: this.base64UrlToBigInt(jwk.q),
			dp: this.base64UrlToBigInt(jwk.dp),
			dq: this.base64UrlToBigInt(jwk.dq),
			qi: this.base64UrlToBigInt(jwk.qi)
		};
	}

	/**
	 * Break the public key down in to its components.
	 * @param spkiKey The SPKI key as Uint8Array.
	 * @returns The key components.
	 */
	public static getPublicKeyComponents(spkiKey: Uint8Array): {
		n: bigint;
		e: bigint;
	} {
		Guards.uint8Array(RSA._CLASS_NAME, nameof(spkiKey), spkiKey);

		const publicKey = createPublicKey({
			key: Buffer.from(spkiKey),
			format: "der",
			type: "spki"
		});

		const jwk = publicKey.export({ format: "jwk" });
		return {
			n: this.base64UrlToBigInt(jwk.n),
			e: this.base64UrlToBigInt(jwk.e)
		};
	}

	/**
	 * Convert base64 encoded data to a big int.
	 * @param bytes The bytes to convert.
	 * @returns The bigint representation of the bytes.
	 * @internal
	 */
	private static base64UrlToBigInt(base64Url: string | undefined): bigint {
		if (Is.empty(base64Url)) {
			return BigInt(0);
		}
		const bytes = Converter.base64UrlToBytes(base64Url);
		const hexString = Array.from(bytes)
			.map(byte => byte.toString(16).padStart(2, "0"))
			.join("");
		return BigInt(`0x${hexString}`);
	}

	/**
	 * Encrypt the data.
	 * @param data The data to encrypt.
	 * @returns The data encrypted.
	 */
	public encrypt(data: Uint8Array): Uint8Array {
		Guards.uint8Array(RSA._CLASS_NAME, nameof(data), data);

		if (data.length === 0) {
			return new Uint8Array(0);
		}

		const blocks: Uint8Array[] = [];

		// Split data into blocks of block size
		for (let i = 0; i < data.length; i += this._blockSize) {
			const block = data.slice(i, i + this._blockSize);
			const encryptedBlock = publicEncrypt(
				{
					key: this._publicKey,
					padding: constants.RSA_PKCS1_OAEP_PADDING
				},
				block
			);
			blocks.push(encryptedBlock);
		}

		return Uint8ArrayHelper.concat(blocks);
	}

	/**
	 * Decrypt the data.
	 * @param data The data to decrypt.
	 * @returns The data decrypted.
	 * @throws GeneralError If no private key is provided.
	 */
	public decrypt(data: Uint8Array): Uint8Array {
		Guards.uint8Array(RSA._CLASS_NAME, nameof(data), data);

		if (Is.empty(this._privateKey)) {
			throw new GeneralError(RSA._CLASS_NAME, "noPrivateKey");
		}

		if (data.length === 0) {
			return new Uint8Array(0);
		}

		const blocks: Uint8Array[] = [];

		// Split encrypted data into blocks of key size
		for (let i = 0; i < data.length; i += this._keySize) {
			const block = data.slice(i, i + this._keySize);
			const decryptedBlock = privateDecrypt(
				{
					key: this._privateKey,
					padding: constants.RSA_PKCS1_OAEP_PADDING
				},
				block
			);
			blocks.push(decryptedBlock);
		}

		return Uint8ArrayHelper.concat(blocks);
	}
}
