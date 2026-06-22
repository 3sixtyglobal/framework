// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
/* eslint-disable no-mixed-operators */
import { GeneralError } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import { QRDataBase } from "./qrDataBase.js";
import type { BitBuffer } from "../helpers/bitBuffer.js";
import { QRDataMode } from "../models/qrDataMode.js";

/**
 * QR Data for representing a number.
 * Based on https://github.com/kazuhikoarase/qrcode-generator/ .
 */
export class QRNumber extends QRDataBase {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<QRNumber>();

	/**
	 * Create a new instance of QRNumber.
	 * @param data The data for the qr number.
	 */
	constructor(data: string) {
		super(QRDataMode.Number, data);
	}

	/**
	 * Get the length of the data.
	 * @returns The length of the data.
	 */
	public getLength(): number {
		return this.getData().length;
	}

	/**
	 * Write data into the buffer.
	 * @param buffer The buffer to write into.
	 */
	public write(buffer: BitBuffer): void {
		const data = this.getData();

		let i = 0;

		while (i + 2 < data.length) {
			// eslint-disable-next-line unicorn/prefer-string-slice
			buffer.put(this.strToNum(data.substring(i, i + 3)), 10);
			i += 3;
		}

		if (i < data.length) {
			if (data.length - i === 1) {
				buffer.put(this.strToNum(data.substring(i, i + 1)), 4);
			} else if (data.length - i === 2) {
				// eslint-disable-next-line unicorn/prefer-string-slice
				buffer.put(this.strToNum(data.substring(i, i + 2)), 7);
			}
		}
	}

	/**
	 * Convert a numeric string segment into its numeric value.
	 * @param s The numeric string segment.
	 * @returns The parsed numeric value.
	 * @internal
	 */
	private strToNum(s: string): number {
		let num = 0;
		for (let i = 0; i < s.length; i++) {
			num = num * 10 + this.charToNum(s.charAt(i));
		}
		return num;
	}

	/**
	 * Convert a numeric QR character into its encoded digit value.
	 * @param c The character to convert.
	 * @returns The numeric value of the character.
	 * @throws GeneralError if the character is not a decimal digit.
	 * @internal
	 */
	private charToNum(c: string): number {
		if (c >= "0" && c <= "9") {
			return c.charCodeAt(0) - "0".charCodeAt(0);
		}
		throw new GeneralError(QRNumber.CLASS_NAME, "illegalCharacter", { value: c });
	}
}
