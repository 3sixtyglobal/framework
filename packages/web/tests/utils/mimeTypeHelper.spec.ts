// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { MimeTypes } from "../../src/models/mimeTypes.js";
import { MimeTypeHelper } from "../../src/utils/mimeTypeHelper.js";

const enc = new TextEncoder();

describe("MimeTypeHelper", () => {
	describe("detect", () => {
		it("should return undefined for empty data", async () => {
			expect(await MimeTypeHelper.detect(new Uint8Array())).toBeUndefined();
		});

		it("should return undefined for non-Uint8Array input", async () => {
			expect(await MimeTypeHelper.detect(null as unknown as Uint8Array)).toBeUndefined();
		});

		describe("images", () => {
			it("should detect GIF", async () => {
				expect(await MimeTypeHelper.detect(new Uint8Array([0x47, 0x49, 0x46, 0x38]))).toBe(
					MimeTypes.Gif
				);
			});

			it("should detect BMP", async () => {
				expect(await MimeTypeHelper.detect(new Uint8Array([0x42, 0x4d, 0x00, 0x00]))).toBe(
					MimeTypes.Bmp
				);
			});

			it("should detect JPEG", async () => {
				expect(await MimeTypeHelper.detect(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe(
					MimeTypes.Jpeg
				);
			});

			it("should detect PNG", async () => {
				expect(
					await MimeTypeHelper.detect(
						new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
					)
				).toBe(MimeTypes.Png);
			});

			it("should detect TIFF little-endian", async () => {
				expect(await MimeTypeHelper.detect(new Uint8Array([0x49, 0x49, 0x2a, 0x00]))).toBe(
					MimeTypes.Tiff
				);
			});

			it("should detect TIFF big-endian", async () => {
				expect(await MimeTypeHelper.detect(new Uint8Array([0x4d, 0x4d, 0x00, 0x2a]))).toBe(
					MimeTypes.Tiff
				);
			});

			it("should detect WebP", async () => {
				const data = new Uint8Array(12);
				data.set([0x52, 0x49, 0x46, 0x46], 0); // RIFF
				data.set([0x57, 0x45, 0x42, 0x50], 8); // WEBP
				expect(await MimeTypeHelper.detect(data)).toBe(MimeTypes.WebP);
			});

			it("should detect ICO", async () => {
				expect(await MimeTypeHelper.detect(new Uint8Array([0x00, 0x00, 0x01, 0x00, 0x01]))).toBe(
					MimeTypes.Ico
				);
			});

			it("should detect AVIF", async () => {
				const data = new Uint8Array(12);
				data.set([0x66, 0x74, 0x79, 0x70], 4); // ftyp
				data.set([0x61, 0x76, 0x69, 0x66], 8); // avif
				expect(await MimeTypeHelper.detect(data)).toBe(MimeTypes.Avif);
			});

			it("should detect MP4 (isom brand)", async () => {
				const data = new Uint8Array(12);
				data.set([0x66, 0x74, 0x79, 0x70], 4); // ftyp
				data.set([0x69, 0x73, 0x6f, 0x6d], 8); // isom
				expect(await MimeTypeHelper.detect(data)).toBe(MimeTypes.Mp4);
			});

			it("should detect Quicktime", async () => {
				const data = new Uint8Array(12);
				data.set([0x66, 0x74, 0x79, 0x70], 4); // ftyp
				data.set([0x71, 0x74, 0x20, 0x20], 8); // qt
				expect(await MimeTypeHelper.detect(data)).toBe(MimeTypes.Quicktime);
			});

			it("should detect HEIC (heic brand)", async () => {
				const data = new Uint8Array(12);
				data.set([0x66, 0x74, 0x79, 0x70], 4); // ftyp
				data.set([0x68, 0x65, 0x69, 0x63], 8); // heic
				expect(await MimeTypeHelper.detect(data)).toBe(MimeTypes.Heic);
			});

			it("should detect HEIC (heif brand)", async () => {
				const data = new Uint8Array(12);
				data.set([0x66, 0x74, 0x79, 0x70], 4); // ftyp
				data.set([0x68, 0x65, 0x69, 0x66], 8); // heif
				expect(await MimeTypeHelper.detect(data)).toBe(MimeTypes.Heic);
			});
		});

		describe("fonts", () => {
			it("should detect WOFF", async () => {
				expect(await MimeTypeHelper.detect(new Uint8Array([0x77, 0x4f, 0x46, 0x46]))).toBe(
					MimeTypes.Woff
				);
			});

			it("should detect WOFF2", async () => {
				expect(await MimeTypeHelper.detect(new Uint8Array([0x77, 0x4f, 0x46, 0x32]))).toBe(
					MimeTypes.Woff2
				);
			});

			it("should detect TTF", async () => {
				expect(await MimeTypeHelper.detect(new Uint8Array([0x00, 0x01, 0x00, 0x00, 0x00]))).toBe(
					MimeTypes.Ttf
				);
			});

			it("should detect OTF", async () => {
				expect(await MimeTypeHelper.detect(new Uint8Array([0x4f, 0x54, 0x54, 0x4f]))).toBe(
					MimeTypes.Otf
				);
			});
		});

		describe("audio and video", () => {
			it("should detect WebM", async () => {
				expect(await MimeTypeHelper.detect(new Uint8Array([0x1a, 0x45, 0xdf, 0xa3]))).toBe(
					MimeTypes.Webm
				);
			});

			it("should detect OGG", async () => {
				expect(await MimeTypeHelper.detect(new Uint8Array([0x4f, 0x67, 0x67, 0x53]))).toBe(
					MimeTypes.OggAudio
				);
			});

			it("should detect WAV", async () => {
				const data = new Uint8Array(12);
				data.set([0x52, 0x49, 0x46, 0x46], 0); // RIFF
				data.set([0x57, 0x41, 0x56, 0x45], 8); // WAVE
				expect(await MimeTypeHelper.detect(data)).toBe(MimeTypes.Wav);
			});

			it("should detect MP3 via ID3 header", async () => {
				expect(await MimeTypeHelper.detect(new Uint8Array([0x49, 0x44, 0x33, 0x03]))).toBe(
					MimeTypes.Mp3
				);
			});

			it("should detect FLAC", async () => {
				expect(await MimeTypeHelper.detect(new Uint8Array([0x66, 0x4c, 0x61, 0x43]))).toBe(
					MimeTypes.Flac
				);
			});

			it("should detect MIDI", async () => {
				expect(await MimeTypeHelper.detect(new Uint8Array([0x4d, 0x54, 0x68, 0x64]))).toBe(
					MimeTypes.Midi
				);
			});
		});

		describe("binary", () => {
			it("should detect WebAssembly", async () => {
				expect(await MimeTypeHelper.detect(new Uint8Array([0x00, 0x61, 0x73, 0x6d]))).toBe(
					MimeTypes.Wasm
				);
			});

			it("should detect SQLite", async () => {
				expect(await MimeTypeHelper.detect(new Uint8Array([0x53, 0x51, 0x4c, 0x69]))).toBe(
					MimeTypes.Sqlite
				);
			});
		});

		describe("compression", () => {
			it("should detect Gzip", async () => {
				expect(await MimeTypeHelper.detect(new Uint8Array([0x1f, 0x8b, 0x08, 0x00]))).toBe(
					MimeTypes.Gzip
				);
			});

			it("should detect Zlib low compression", async () => {
				expect(await MimeTypeHelper.detect(new Uint8Array([0x78, 0x01, 0x00]))).toBe(
					MimeTypes.Zlib
				);
			});

			it("should detect Zlib default compression", async () => {
				expect(await MimeTypeHelper.detect(new Uint8Array([0x78, 0x9c, 0x00]))).toBe(
					MimeTypes.Zlib
				);
			});

			it("should detect Zlib best compression", async () => {
				expect(await MimeTypeHelper.detect(new Uint8Array([0x78, 0xda, 0x00]))).toBe(
					MimeTypes.Zlib
				);
			});

			it("should detect Bzip2", async () => {
				expect(await MimeTypeHelper.detect(new Uint8Array([0x42, 0x5a, 0x68, 0x39]))).toBe(
					MimeTypes.Bzip2
				);
			});

			it("should detect Zip", async () => {
				expect(await MimeTypeHelper.detect(new Uint8Array([0x50, 0x4b, 0x03, 0x04]))).toBe(
					MimeTypes.Zip
				);
			});

			it("should detect 7-Zip", async () => {
				expect(
					await MimeTypeHelper.detect(new Uint8Array([0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c]))
				).toBe(MimeTypes.SevenZip);
			});

			it("should detect RAR v1.5", async () => {
				expect(
					await MimeTypeHelper.detect(new Uint8Array([0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x00]))
				).toBe(MimeTypes.Rar);
			});

			it("should detect RAR v5", async () => {
				expect(
					await MimeTypeHelper.detect(
						new Uint8Array([0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x01, 0x00])
					)
				).toBe(MimeTypes.Rar);
			});
		});

		describe("documents", () => {
			it("should detect HTML with doctype", async () => {
				expect(
					await MimeTypeHelper.detect(enc.encode("<!DOCTYPE html><html><body></body></html>"))
				).toBe(MimeTypes.Html);
			});

			it("should detect HTML with lowercase doctype", async () => {
				expect(
					await MimeTypeHelper.detect(enc.encode("<!doctype html><html><body></body></html>"))
				).toBe(MimeTypes.Html);
			});

			it("should detect HTML via html tag scan", async () => {
				expect(
					await MimeTypeHelper.detect(enc.encode("<html><head></head><body></body></html>"))
				).toBe(MimeTypes.Html);
			});

			it("should detect PDF", async () => {
				expect(await MimeTypeHelper.detect(enc.encode("%PDF-1.4 content"))).toBe(MimeTypes.Pdf);
			});

			it("should detect RTF", async () => {
				expect(await MimeTypeHelper.detect(enc.encode("{\\rtf1\\ansi text}"))).toBe(MimeTypes.Rtf);
			});

			it("should detect DOCX", async () => {
				// Minimal ZIP with 'word/' path in the local file header
				const header = new Uint8Array([
					0x50,
					0x4b,
					0x03,
					0x04, // PK signature
					0x14,
					0x00,
					0x00,
					0x00,
					0x00,
					0x00, // version, flags, compression
					0x00,
					0x00,
					0x00,
					0x00, // mod time, date
					0x00,
					0x00,
					0x00,
					0x00, // CRC-32
					0x00,
					0x00,
					0x00,
					0x00, // compressed size
					0x00,
					0x00,
					0x00,
					0x00, // uncompressed size
					0x0d,
					0x00, // filename length = 13
					0x00,
					0x00 // extra field length
				]);
				const filename = enc.encode("word/document"); // 13 bytes
				const data = new Uint8Array(header.length + filename.length);
				data.set(header);
				data.set(filename, header.length);
				expect(await MimeTypeHelper.detect(data)).toBe(MimeTypes.Docx);
			});

			it("should detect XLSX", async () => {
				const header = new Uint8Array([
					0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
					0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0b, 0x00, 0x00, 0x00
				]);
				const filename = enc.encode("xl/workbook"); // 11 bytes
				const data = new Uint8Array(header.length + filename.length);
				data.set(header);
				data.set(filename, header.length);
				expect(await MimeTypeHelper.detect(data)).toBe(MimeTypes.Xlsx);
			});

			it("should detect PPTX", async () => {
				const header = new Uint8Array([
					0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
					0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00
				]);
				const filename = enc.encode("ppt/presentation"); // 16 bytes
				const data = new Uint8Array(header.length + filename.length);
				data.set(header);
				data.set(filename, header.length);
				expect(await MimeTypeHelper.detect(data)).toBe(MimeTypes.Pptx);
			});

			it("should detect plain ZIP when no OOXML marker is present", async () => {
				const header = new Uint8Array([
					0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
					0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00
				]);
				const filename = enc.encode("file.txt");
				const data = new Uint8Array(header.length + filename.length);
				data.set(header);
				data.set(filename, header.length);
				expect(await MimeTypeHelper.detect(data)).toBe(MimeTypes.Zip);
			});

			it("should detect SVG", async () => {
				expect(
					await MimeTypeHelper.detect(enc.encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>'))
				).toBe(MimeTypes.Svg);
			});

			it("should detect SVG with XML declaration preamble", async () => {
				expect(
					await MimeTypeHelper.detect(
						enc.encode('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"></svg>')
					)
				).toBe(MimeTypes.Svg);
			});

			it("should detect XML", async () => {
				expect(
					await MimeTypeHelper.detect(enc.encode('<?xml version="1.0" encoding="UTF-8"?><root/>'))
				).toBe(MimeTypes.Xml);
			});

			it("should detect XML with UTF-8 BOM", async () => {
				const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
				const content = enc.encode('<?xml version="1.0"?><root/>');
				const data = new Uint8Array(bom.length + content.length);
				data.set(bom);
				data.set(content, bom.length);
				expect(await MimeTypeHelper.detect(data)).toBe(MimeTypes.Xml);
			});
		});

		describe("text", () => {
			it("should detect JSON object", async () => {
				expect(await MimeTypeHelper.detect(enc.encode('{"key":"value"}'))).toBe(MimeTypes.Json);
			});

			it("should detect JSON array", async () => {
				expect(await MimeTypeHelper.detect(enc.encode("[1,2,3]"))).toBe(MimeTypes.Json);
			});

			it("should detect JSON with surrounding whitespace", async () => {
				expect(await MimeTypeHelper.detect(enc.encode('  { "a": 1 }  '))).toBe(MimeTypes.Json);
			});

			it("should return plain text for object brackets with invalid JSON content", async () => {
				expect(await MimeTypeHelper.detect(enc.encode("{ not valid json }"))).toBe(
					MimeTypes.PlainText
				);
			});

			it("should return plain text for object with mismatched end character", async () => {
				expect(await MimeTypeHelper.detect(enc.encode('{"key":"value"'))).toBe(MimeTypes.PlainText);
			});

			it("should return plain text for array with mismatched end character", async () => {
				expect(await MimeTypeHelper.detect(enc.encode("[1,2,3"))).toBe(MimeTypes.PlainText);
			});

			it("should detect plain text", async () => {
				expect(await MimeTypeHelper.detect(enc.encode("Hello, world!"))).toBe(MimeTypes.PlainText);
			});

			it("should return undefined for binary non-UTF-8 data", async () => {
				expect(
					await MimeTypeHelper.detect(new Uint8Array([0xc0, 0x80, 0xff, 0xfe]))
				).toBeUndefined();
			});
		});
	});

	describe("defaultExtension", () => {
		it("should return undefined for undefined mime type", () => {
			expect(MimeTypeHelper.defaultExtension(undefined)).toBeUndefined();
		});

		it("should return undefined for an unknown mime type", () => {
			expect(MimeTypeHelper.defaultExtension("application/unknown")).toBeUndefined();
		});

		it("should return the correct extension for plain text", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.PlainText)).toBe("txt");
		});

		it("should return the correct extension for JSON", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.Json)).toBe("json");
		});

		it("should return the correct extension for XML", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.Xml)).toBe("xml");
		});

		it("should return the correct extension for PDF", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.Pdf)).toBe("pdf");
		});

		it("should return the correct extension for SVG", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.Svg)).toBe("svg");
		});

		it("should return the correct extension for PNG", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.Png)).toBe("png");
		});

		it("should return the correct extension for JPEG", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.Jpeg)).toBe("jpeg");
		});

		it("should return the correct extension for GIF", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.Gif)).toBe("gif");
		});

		it("should return the correct extension for Gzip", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.Gzip)).toBe("gzip");
		});

		it("should return the correct extension for Zip", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.Zip)).toBe("zip");
		});

		it("should return the correct extension for WebP", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.WebP)).toBe("webp");
		});

		it("should return the correct extension for AVIF", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.Avif)).toBe("avif");
		});

		it("should return the correct extension for WebM", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.Webm)).toBe("webm");
		});

		it("should return the correct extension for MP4", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.Mp4)).toBe("mp4");
		});

		it("should return the correct extension for WOFF", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.Woff)).toBe("woff");
		});

		it("should return the correct extension for WOFF2", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.Woff2)).toBe("woff2");
		});

		it("should return the correct extension for HTML", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.Html)).toBe("html");
		});

		it("should return the correct extension for HEIC", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.Heic)).toBe("heic");
		});

		it("should return the correct extension for FLAC", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.Flac)).toBe("flac");
		});

		it("should return the correct extension for MIDI", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.Midi)).toBe("midi");
		});

		it("should return the correct extension for 7-Zip", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.SevenZip)).toBe("7z");
		});

		it("should return the correct extension for RAR", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.Rar)).toBe("rar");
		});

		it("should return the correct extension for SQLite", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.Sqlite)).toBe("sqlite");
		});

		it("should return the correct extension for RTF", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.Rtf)).toBe("rtf");
		});

		it("should return the correct extension for DOCX", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.Docx)).toBe("docx");
		});

		it("should return the correct extension for XLSX", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.Xlsx)).toBe("xlsx");
		});

		it("should return the correct extension for PPTX", () => {
			expect(MimeTypeHelper.defaultExtension(MimeTypes.Pptx)).toBe("pptx");
		});
	});
});
