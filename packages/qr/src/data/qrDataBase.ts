// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { GeneralError } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import type { BitBuffer } from "../helpers/bitBuffer";
import { QRDataMode } from "../models/qrDataMode";

/**
 * Base class for storing QR Data.
 * Based on https://github.com/kazuhikoarase/qrcode-generator/ .
 */
export abstract class QRDataBase {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<QRDataBase>();

	/**
	 * @internal
	 */
	private readonly _mode: QRDataMode;

	/**
	 * @internal
	 */
	private readonly _data: string;

	/**
	 * Create a new instance of QRDataBase.
	 * @param mode The mode for the data.
	 * @param data The data.
	 */
	constructor(mode: QRDataMode, data: string) {
		this._mode = mode;
		this._data = data;
	}

	/**
	 * Get the data mode.
	 * @returns The data mode.
	 */
	public getMode(): QRDataMode {
		return this._mode;
	}

	/**
	 * Get the data for the qr.
	 * @returns The data.
	 */
	public getData(): string {
		return this._data;
	}

	/**
	 * Get the length in bits of the data.
	 * @param typeNumber The type number to get the length for.
	 * @returns The length in bits.
	 * @throws Error if the typeNumber if invalid.
	 */
	public getLengthInBits(typeNumber: number): number {
		if (typeNumber >= 1 && typeNumber < 10) {
			switch (this._mode) {
				case QRDataMode.Number:
					return 10;
				case QRDataMode.AlphaNumeric:
					return 9;
				case QRDataMode.Byte8:
					return 8;
				default:
					throw new GeneralError(QRDataBase.CLASS_NAME, "invalidMode", {
						typeNumber,
						mode: this._mode
					});
			}
		} else if (typeNumber < 27) {
			switch (this._mode) {
				case QRDataMode.Number:
					return 12;
				case QRDataMode.AlphaNumeric:
					return 11;
				case QRDataMode.Byte8:
					return 16;
				default:
					throw new GeneralError(QRDataBase.CLASS_NAME, "invalidMode", {
						typeNumber,
						mode: this._mode
					});
			}
		} else if (typeNumber < 41) {
			switch (this._mode) {
				case QRDataMode.Number:
					return 14;
				case QRDataMode.AlphaNumeric:
					return 13;
				case QRDataMode.Byte8:
					return 16;
				default:
					throw new GeneralError(QRDataBase.CLASS_NAME, "invalidMode", {
						typeNumber,
						mode: this._mode
					});
			}
		} else {
			throw new GeneralError(QRDataBase.CLASS_NAME, "invalidTypeNumber", { typeNumber });
		}
	}

	/**
	 * Get the length of the data.
	 * @returns The length of the data.
	 */
	public abstract getLength(): number;

	/**
	 * Write data into the buffer.
	 * @param buffer The buffer to write into.
	 */
	public abstract write(buffer: BitBuffer): void;
}
