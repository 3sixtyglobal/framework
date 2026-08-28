// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter, Is } from "@twin.org/core";
import { MimeTypes } from "../models/mimeTypes.js";

/**
 * Class to help with mime types.
 */
export class MimeTypeHelper {
	/**
	 * Detect the mime type from a byte array.
	 * @param data The data to test.
	 * @returns The mime type if detected.
	 */
	public static async detect(data: Uint8Array): Promise<string | undefined> {
		if (!Is.uint8Array(data) || data.length === 0) {
			return undefined;
		}

		// Image
		if (MimeTypeHelper.checkBytes(data, [0x47, 0x49, 0x46])) {
			return MimeTypes.Gif;
		}

		if (MimeTypeHelper.checkBytes(data, [0x42, 0x4d])) {
			return MimeTypes.Bmp;
		}
		if (MimeTypeHelper.checkBytes(data, [0xff, 0xd8, 0xff])) {
			return MimeTypes.Jpeg;
		}

		if (MimeTypeHelper.checkBytes(data, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
			return MimeTypes.Png;
		}

		if (
			MimeTypeHelper.checkBytes(data, [0x49, 0x49, 0x2a, 0x00]) ||
			MimeTypeHelper.checkBytes(data, [0x4d, 0x4d, 0x00, 0x2a])
		) {
			return MimeTypes.Tiff;
		}

		// WebP: RIFF container with WEBP brand at offset 8
		if (
			MimeTypeHelper.checkBytes(data, [0x52, 0x49, 0x46, 0x46]) &&
			MimeTypeHelper.checkBytes(data, [0x57, 0x45, 0x42, 0x50], 8)
		) {
			return MimeTypes.WebP;
		}

		if (MimeTypeHelper.checkBytes(data, [0x00, 0x00, 0x01, 0x00])) {
			return MimeTypes.Ico;
		}

		// ISO base media file format: file-type box at offset 4, major brand at offset 8
		if (MimeTypeHelper.checkBytes(data, [0x66, 0x74, 0x79, 0x70], 4)) {
			if (MimeTypeHelper.checkBytes(data, [0x61, 0x76, 0x69, 0x66], 8)) {
				return MimeTypes.Avif;
			}
			if (
				MimeTypeHelper.checkBytes(data, [0x68, 0x65, 0x69, 0x63], 8) || // heic
				MimeTypeHelper.checkBytes(data, [0x68, 0x65, 0x69, 0x78], 8) || // heic variant
				MimeTypeHelper.checkBytes(data, [0x68, 0x65, 0x69, 0x66], 8) || // heif
				MimeTypeHelper.checkBytes(data, [0x6d, 0x69, 0x66, 0x31], 8) // mif1 (multi-image)
			) {
				return MimeTypes.Heic;
			}
			if (
				MimeTypeHelper.checkBytes(data, [0x69, 0x73, 0x6f, 0x6d], 8) ||
				MimeTypeHelper.checkBytes(data, [0x6d, 0x70, 0x34, 0x31], 8) ||
				MimeTypeHelper.checkBytes(data, [0x6d, 0x70, 0x34, 0x32], 8) ||
				MimeTypeHelper.checkBytes(data, [0x4d, 0x34, 0x56, 0x20], 8)
			) {
				return MimeTypes.Mp4;
			}
			if (MimeTypeHelper.checkBytes(data, [0x71, 0x74, 0x20, 0x20], 8)) {
				return MimeTypes.Quicktime;
			}
		}

		// Compression
		if (MimeTypeHelper.checkBytes(data, [0x1f, 0x8b, 0x8])) {
			return MimeTypes.Gzip;
		}

		if (
			MimeTypeHelper.checkBytes(data, [0x78, 0x01]) ||
			MimeTypeHelper.checkBytes(data, [0x78, 0x9c]) ||
			MimeTypeHelper.checkBytes(data, [0x78, 0xda])
		) {
			return MimeTypes.Zlib;
		}

		if (MimeTypeHelper.checkBytes(data, [0x42, 0x5a, 0x68])) {
			return MimeTypes.Bzip2;
		}

		if (MimeTypeHelper.checkBytes(data, [0x50, 0x4b, 0x3, 0x4])) {
			// Office Open XML: scan for format-specific path prefixes in ZIP local file headers
			if (MimeTypeHelper.scanBytes(data, [0x77, 0x6f, 0x72, 0x64, 0x2f])) {
				return MimeTypes.Docx; // word/
			}
			if (MimeTypeHelper.scanBytes(data, [0x78, 0x6c, 0x2f])) {
				return MimeTypes.Xlsx; // xl/
			}
			if (MimeTypeHelper.scanBytes(data, [0x70, 0x70, 0x74, 0x2f])) {
				return MimeTypes.Pptx; // ppt/
			}
			return MimeTypes.Zip;
		}

		if (MimeTypeHelper.checkBytes(data, [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c])) {
			return MimeTypes.SevenZip;
		}

		if (
			MimeTypeHelper.checkBytes(data, [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x00]) ||
			MimeTypeHelper.checkBytes(data, [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x01, 0x00])
		) {
			return MimeTypes.Rar;
		}

		if (MimeTypeHelper.checkBytes(data, [0x53, 0x51, 0x4c, 0x69])) {
			return MimeTypes.Sqlite;
		}

		// Fonts
		if (MimeTypeHelper.checkBytes(data, [0x77, 0x4f, 0x46, 0x46])) {
			return MimeTypes.Woff;
		}

		if (MimeTypeHelper.checkBytes(data, [0x77, 0x4f, 0x46, 0x32])) {
			return MimeTypes.Woff2;
		}

		if (MimeTypeHelper.checkBytes(data, [0x00, 0x01, 0x00, 0x00, 0x00])) {
			return MimeTypes.Ttf;
		}

		if (MimeTypeHelper.checkBytes(data, [0x4f, 0x54, 0x54, 0x4f])) {
			return MimeTypes.Otf;
		}

		// Audio / Video
		if (MimeTypeHelper.checkBytes(data, [0x1a, 0x45, 0xdf, 0xa3])) {
			return MimeTypes.Webm;
		}

		if (MimeTypeHelper.checkBytes(data, [0x4f, 0x67, 0x67, 0x53])) {
			return MimeTypes.OggAudio;
		}

		if (
			MimeTypeHelper.checkBytes(data, [0x52, 0x49, 0x46, 0x46]) &&
			MimeTypeHelper.checkBytes(data, [0x57, 0x41, 0x56, 0x45], 8)
		) {
			return MimeTypes.Wav;
		}

		if (MimeTypeHelper.checkBytes(data, [0x49, 0x44, 0x33])) {
			return MimeTypes.Mp3;
		}

		if (MimeTypeHelper.checkBytes(data, [0x66, 0x4c, 0x61, 0x43])) {
			return MimeTypes.Flac;
		}

		if (MimeTypeHelper.checkBytes(data, [0x4d, 0x54, 0x68, 0x64])) {
			return MimeTypes.Midi;
		}

		if (MimeTypeHelper.checkBytes(data, [0x00, 0x61, 0x73, 0x6d])) {
			return MimeTypes.Wasm;
		}

		// Documents
		if (MimeTypeHelper.checkText(data, ["%PDF"])) {
			return MimeTypes.Pdf;
		}

		if (MimeTypeHelper.checkBytes(data, [0x7b, 0x5c, 0x72, 0x74, 0x66])) {
			return MimeTypes.Rtf; // {\rtf
		}

		// HTML: check before SVG so embedded SVG in an HTML page does not take precedence
		if (
			MimeTypeHelper.checkText(data, ["<!DOCTYPE html", "<!doctype html"]) ||
			MimeTypeHelper.scanBytes(data, [0x3c, 0x68, 0x74, 0x6d, 0x6c])
		) {
			return MimeTypes.Html;
		}

		// Lookup svg before xml, as svg are xml files as well
		// Scan raw bytes so large preambles (DOCTYPE, comments) don't require a full decode
		if (MimeTypeHelper.scanBytes(data, [0x3c, 0x73, 0x76, 0x67])) {
			return MimeTypes.Svg;
		}

		if (MimeTypeHelper.checkText(data, ["<?xml ", "<message"])) {
			return MimeTypes.Xml;
		}

		if (
			MimeTypeHelper.checkBytes(data, [0xef, 0xbb, 0xbf]) &&
			MimeTypeHelper.checkText(data, ["<?xml "], 3)
		) {
			// UTF-8-BOM
			return MimeTypes.Xml;
		}

		try {
			const text = new TextDecoder("utf-8", { fatal: true }).decode(data);
			return MimeTypeHelper.detectJsonOrText(text);
		} catch {
			// not valid UTF-8
		}
	}

	/**
	 * Return the default extension for a mime type.
	 * @param mimeType The mimetype to get the extension for.
	 * @returns The extension for the mime type.
	 */
	public static defaultExtension(mimeType: string | undefined): string | undefined {
		if (!Is.stringValue(mimeType)) {
			return undefined;
		}

		const lookup: { [mimeType: string]: string } = {
			[MimeTypes.PlainText]: "txt",
			[MimeTypes.EventStream]: "txt",
			[MimeTypes.Html]: "html",
			[MimeTypes.Css]: "css",
			[MimeTypes.Javascript]: "js",
			[MimeTypes.Markdown]: "md",
			[MimeTypes.Json]: "json",
			[MimeTypes.ProblemJson]: "json",
			[MimeTypes.WebManifest]: "webmanifest",
			[MimeTypes.JsonLd]: "jsonld",
			[MimeTypes.Jwt]: "jwt",
			[MimeTypes.AccessTokenJwt]: "jwt",
			[MimeTypes.Jose]: "jose",
			[MimeTypes.JoseJson]: "json",
			[MimeTypes.JwkJson]: "json",
			[MimeTypes.JwkSetJson]: "json",
			[MimeTypes.JrdJson]: "json",
			[MimeTypes.DidJson]: "json",
			[MimeTypes.DidLdJson]: "jsonld",
			[MimeTypes.VerifiableCredentialLdJson]: "jsonld",
			[MimeTypes.VerifiablePresentationLdJson]: "jsonld",
			[MimeTypes.VerifiableCredentialJwt]: "jwt",
			[MimeTypes.VerifiablePresentationJwt]: "jwt",
			[MimeTypes.JsonPatch]: "json",
			[MimeTypes.MergePatch]: "json",
			[MimeTypes.Cwt]: "cwt",
			[MimeTypes.Cose]: "cose",
			[MimeTypes.CoseKey]: "cose",
			[MimeTypes.CoseKeySet]: "cose",
			[MimeTypes.FormUrlEncoded]: "txt",
			[MimeTypes.MultipartFormData]: "txt",
			[MimeTypes.Xml]: "xml",
			[MimeTypes.Wasm]: "wasm",
			[MimeTypes.OctetStream]: "bin",
			[MimeTypes.Gzip]: "gzip",
			[MimeTypes.Zlib]: "zlib",
			[MimeTypes.Bzip2]: "bz2",
			[MimeTypes.Zip]: "zip",
			[MimeTypes.SevenZip]: "7z",
			[MimeTypes.Rar]: "rar",
			[MimeTypes.Sqlite]: "sqlite",
			[MimeTypes.Pdf]: "pdf",
			[MimeTypes.Rtf]: "rtf",
			[MimeTypes.Docx]: "docx",
			[MimeTypes.Xlsx]: "xlsx",
			[MimeTypes.Pptx]: "pptx",
			[MimeTypes.Gif]: "gif",
			[MimeTypes.Bmp]: "bmp",
			[MimeTypes.Jpeg]: "jpeg",
			[MimeTypes.Png]: "png",
			[MimeTypes.Tiff]: "tif",
			[MimeTypes.Svg]: "svg",
			[MimeTypes.Ico]: "ico",
			[MimeTypes.WebP]: "webp",
			[MimeTypes.Avif]: "avif",
			[MimeTypes.Heic]: "heic",
			[MimeTypes.Apng]: "apng",
			[MimeTypes.Woff]: "woff",
			[MimeTypes.Woff2]: "woff2",
			[MimeTypes.Ttf]: "ttf",
			[MimeTypes.Otf]: "otf",
			[MimeTypes.Flac]: "flac",
			[MimeTypes.Midi]: "midi",
			[MimeTypes.Mp3]: "mp3",
			[MimeTypes.OggAudio]: "ogg",
			[MimeTypes.Wav]: "wav",
			[MimeTypes.WebmAudio]: "webm",
			[MimeTypes.Aac]: "aac",
			[MimeTypes.Mp4Audio]: "m4a",
			[MimeTypes.Mp4]: "mp4",
			[MimeTypes.Mpeg]: "mpg",
			[MimeTypes.Webm]: "webm",
			[MimeTypes.OggVideo]: "ogv",
			[MimeTypes.Quicktime]: "mov"
		};

		return lookup[mimeType];
	}

	/**
	 * Check if the bytes match.
	 * @param data The data to look at.
	 * @param bytes The bytes to try and match.
	 * @param startOffset Start offset in the data.
	 * @returns True if the bytes match.
	 * @internal
	 */
	private static checkBytes(data: Uint8Array, bytes: number[], startOffset = 0): boolean {
		if (data.length - startOffset < bytes.length) {
			return false;
		}

		for (let i = 0; i < bytes.length; i++) {
			if (data[i + startOffset] !== bytes[i]) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Detect whether already-decoded UTF-8 text is JSON or plain text.
	 * For structured types (object/array) the end character is also checked
	 * before attempting a full parse to avoid the cost on large plain-text content.
	 * @param text The decoded text to inspect.
	 * @returns The detected mime type.
	 * @internal
	 */
	private static detectJsonOrText(text: string): string {
		const trimmedStart = text.trimStart();
		if (trimmedStart.length === 0) {
			return MimeTypes.PlainText;
		}

		const first = trimmedStart.charCodeAt(0);
		let couldBeJson: boolean;

		if (first === 0x7b || first === 0x5b) {
			// Object or array: verify matching end character before attempting full parse
			const trimmedEnd = text.trimEnd();
			const last = trimmedEnd.charCodeAt(trimmedEnd.length - 1);
			couldBeJson = (first === 0x7b && last === 0x7d) || (first === 0x5b && last === 0x5d);
		} else {
			// Primitive value: first character is sufficient to screen
			couldBeJson =
				first === 0x22 || // "
				first === 0x74 || // t (true)
				first === 0x66 || // f (false)
				first === 0x6e || // n (null)
				first === 0x2d || // -
				(first >= 0x30 && first <= 0x39); // 0-9
		}

		if (couldBeJson) {
			try {
				JSON.parse(text);
				return MimeTypes.Json;
			} catch {
				// valid UTF-8 but not valid JSON
			}
		}

		return MimeTypes.PlainText;
	}

	/**
	 * Scan for a byte sequence anywhere within the first limit bytes.
	 * @param data The data to search.
	 * @param bytes The byte sequence to find.
	 * @param limit Maximum number of bytes to scan.
	 * @returns True if the sequence is found within the scan limit.
	 * @internal
	 */
	private static scanBytes(data: Uint8Array, bytes: number[], limit = 4096): boolean {
		const end = Math.min(data.length - bytes.length, limit);
		for (let i = 0; i <= end; i++) {
			if (MimeTypeHelper.checkBytes(data, bytes, i)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Check if the text matches.
	 * @param data The data to look at.
	 * @param texts The text to try and match.
	 * @param startOffset Start offset in the data.
	 * @returns True if the bytes match.
	 * @internal
	 */
	private static checkText(data: Uint8Array, texts: string[], startOffset = 0): boolean {
		return texts.some(text =>
			MimeTypeHelper.checkBytes(data, Array.from(Converter.utf8ToBytes(text)), startOffset)
		);
	}
}
