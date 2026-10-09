// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { MessagePort } from "node:worker_threads";
import { nameof } from "@3sixty/nameof";
import { Is } from "./is.js";
import { SharedStore } from "./sharedStore.js";
import { GeneralError } from "../errors/generalError.js";
import { ObjectHelper } from "../helpers/objectHelper.js";
import type { ISharedObjectBufferOptions } from "../models/ISharedObjectBufferOptions.js";
import type { ISharedObjectBufferWorkerMessage } from "../models/ISharedObjectBufferWorkerMessage.js";
import { SharedObjectBufferMessageTypes } from "../models/sharedObjectBufferMessageTypes.js";

/**
 * Manages per-object SharedArrayBuffers that store objects as UTF-8 JSON.
 * Buffer layout: 4-byte Int32 header (current data byte length) followed by the JSON-encoded object.
 * Buffers are explicitly created with create and cached in SharedStore.
 * On a worker thread an existing buffer is fetched via a MessagePort handshake
 * (same protocol as Mutex) and cached locally.
 * Buffers grow automatically when the payload exceeds capacity; when the payload drops well below
 * capacity the buffer is replaced with a smaller one. The caller must hold the objectId-keyed Mutex
 * around every read and write. The main thread's worker message handler must forward messages to
 * both Mutex.handleWorkerMessage and SharedObjectBuffer.handleWorkerMessage.
 */
export class SharedObjectBuffer {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<SharedObjectBuffer>();

	/**
	 * Default payload capacity per object (1 MiB). The first caller that creates the buffer
	 * for an object determines its initial capacity; later callers that pass a different value
	 * are ignored.
	 */
	public static readonly DEFAULT_CAPACITY_BYTES = 1 * 1024 * 1024;

	/**
	 * Default upper bound for how large a buffer may grow (256 MiB).
	 * Override per-object via the maxCapacityBytes option on create.
	 */
	public static readonly MAX_CAPACITY_BYTES = 256 * 1024 * 1024;

	/**
	 * Bytes reserved for the data-length header at the start of each buffer.
	 * @internal
	 */
	private static readonly _HEADER_BYTES = 4;

	/**
	 * Multiplier applied to the current capacity when growing or sizing a replacement buffer.
	 * @internal
	 */
	private static readonly _GROW_FACTOR = 2;

	/**
	 * Fraction of payload capacity below which a buffer is replaced with a smaller one.
	 * A value of 0.25 means the buffer is shrunk when the payload is below 25 % of capacity.
	 * Shrinking only applies when the capacity already exceeds DEFAULT_CAPACITY_BYTES.
	 * @internal
	 */
	private static readonly _SHRINK_THRESHOLD = 0.25;

	/**
	 * SharedStore key under which the per-object buffer map lives on each thread.
	 * @internal
	 */
	private static readonly _STORE_KEY = "sharedObjectBuffers";

	/**
	 * Cached worker_threads module; undefined = not yet loaded, null = unavailable.
	 * @internal
	 */
	// false positive: this is a type not an actual import
	// eslint-disable-next-line @typescript-eslint/consistent-type-imports
	private static _workerThreadsModule: typeof import("node:worker_threads") | null | undefined;

	/**
	 * Create the buffer for the given objectId if it does not already exist.
	 * Must be called while holding Mutex.lock(objectId).
	 * @param objectId The object id that identifies the buffer.
	 * @param options Optional capacity configuration used when creating the buffer.
	 */
	public static async create(
		objectId: string,
		options?: ISharedObjectBufferOptions
	): Promise<void> {
		await SharedObjectBuffer.getOrFetchBuffer(objectId, options ?? {});
	}

	/**
	 * Read and decode the object stored for the given objectId.
	 * Must be called while holding Mutex.lock(objectId).
	 * @param objectId The object id that identifies the buffer.
	 * @returns The stored object, or undefined when nothing has been written yet.
	 */
	public static async read<T>(objectId: string): Promise<T | undefined> {
		const buf = await SharedObjectBuffer.getOrFetchBuffer(objectId);
		if (Is.undefined(buf)) {
			return undefined;
		}
		return SharedObjectBuffer.decode<T>(buf);
	}

