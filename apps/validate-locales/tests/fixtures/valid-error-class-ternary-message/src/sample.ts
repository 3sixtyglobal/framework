// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

declare class ConflictError extends Error {
	constructor(source: string, key: string, entityId: string);
}

export class FileEntityStorageConnector {
	public static readonly CLASS_NAME = "FileEntityStorageConnector";

	public update(entityId: string, hasVersionCheck: boolean): void {
		throw new ConflictError(
			FileEntityStorageConnector.CLASS_NAME,
			hasVersionCheck ? "optimisticLockFailed" : "conditionFailed",
			entityId
		);
	}
}
