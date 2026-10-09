// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type * as NodeZlib from "node:zlib";
import { nameof } from "@3sixty/nameof";
import { Guards } from "./guards.js";
import { NativeModules } from "./nativeModules.js";
import { CompressionType } from "../models/compressionType.js";

/**
 * A class to handle compression.
 */
export class Compression {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<Compression>();

	/**
	 * The node:zlib module, populated on first use. Not resolved in this initialiser, which
	 * runs when the module is evaluated, before a host has awaited NativeModules.init().
	 * @internal
	 */
	private static _nodeZlib: typeof NodeZlib | undefined;

	/**
	 * Compress bytes using the specified compression type.
	 * @param bytes The bytes to compress.
	 * @param type The type of compression to use.
	 * @returns The compressed bytes.
	 */
	public static async compress(bytes: Uint8Array, type: CompressionType): Promise<Uint8Array> {
		Guards.uint8Array(Compression.CLASS_NAME, nameof(bytes), bytes);
		Guards.arrayOneOf(Compression.CLASS_NAME, nameof(type), type, Object.values(CompressionType));

		Compression._nodeZlib ??= NativeModules.getModule<typeof NodeZlib>("node:zlib");

		let compressedBytes: Uint8Array;

		if (Compression._nodeZlib) {
			compressedBytes = new Uint8Array(
				type === CompressionType.Gzip
					? Compression._nodeZlib.gzipSync(bytes)
					: Compression._nodeZlib.deflateSync(bytes)
			);
		} else {
			const blob = new Blob([new Uint8Array(bytes)]);
			const compressionStream = new CompressionStream(type);
			const compressionPipe = blob.stream().pipeThrough(compressionStream);
			const compressedBlob = await new Response(compressionPipe).blob();

			compressedBytes = new Uint8Array(await compressedBlob.arrayBuffer());
		}

		// GZIP header contains a byte which specifies the OS the
		// compression was performed on. We set this to 3 (Unix) to ensure
		// that we produce consistent results.
		if (type === CompressionType.Gzip && compressedBytes.length >= 10) {
			compressedBytes[9] = 3;
		}

		return compressedBytes;
	}

	/**
	 * Decompress a gzipped compressed byte array.
	 * @param compressedBytes The compressed bytes.
	 * @param type The type of compression to use.
	 * @returns The decompressed bytes.
	 */
	public static async decompress(
		compressedBytes: Uint8Array,
		type: CompressionType
	): Promise<Uint8Array> {
		Guards.uint8Array(Compression.CLASS_NAME, nameof(compressedBytes), compressedBytes);
		Guards.arrayOneOf(Compression.CLASS_NAME, nameof(type), type, Object.values(CompressionType));

		Compression._nodeZlib ??= NativeModules.getModule<typeof NodeZlib>("node:zlib");

		if (Compression._nodeZlib) {
			return new Uint8Array(
				type === CompressionType.Gzip
					? Compression._nodeZlib.gunzipSync(compressedBytes)
					: Compression._nodeZlib.inflateSync(compressedBytes)
			);
		}

		const blob = new Blob([new Uint8Array(compressedBytes)]);
		const decompressionStream = new DecompressionStream(type);
		const decompressionPipe = blob.stream().pipeThrough(decompressionStream);
		const decompressedBlob = await new Response(decompressionPipe).blob();

		return new Uint8Array(await decompressedBlob.bytes());
	}
}