	/**
	 * Encode and write the object into the buffer for the given objectId.
	 * The buffer must already exist, usually by calling create first.
	 * When the encoded payload exceeds the current buffer capacity the buffer is grown
	 * in-place via SharedArrayBuffer.grow so every thread with a reference sees the
	 * new size without any pointer swap. When the payload is smaller than
	 * _SHRINK_THRESHOLD of the current capacity and the capacity exceeds
	 * DEFAULT_CAPACITY_BYTES, the buffer is replaced with a smaller one on the calling thread.
	 * Must be called while holding Mutex.lock(objectId).
	 * @param objectId The object id that identifies the buffer.
	 * @param value The object to persist.
	 */
	public static async write<T>(objectId: string, value: T): Promise<void> {
		const encoded = ObjectHelper.toBytes(value);
		let buf = await SharedObjectBuffer.getOrFetchBuffer(objectId);

		if (Is.undefined(buf)) {
			throw new GeneralError(SharedObjectBuffer.CLASS_NAME, "notCreated", {
				objectId
			});
		}

		const payloadCapacity = buf.byteLength - SharedObjectBuffer._HEADER_BYTES;
		const maxPayloadCapacity = buf.maxByteLength - SharedObjectBuffer._HEADER_BYTES;

		if (encoded.length > payloadCapacity) {
			// Grow the buffer in-place. SharedArrayBuffer.grow is atomic: all threads that
			// hold a reference see the enlarged buffer without a pointer swap.
			const newPayloadCapacity = Math.max(
				encoded.length,
				payloadCapacity * SharedObjectBuffer._GROW_FACTOR
			);
			const newByteLength = Math.min(
				SharedObjectBuffer._HEADER_BYTES + newPayloadCapacity,
				buf.maxByteLength
			);
			if (encoded.length > newByteLength - SharedObjectBuffer._HEADER_BYTES) {
				throw new GeneralError(SharedObjectBuffer.CLASS_NAME, "capacityExceeded", {
					objectId,
					required: encoded.length,
					capacity: maxPayloadCapacity
				});
			}
			buf.grow(newByteLength);
		} else if (
			payloadCapacity > SharedObjectBuffer.DEFAULT_CAPACITY_BYTES &&
			encoded.length < payloadCapacity * SharedObjectBuffer._SHRINK_THRESHOLD
		) {
			// Replace with a smaller buffer when far below capacity. The caller writes
			// the payload into the returned buffer immediately after.
			buf = SharedObjectBuffer.shrinkBuffer(objectId, encoded.length, buf.maxByteLength);
		}

		new Uint8Array(buf, SharedObjectBuffer._HEADER_BYTES).set(encoded);
		Atomics.store(new Int32Array(buf, 0, 1), 0, encoded.length);
	}

	/**
	 * Remove the stored object and release the buffer for the given objectId.
	 * The entry is deleted from the local cache so subsequent reads or writes will
	 * create or fetch a fresh buffer. Worker threads that have cached the old buffer
	 * reference continue using it until they restart or re-request via the worker protocol.
	 * Must be called while holding Mutex.lock(objectId).
	 * @param objectId The object id that identifies the buffer.
	 */
	public static remove(objectId: string): void {
		delete SharedObjectBuffer.getBuffers()[objectId];
	}

	/**
	 * Inspect a message from a worker thread and, if it is a SharedObjectBuffer
	 * buffer-fetch request, respond to it synchronously.
	 * Call this from the main thread's worker message handler alongside
	 * Mutex.handleWorkerMessage.
	 * @param msg The raw message received from the worker.
	 * @returns True if the message was a SharedObjectBuffer protocol message, false otherwise.
	 */
	public static handleWorkerMessage(msg: unknown): boolean {
		if (
			!Is.object<ISharedObjectBufferWorkerMessage>(msg) ||
			msg.type !== SharedObjectBufferMessageTypes.GetBuffer
		) {
			return false;
		}

		const {
			objectId: objectName,
			port,
			signal,
			options
		} = msg as ISharedObjectBufferWorkerMessage & {
			port: MessagePort;
		};

		const buf = Is.object(options)
			? SharedObjectBuffer.getOrCreateBuffer(objectName, options)
			: SharedObjectBuffer.getBuffers()[objectName];

		// Deliver the buffer before waking the worker so it is in the port's receive
		// queue when Atomics.wait returns (same ordering guarantee as Mutex).
		port.postMessage({ buffer: buf });
		Atomics.notify(new Int32Array(signal), 0, 1);
		port.close();

		return true;
	}

	/**
	 * Decode the object from a SharedArrayBuffer.
	 * @param buf The SharedArrayBuffer to decode.
	 * @returns The decoded object, or undefined when nothing has been written.
	 * @internal
	 */
	private static decode<T>(buf: SharedArrayBuffer): T | undefined {
		const dataLen = Atomics.load(new Int32Array(buf, 0, 1), 0);
		if (dataLen === 0) {
			return undefined;
		}
		const bytes = new Uint8Array(buf, SharedObjectBuffer._HEADER_BYTES, dataLen);
		return ObjectHelper.fromBytes<T>(bytes);
	}

