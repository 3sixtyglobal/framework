// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Common mime types.
 * @see https://www.iana.org/assignments/media-types/media-types.xhtml
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const MimeTypes = {
	/**
	 * Plaint Text - text/plain
	 */
	PlainText: "text/plain",

	/**
	 * Event Stream - text/event-stream
	 */
	EventStream: "text/event-stream",

	/**
	 * HTML - text/html
	 */
	Html: "text/html",

	/**
	 * CSS - text/css
	 */
	Css: "text/css",

	/**
	 * Javascript - text/javascript
	 */
	Javascript: "text/javascript",

	/**
	 * Markdown - text/markdown
	 */
	Markdown: "text/markdown",

	/**
	 * JSON - application/json
	 */
	Json: "application/json",

	/**
	 * Problem JSON - application/problem+json
	 */
	ProblemJson: "application/problem+json",

	/**
	 * JSON-LD - application/ld+json
	 */
	JsonLd: "application/ld+json",

	/**
	 * Activity Streams - application/activity+json
	 */
	ActivityStreams: "application/activity+json",

	/**
	 * WebFinger JRD - application/jrd+json
	 */
	JrdJson: "application/jrd+json",

	/**
	 * JWT - application/jwt
	 */
	Jwt: "application/jwt",

	/**
	 * Access Token JWT - application/at+jwt
	 */
	AccessTokenJwt: "application/at+jwt",

	/**
	 * JOSE (Compact Serialization) - application/jose
	 */
	Jose: "application/jose",

	/**
	 * JOSE (JSON Serialization) - application/jose+json
	 */
	JoseJson: "application/jose+json",

	/**
	 * JSON Web Key (JWK) - application/jwk+json
	 */
	JwkJson: "application/jwk+json",

	/**
	 * JSON Web Key Set (JWKS) - application/jwk-set+json
	 */
	JwkSetJson: "application/jwk-set+json",

	/**
	 * Decentralized Identifier (DID) - application/did+json
	 */
	DidJson: "application/did+json",

	/**
	 * Decentralized Identifier (DID) (JSON-LD) - application/did+ld+json
	 */
	DidLdJson: "application/did+ld+json",

	/**
	 * Verifiable Credential (JSON-LD) - application/vc+ld+json
	 */
	VerifiableCredentialLdJson: "application/vc+ld+json",

	/**
	 * Verifiable Presentation (JSON-LD) - application/vp+ld+json
	 */
	VerifiablePresentationLdJson: "application/vp+ld+json",

	/**
	 * Verifiable Credential (JWT) - application/vc+jwt
	 */
	VerifiableCredentialJwt: "application/vc+jwt",

	/**
	 * Verifiable Presentation (JWT) - application/vp+jwt
	 */
	VerifiablePresentationJwt: "application/vp+jwt",

	/**
	 * JSON Patch - application/json-patch+json
	 */
	JsonPatch: "application/json-patch+json",

	/**
	 * JSON Merge Patch - application/merge-patch+json
	 */
	MergePatch: "application/merge-patch+json",

	/**
	 * CBOR Web Token (CWT) - application/cwt
	 */
	Cwt: "application/cwt",

	/**
	 * COSE - application/cose
	 */
	Cose: "application/cose",

	/**
	 * COSE Key - application/cose-key
	 */
	CoseKey: "application/cose-key",

	/**
	 * COSE Key Set - application/cose-key-set
	 */
	CoseKeySet: "application/cose-key-set",

	/**
	 * Form URL Encoded - application/x-www-form-urlencoded
	 */
	FormUrlEncoded: "application/x-www-form-urlencoded",

	/**
	 * Multipart Form Data - multipart/form-data
	 */
	MultipartFormData: "multipart/form-data",

	/**
	 * XML - application/xml
	 */
	Xml: "application/xml",

	/**
	 * WASM - application/wasm
	 */
	Wasm: "application/wasm",

	/**
	 * Web App Manifest - application/manifest+json
	 */
	WebManifest: "application/manifest+json",

	/**
	 * Application Octet Stream, arbitrary binary - application/octet-stream
	 */
	OctetStream: "application/octet-stream",

	/**
	 * Application GZIP - application/gzip
	 */
	Gzip: "application/gzip",

	/**
	 * Application deflate - application/zlib
	 */
	Zlib: "application/zlib",

	/**
	 * Application BZIP2 - application/x-bzip2
	 */
	Bzip2: "application/x-bzip2",

	/**
	 * Application ZIP - application/zip
	 */
	Zip: "application/zip",

	/**
	 * Application 7-Zip - application/x-7z-compressed
	 */
	SevenZip: "application/x-7z-compressed",

	/**
	 * Application RAR - application/vnd.rar
	 */
	Rar: "application/vnd.rar",

	/**
	 * Application SQLite3 - application/x-sqlite3
	 */
	Sqlite: "application/x-sqlite3",

	/**
	 * Application PDF - application/pdf
	 */
	Pdf: "application/pdf",

	/**
	 * Rich Text Format - application/rtf
	 */
	Rtf: "application/rtf",

	/**
	 * Word Document - application/vnd.openxmlformats-officedocument.wordprocessingml.document
	 */
	Docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

	/**
	 * Excel Spreadsheet - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
	 */
	Xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

	/**
	 * PowerPoint Presentation - application/vnd.openxmlformats-officedocument.presentationml.presentation
	 */
	Pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",

	/**
	 * Image GIF - image/gif
	 */
	Gif: "image/gif",

	/**
	 * Image BMP - image/bmp
	 */
	Bmp: "image/bmp",

	/**
	 * Image JPEG - image/jpeg
	 */
	Jpeg: "image/jpeg",

	/**
	 * Image PNG - image/png
	 */
	Png: "image/png",

	/**
	 * Image Tiff - image/tiff
	 */
	Tiff: "image/tiff",

	/**
	 * Image SVG - image/svg+xml
	 */
	Svg: "image/svg+xml",

	/**
	 * Image ICO - image/x-icon
	 */
	Ico: "image/x-icon",

	/**
	 * Image WEBP - image/webp
	 */
	WebP: "image/webp",

	/**
	 * Image AVIF - image/avif
	 */
	Avif: "image/avif",

	/**
	 * Image HEIC - image/heic
	 */
	Heic: "image/heic",

	/**
	 * Image APNG - image/apng
	 */
	Apng: "image/apng",

	/**
	 * Font WOFF - font/woff
	 */
	Woff: "font/woff",

	/**
	 * Font WOFF2 - font/woff2
	 */
	Woff2: "font/woff2",

	/**
	 * Font TTF - font/ttf
	 */
	Ttf: "font/ttf",

	/**
	 * Font OTF - font/otf
	 */
	Otf: "font/otf",

	/**
	 * Audio FLAC - audio/flac
	 */
	Flac: "audio/flac",

	/**
	 * Audio MIDI - audio/midi
	 */
	Midi: "audio/midi",

	/**
	 * Audio MP3 - audio/mpeg
	 */
	Mp3: "audio/mpeg",

	/**
	 * Audio OGG - audio/ogg
	 */
	OggAudio: "audio/ogg",

	/**
	 * Audio WAV - audio/wav
	 */
	Wav: "audio/wav",

	/**
	 * Audio WEBM - audio/webm
	 */
	WebmAudio: "audio/webm",

	/**
	 * Audio AAC - audio/aac
	 */
	Aac: "audio/aac",

	/**
	 * Audio MP4 - audio/mp4
	 */
	Mp4Audio: "audio/mp4",

	/**
	 * Video MP4 - video/mp4
	 */
	Mp4: "video/mp4",

	/**
	 * Audio/Video MPEG - video/mpeg
	 */
	Mpeg: "video/mpeg",

	/**
	 * Video WEBM - video/webm
	 */
	Webm: "video/webm",

	/**
	 * Video OGG - video/ogg
	 */
	OggVideo: "video/ogg",

	/**
	 * Video QuickTime - video/quicktime
	 */
	Quicktime: "video/quicktime"
} as const;

/**
 * Common mime types.
 */
export type MimeTypes = (typeof MimeTypes)[keyof typeof MimeTypes];