	/**
	 * Return the cached buffer for the object, creating or fetching it if needed.
	 * Applies a double-check after the async loadWorkerThreads call to handle the
	 * case where another coroutine populated the cache while this one yielded.
	 * @param objectId The object id that identifies the buffer.
	 * @param options Optional capacity configuration when creating the buffer.
	 * @returns The SharedArrayBuffer for the object.
	 * @internal
	 */
	private static async getOrFetchBuffer(
		objectId: string,
		options?: ISharedObjectBufferOptions
	): Promise<SharedArrayBuffer | undefined> {
		const buffers = SharedObjectBuffer.getBuffers();

		if (!Is.undefined(buffers[objectId])) {
			return buffers[objectId];
		}

		const wt = await SharedObjectBuffer.loadWorkerThreads();

		// Re-check after the await: another coroutine may have populated the cache.
		if (!Is.undefined(buffers[objectId])) {
			return buffers[objectId];
		}

		if (Is.empty(wt) || wt.isMainThread) {
			if (!Is.object(options)) {
				return buffers[objectId];
			}
			return SharedObjectBuffer.getOrCreateBuffer(objectId, options);
		}

		// Worker thread: synchronously request the SharedArrayBuffer from the main thread.
		if (Is.empty(wt.parentPort)) {
			throw new GeneralError(SharedObjectBuffer.CLASS_NAME, "bufferFetchFailed", { objectId });
		}

		const { port1, port2 } = new wt.MessageChannel();
		const signal = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));

		const request: ISharedObjectBufferWorkerMessage = {
			type: SharedObjectBufferMessageTypes.GetBuffer,
			objectId,
			signal: signal.buffer,
			port: port2,
			options
		};

		wt.parentPort.postMessage(request, [port2]);

		try {
			// Block until the main thread posts the buffer and fires Atomics.notify.
			// The response is guaranteed to be in port1's queue when wait returns because
			// port.postMessage executes before Atomics.notify on the main thread.
			const waitResult = Atomics.wait(signal, 0, 0, 30_000);
			if (waitResult === "timed-out") {
				throw new GeneralError(SharedObjectBuffer.CLASS_NAME, "bufferFetchFailed", { objectId });
			}

			const response = wt.receiveMessageOnPort(port1) as {
				message: { buffer?: SharedArrayBuffer };
			} | null;

			if (Is.empty(response)) {
				throw new GeneralError(SharedObjectBuffer.CLASS_NAME, "bufferFetchFailed", { objectId });
			}

			if (Is.undefined(response.message.buffer)) {
				return undefined;
			}

			buffers[objectId] = response.message.buffer;
			return buffers[objectId];
		} finally {
			port1.close();
		}
	}

	/**
	 * Get or create the growable buffer on the main thread (or in a fork-mode process).
	 * @param objectId The object id that identifies the buffer.
	 * @param options Optional capacity configuration for new buffers.
	 * @returns The existing or newly created SharedArrayBuffer.
	 * @internal
	 */
	private static getOrCreateBuffer(
		objectId: string,
		options?: ISharedObjectBufferOptions
	): SharedArrayBuffer {
		const buffers = SharedObjectBuffer.getBuffers();
		if (Is.undefined(buffers[objectId])) {
			const maxCapacity = options?.maxCapacityBytes ?? SharedObjectBuffer.MAX_CAPACITY_BYTES;
			const initialCapacity = Math.min(
				options?.initialCapacityBytes ?? SharedObjectBuffer.DEFAULT_CAPACITY_BYTES,
				maxCapacity
			);
			buffers[objectId] = new SharedArrayBuffer(
				SharedObjectBuffer._HEADER_BYTES + initialCapacity,
				{
					maxByteLength: SharedObjectBuffer._HEADER_BYTES + maxCapacity
				}
			);
		}
		return buffers[objectId];
	}

	/**
	 * Create a new smaller SharedArrayBuffer, register it in SharedStore, and return it.
	 * The new buffer is empty; write writes the current payload into it immediately
	 * after this call returns. Callers on other threads that have cached the old buffer
	 * reference continue using it until they restart or re-request via the worker protocol.
	 * @param objectId The object id that identifies the buffer.
	 * @param dataLen Byte length of the payload that will be written next.
	 * @param maxByteLength The maxByteLength to preserve from the old buffer.
	 * @returns The new, smaller SharedArrayBuffer registered in SharedStore.
	 * @internal
	 */
	private static shrinkBuffer(
		objectId: string,
		dataLen: number,
		maxByteLength: number
	): SharedArrayBuffer {
		const newCapacity = Math.max(
			dataLen * SharedObjectBuffer._GROW_FACTOR,
			SharedObjectBuffer.DEFAULT_CAPACITY_BYTES
		);
		const newBuf = new SharedArrayBuffer(SharedObjectBuffer._HEADER_BYTES + newCapacity, {
			maxByteLength
		});
		SharedObjectBuffer.getBuffers()[objectId] = newBuf;
		return newBuf;
	}

	/**
	 * Return the per-thread buffer map from SharedStore, creating it if absent.
	 * @returns The map of object id to SharedArrayBuffer.
	 * @internal
	 */
	private static getBuffers(): { [objectId: string]: SharedArrayBuffer } {
		return SharedStore.get<{ [objectId: string]: SharedArrayBuffer }>(
			SharedObjectBuffer._STORE_KEY,
			() => ({})
		);
	}

	/**
	 * Lazily load node:worker_threads, returning null in environments where it is unavailable.
	 * @returns The worker_threads module or null.
	 * @internal
	 */
	// false positive: this is a type not an actual import
	// eslint-disable-next-line @typescript-eslint/consistent-type-imports
	private static async loadWorkerThreads(): Promise<typeof import("node:worker_threads") | null> {
		if (SharedObjectBuffer._workerThreadsModule === undefined) {
			try {
				SharedObjectBuffer._workerThreadsModule = await import("node:worker_threads");
			} catch {
				SharedObjectBuffer._workerThreadsModule = null;
			}
		}
		return SharedObjectBuffer._workerThreadsModule;
	}
}
