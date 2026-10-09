// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { MessageChannel, Worker, receiveMessageOnPort } from "node:worker_threads";
import { ObjectHelper } from "../../src/helpers/objectHelper.js";
import { SharedObjectBufferMessageTypes } from "../../src/models/sharedObjectBufferMessageTypes.js";
import { Is } from "../../src/utils/is.js";
import { SharedObjectBuffer } from "../../src/utils/sharedObjectBuffer.js";
import { SharedStore } from "../../src/utils/sharedStore.js";

// Mirror the internal layout constants for test assertions.
const HEADER_BYTES = 4;
const DEFAULT_CAP = SharedObjectBuffer.DEFAULT_CAPACITY_BYTES;

// A worker blocked in an unbounded Atomics.wait never exits, which would hang the
// suite until the vitest timeout. Every wait in the worker scripts below is bounded
// and the test side terminates any worker which has not exited, so a starved worker
// fails the test quickly instead of wedging it.
// The worker side wait is deliberately shorter than the test side timeout, so a worker
// which is never serviced times out first and reports why, rather than the test giving
// up at the same instant and hiding the cause.
const WORKER_WAIT_MS = 5000;
const WORKER_EXIT_TIMEOUT_MS = 20000;

/**
 * Wait for workers to exit, terminating any which have not.
 * @param exited Exit promises, registered when each worker was created so an early exit is not missed.
 * @param workers The workers those promises belong to.
 * @param errors Errors reported by the workers, surfaced so the cause is visible.
 */
async function waitForWorkerExits(
	exited: Promise<void>[],
	workers: Worker[],
	errors: string[] = []
): Promise<void> {
	let timer: ReturnType<typeof setTimeout> | undefined;
	const timedOut = new Promise<boolean>(resolve => {
		timer = setTimeout(() => resolve(true), WORKER_EXIT_TIMEOUT_MS);
	});

	const didTimeOut = await Promise.race([Promise.all(exited).then(() => false), timedOut]);
	clearTimeout(timer);

	if (didTimeOut) {
		await Promise.all(
			workers.map(async worker => {
				await worker.terminate();
			})
		);
		throw new Error(`Workers did not exit within ${WORKER_EXIT_TIMEOUT_MS}ms`);
	}

	if (errors.length > 0) {
		throw new Error(`A worker reported an error: ${errors[0]}`);
	}
}

/**
 * Start a worker from an inline script, registering for its exit straight away so an
 * early exit is not missed.
 * @param script The worker script.
 * @returns The worker and a promise which resolves when it exits.
 */
function startWorker(script: string): { worker: Worker; exited: Promise<void> } {
	const worker = new Worker(script, { eval: true });
	const exited = new Promise<void>(resolve => {
		worker.on("exit", () => resolve());
	});
	return { worker, exited };
}

/**
 * Wait for a single worker to exit, terminating it if it does not.
 * @param worker The worker to wait for.
 * @param exited The exit promise registered when the worker was started.
 */
async function waitForWorkerExit(worker: Worker, exited: Promise<void>): Promise<void> {
	await waitForWorkerExits([exited], [worker]);
}

/**
 * Wait for a message from a worker, failing if the worker errors or exits first, so a
 * starved worker fails the test straight away instead of hanging until the vitest timeout.
 * @param worker The worker to listen to.
 * @param isMatch Returns true for the message being waited for.
 * @returns The matching message.
 */
async function waitForWorkerMessage<T>(
	worker: Worker,
	isMatch: (msg: unknown) => boolean
): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		worker.on("message", (msg: unknown) => {
			if (isMatch(msg)) {
				resolve(msg as T);
			}
		});
		worker.on("error", err => {
			reject(new Error(`A worker reported an error: ${String(err)}`));
		});
		worker.on("exit", code => {
			reject(new Error(`Worker exited with code ${code} before sending the expected message`));
		});
	});
}
const MAX_CAP = SharedObjectBuffer.MAX_CAPACITY_BYTES;

// Access the internal per-thread buffer map that SharedObjectBuffer stores in SharedStore.
const getBuffers = (): { [objectId: string]: SharedArrayBuffer } => {
	let b = SharedStore.get<{ [objectId: string]: SharedArrayBuffer }>("sharedObjectBuffers");
	if (!b) {
		b = {};
		SharedStore.set("sharedObjectBuffers", b);
	}
	return b;
};

const clearBuffers = (): void => {
	SharedStore.set("sharedObjectBuffers", {});
};

const injectBuffer = (objectId: string, buf: SharedArrayBuffer): void => {
	getBuffers()[objectId] = buf;
};

const createAndWrite = async <T>(objectId: string, value: T): Promise<void> => {
	await SharedObjectBuffer.create(objectId);
	await SharedObjectBuffer.write(objectId, value);
};

const createAndWriteWithOptions = async <T>(
	objectId: string,
	value: T,
	initialCapacityBytes?: number,
	maxCapacityBytes?: number
): Promise<void> => {
	await SharedObjectBuffer.create(objectId, {
		initialCapacityBytes,
		maxCapacityBytes
	});
	await SharedObjectBuffer.write(objectId, value);
};

/**
 * Create a growable SharedArrayBuffer with the given payload capacity (header excluded).
 */
const makeGrowableBuffer = (payloadBytes: number): SharedArrayBuffer =>
	new SharedArrayBuffer(HEADER_BYTES + payloadBytes, {
		maxByteLength: HEADER_BYTES + MAX_CAP
	});

describe("SharedObjectBuffer", () => {
	afterEach(() => {
		clearBuffers();
	});

	describe("read", () => {
		test("returns undefined for an objectId that has never been written", async () => {
			expect(await SharedObjectBuffer.read("never-written")).toBeUndefined();
		});

		test("returns the object written by write", async () => {
			const value = { id: "a", v: 1 };
			await createAndWrite("basic-rw", value);
			expect(await SharedObjectBuffer.read<{ id: string; v: number }>("basic-rw")).toEqual(value);
		});

		test("reflects only the most recent write", async () => {
			await SharedObjectBuffer.create("overwrite");
			await SharedObjectBuffer.write("overwrite", { x: 1 });
			await SharedObjectBuffer.write("overwrite", { x: 2 });
			expect(await SharedObjectBuffer.read("overwrite")).toEqual({ x: 2 });
		});

		test("preserves nested object structure and arrays", async () => {
			const value = { nested: { arr: [1, 2, 3], flag: true, str: "hello" } };
			await createAndWrite("nested", value);
			expect(await SharedObjectBuffer.read("nested")).toEqual(value);
		});

		test("reads from different objectIds are independent", async () => {
			await createAndWrite("id-1", { n: 1 });
			await createAndWrite("id-2", { n: 2 });
			expect(await SharedObjectBuffer.read("id-1")).toEqual({ n: 1 });
			expect(await SharedObjectBuffer.read("id-2")).toEqual({ n: 2 });
		});
	});

	describe("write", () => {
		test("throws when writing before create is called", async () => {
			await expect(SharedObjectBuffer.write("not-created", { a: 1 })).rejects.toThrow();
		});

		test("creates an entry in SharedStore on create", async () => {
			expect(getBuffers()["new-entry"]).toBeUndefined();
			await SharedObjectBuffer.create("new-entry");
			expect(getBuffers()["new-entry"]).toBeInstanceOf(SharedArrayBuffer);
		});

		test("creates a buffer with DEFAULT_CAPACITY_BYTES when no options are supplied", async () => {
			await SharedObjectBuffer.create("default-cap-check");
			expect(getBuffers()["default-cap-check"].byteLength).toBe(HEADER_BYTES + DEFAULT_CAP);
		});

		test("creates a buffer with the specified initialCapacityBytes", async () => {
			await SharedObjectBuffer.create("custom-cap", { initialCapacityBytes: 512 });
			expect(getBuffers()["custom-cap"].byteLength).toBe(HEADER_BYTES + 512);
		});

		test("ignores initialCapacityBytes on subsequent creates when the buffer already exists", async () => {
			await SharedObjectBuffer.create("cap-ignored", { initialCapacityBytes: 64 });
			const original = getBuffers()["cap-ignored"];
			await SharedObjectBuffer.create("cap-ignored", { initialCapacityBytes: 999_999 });
			expect(getBuffers()["cap-ignored"]).toBe(original);
		});

		test("sets maxByteLength to HEADER_BYTES + MAX_CAPACITY_BYTES by default", async () => {
			await SharedObjectBuffer.create("default-max");
			expect(getBuffers()["default-max"].maxByteLength).toBe(HEADER_BYTES + MAX_CAP);
		});

		test("sets maxByteLength to HEADER_BYTES + maxCapacityBytes when specified", async () => {
			const maxCap = 8192;
			await SharedObjectBuffer.create("custom-max", { maxCapacityBytes: maxCap });
			expect(getBuffers()["custom-max"].maxByteLength).toBe(HEADER_BYTES + maxCap);
		});

		test("clamps initialCapacityBytes to maxCapacityBytes when initialCapacityBytes exceeds it", async () => {
			await SharedObjectBuffer.create("cap-clamp", {
				initialCapacityBytes: 4096,
				maxCapacityBytes: 512
			});
			const buf = getBuffers()["cap-clamp"];
			expect(buf.byteLength).toBe(HEADER_BYTES + 512);
			expect(buf.maxByteLength).toBe(HEADER_BYTES + 512);
		});

		test("stores the exact encoded byte-length in the header after a write", async () => {
			const value = { hello: "world" };
			await createAndWrite("header-len", value);
			const buf = getBuffers()["header-len"];
			const storedLen = Atomics.load(new Int32Array(buf, 0, 1), 0);
			expect(storedLen).toBe(ObjectHelper.toBytes(value).length);
		});

		test("grows the buffer in-place when the payload exceeds the current capacity", async () => {
			const smallCap = 10;
			injectBuffer("grow-inplace", makeGrowableBuffer(smallCap));

			await SharedObjectBuffer.write("grow-inplace", { data: "x".repeat(200) });

			expect(getBuffers()["grow-inplace"].byteLength).toBeGreaterThan(HEADER_BYTES + smallCap);
		});

		test("in-place growth preserves the same buffer object reference", async () => {
			const injected = makeGrowableBuffer(10);
			injectBuffer("grow-ref", injected);

			await SharedObjectBuffer.write("grow-ref", { data: "x".repeat(200) });

			expect(getBuffers()["grow-ref"]).toBe(injected);
		});

		test("data written after a grow is readable", async () => {
			injectBuffer("grow-readable", makeGrowableBuffer(10));

			const payload = { data: "y".repeat(200) };
			await SharedObjectBuffer.write("grow-readable", payload);
			expect(await SharedObjectBuffer.read("grow-readable")).toEqual(payload);
		});

		test("growth does not exceed maxCapacityBytes", async () => {
			const maxCap = 500;
			await createAndWriteWithOptions("bounded-grow", { a: 1 }, 10, maxCap);
			const value = { text: "y".repeat(100) };
			await SharedObjectBuffer.write("bounded-grow", value);
			expect(getBuffers()["bounded-grow"].byteLength).toBeLessThanOrEqual(HEADER_BYTES + maxCap);
			expect(await SharedObjectBuffer.read("bounded-grow")).toEqual(value);
		});

		test("throws capacityExceeded when the payload exceeds maxCapacityBytes", async () => {
			await createAndWriteWithOptions("small-max", { a: 1 }, 10, 50);
			await expect(
				SharedObjectBuffer.write("small-max", { data: "x".repeat(200) })
			).rejects.toThrow();
		});

		test("replaces the buffer with a smaller one when payload is well below capacity", async () => {
			// Inject a 2×DEFAULT buffer so the shrink threshold condition triggers.
			const largeCap = 2 * DEFAULT_CAP;
			injectBuffer("shrink-replace", makeGrowableBuffer(largeCap));

			await SharedObjectBuffer.write("shrink-replace", { x: 1 }); // far below 25 % of 2 MiB

			const newBuf = getBuffers()["shrink-replace"];
			expect(newBuf.byteLength).toBeLessThan(HEADER_BYTES + largeCap);
		});

		test("data is readable after a shrink replacement", async () => {
			injectBuffer("shrink-readable", makeGrowableBuffer(2 * DEFAULT_CAP));

			const value = { shrunk: true };
			await SharedObjectBuffer.write("shrink-readable", value);
			expect(await SharedObjectBuffer.read("shrink-readable")).toEqual(value);
		});

		test("shrunk buffer preserves the original maxByteLength", async () => {
			const largeCap = 2 * DEFAULT_CAP;
			const injected = makeGrowableBuffer(largeCap);
			injectBuffer("shrink-max", injected);

			await SharedObjectBuffer.write("shrink-max", { x: 1 });

			expect(getBuffers()["shrink-max"].maxByteLength).toBe(injected.maxByteLength);
		});

		test("does not shrink when capacity equals DEFAULT_CAPACITY_BYTES", async () => {
			// DEFAULT-sized buffer: payloadCapacity is NOT strictly greater than DEFAULT, so no shrink.
			await createAndWrite("no-shrink-default", { a: 1 });
			const original = getBuffers()["no-shrink-default"];
			await SharedObjectBuffer.write("no-shrink-default", { b: 1 });
			expect(getBuffers()["no-shrink-default"]).toBe(original);
		});

		test("does not grow when the payload fits within existing capacity", async () => {
			await createAndWrite("no-grow", { a: 1 });
			const sizeBefore = getBuffers()["no-grow"].byteLength;
			await SharedObjectBuffer.write("no-grow", { b: 2 });
			expect(getBuffers()["no-grow"].byteLength).toBe(sizeBefore);
		});
	});

	describe("remove", () => {
		test("deletes the buffer entry from SharedStore", async () => {
			await createAndWrite("remove-basic", { x: 1 });
			expect(getBuffers()["remove-basic"]).toBeInstanceOf(SharedArrayBuffer);
			SharedObjectBuffer.remove("remove-basic");
			expect(getBuffers()["remove-basic"]).toBeUndefined();
		});

		test("read returns undefined after remove because a fresh empty buffer is created", async () => {
			await createAndWrite("remove-read", { x: 1 });
			SharedObjectBuffer.remove("remove-read");
			expect(await SharedObjectBuffer.read("remove-read")).toBeUndefined();
		});

		test("a fresh buffer is created on the next write after remove", async () => {
			await createAndWrite("remove-rewrite", { a: 1 });
			const original = getBuffers()["remove-rewrite"];
			SharedObjectBuffer.remove("remove-rewrite");
			await SharedObjectBuffer.create("remove-rewrite");
			await SharedObjectBuffer.write("remove-rewrite", { b: 2 });
			// A brand-new buffer - not the same reference as before.
			expect(getBuffers()["remove-rewrite"]).not.toBe(original);
			expect(await SharedObjectBuffer.read("remove-rewrite")).toEqual({ b: 2 });
		});

		test("is a no-op when the objectId does not exist", () => {
			expect(() => SharedObjectBuffer.remove("remove-missing")).not.toThrow();
		});

		test("does not affect other objectIds", async () => {
			await createAndWrite("remove-other-a", { a: 1 });
			await createAndWrite("remove-other-b", { b: 2 });
			SharedObjectBuffer.remove("remove-other-a");
			expect(await SharedObjectBuffer.read("remove-other-b")).toEqual({ b: 2 });
		});
	});

	describe("handleWorkerMessage", () => {
		test("returns true for a valid GetBuffer message", () => {
			const { port1, port2 } = new MessageChannel();
			const signal = new Int32Array(new SharedArrayBuffer(4));

			const result = SharedObjectBuffer.handleWorkerMessage({
				type: SharedObjectBufferMessageTypes.GetBuffer,
				objectId: "hwm-basic",
				signal: signal.buffer,
				port: port2,
				options: {}
			});

			expect(result).toEqual(true);
			receiveMessageOnPort(port1);
			port1.close();
		});

		test("posts a SharedArrayBuffer on the provided port", () => {
			const { port1, port2 } = new MessageChannel();
			const signal = new Int32Array(new SharedArrayBuffer(4));

			SharedObjectBuffer.handleWorkerMessage({
				type: SharedObjectBufferMessageTypes.GetBuffer,
				objectId: "hwm-posts-sab",
				signal: signal.buffer,
				port: port2,
				options: {}
			});

			const msg = receiveMessageOnPort(port1);
			expect(msg?.message).toMatchObject({ buffer: expect.any(SharedArrayBuffer) });
			port1.close();
		});

		test("registers the buffer in SharedStore", () => {
			const { port1, port2 } = new MessageChannel();
			const signal = new Int32Array(new SharedArrayBuffer(4));

			SharedObjectBuffer.handleWorkerMessage({
				type: SharedObjectBufferMessageTypes.GetBuffer,
				objectId: "hwm-registers",
				signal: signal.buffer,
				port: port2,
				options: {}
			});

			expect(getBuffers()["hwm-registers"]).toBeInstanceOf(SharedArrayBuffer);
			receiveMessageOnPort(port1);
			port1.close();
		});

		test("returns the existing buffer when the objectId is already registered", () => {
			const existingBuf = makeGrowableBuffer(DEFAULT_CAP);
			Atomics.store(new Int32Array(existingBuf, 0, 1), 0, 42);
			injectBuffer("hwm-existing", existingBuf);

			const { port1, port2 } = new MessageChannel();
			const signal = new Int32Array(new SharedArrayBuffer(4));

			SharedObjectBuffer.handleWorkerMessage({
				type: SharedObjectBufferMessageTypes.GetBuffer,
				objectId: "hwm-existing",
				signal: signal.buffer,
				port: port2
			});

			const msg = receiveMessageOnPort(port1);
			const returned = (msg?.message as { buffer: SharedArrayBuffer }).buffer;
			// Shared memory: a write through one SAB view is visible through the other.
			Atomics.store(new Int32Array(existingBuf, 0, 1), 0, 99);
			expect(Atomics.load(new Int32Array(returned, 0, 1), 0)).toBe(99);
			port1.close();
		});

		test("creates a buffer sized to the provided initialCapacityBytes hint", () => {
			const { port1, port2 } = new MessageChannel();
			const signal = new Int32Array(new SharedArrayBuffer(4));

			SharedObjectBuffer.handleWorkerMessage({
				type: SharedObjectBufferMessageTypes.GetBuffer,
				objectId: "hwm-init-cap",
				signal: signal.buffer,
				port: port2,
				options: { initialCapacityBytes: 2048 }
			});

			expect(getBuffers()["hwm-init-cap"].byteLength).toBe(HEADER_BYTES + 2048);
			receiveMessageOnPort(port1);
			port1.close();
		});

		test("sets maxByteLength from the provided maxCapacityBytes hint", () => {
			const { port1, port2 } = new MessageChannel();
			const signal = new Int32Array(new SharedArrayBuffer(4));

			SharedObjectBuffer.handleWorkerMessage({
				type: SharedObjectBufferMessageTypes.GetBuffer,
				objectId: "hwm-max-cap",
				signal: signal.buffer,
				port: port2,
				options: { maxCapacityBytes: 4096 }
			});

			expect(getBuffers()["hwm-max-cap"].maxByteLength).toBe(HEADER_BYTES + 4096);
			receiveMessageOnPort(port1);
			port1.close();
		});

		test("fires Atomics.notify on the signal before returning", () => {
			const { port1, port2 } = new MessageChannel();
			const signalBuf = new SharedArrayBuffer(4);

			// The response arrives only after the notify executes; an absent message
			// would mean the notify (and thus postMessage) never ran.
			SharedObjectBuffer.handleWorkerMessage({
				type: SharedObjectBufferMessageTypes.GetBuffer,
				objectId: "hwm-notify",
				signal: signalBuf,
				port: port2,
				options: {}
			});

			expect(receiveMessageOnPort(port1)).not.toBeNull();
			port1.close();
		});

		test("closes the worker port after delivering the buffer", async () => {
			const { port1, port2 } = new MessageChannel();
			const signal = new Int32Array(new SharedArrayBuffer(4));

			const closed = new Promise<void>(resolve => {
				port1.on("close", resolve);
				port1.start();
			});

			SharedObjectBuffer.handleWorkerMessage({
				type: SharedObjectBufferMessageTypes.GetBuffer,
				objectId: "hwm-port-close",
				signal: signal.buffer,
				port: port2,
				options: {}
			});

			await closed;
			port1.close();
		});

		test("returns false for a message with an unrecognised type", () => {
			expect(SharedObjectBuffer.handleWorkerMessage({ type: "unrelated", objectId: "x" })).toEqual(
				false
			);
		});

		test("returns false for null", () => {
			expect(SharedObjectBuffer.handleWorkerMessage(null)).toEqual(false);
		});

		test("returns false for a plain string", () => {
			expect(SharedObjectBuffer.handleWorkerMessage("string")).toEqual(false);
		});

		test("returns false for a number", () => {
			expect(SharedObjectBuffer.handleWorkerMessage(42)).toEqual(false);
		});

		test("returns false for an object without a type field", () => {
			expect(SharedObjectBuffer.handleWorkerMessage({ objectId: "x" })).toEqual(false);
		});
	});

	describe("buffer caching", () => {
		test("repeated accesses with the same objectId return the same buffer reference", async () => {
			await createAndWrite("cache-same", { a: 1 });
			const buf1 = getBuffers()["cache-same"];
			await SharedObjectBuffer.read("cache-same");
			expect(getBuffers()["cache-same"]).toBe(buf1);
		});

		test("concurrent reads on the same missing key do not create a buffer", async () => {
			await Promise.all([
				SharedObjectBuffer.read("cache-race"),
				SharedObjectBuffer.read("cache-race"),
				SharedObjectBuffer.read("cache-race")
			]);
			expect(getBuffers()["cache-race"]).toBeUndefined();
		});

		test("concurrent reads on a new key all return undefined", async () => {
			const results = await Promise.all(
				Array.from({ length: 8 }, async () => SharedObjectBuffer.read("cache-concurrent"))
			);
			for (const r of results) {
				expect(r).toBeUndefined();
			}
		});

		test("N concurrent write calls on distinct keys each produce a readable result", async () => {
			const N = 8;
			await Promise.all(
				[...new Array(N).keys()].map(async i => {
					await SharedObjectBuffer.create(`cache-multi-${i}`);
					await SharedObjectBuffer.write(`cache-multi-${i}`, { i });
				})
			);
			for (let i = 0; i < N; i++) {
				const result = await SharedObjectBuffer.read<{ i: number }>(`cache-multi-${i}`);
				expect(result).toEqual({ i });
			}
		});
	});

	describe("threading", () => {
		// Inline worker: fetches the buffer via the SharedObjectBuffer protocol
		// using the raw MessagePort handshake, then reports byteLength and dataLen.
		const makeFetchAndReportScript = (objectId: string): string => `
			const { parentPort, MessageChannel, receiveMessageOnPort } = require("worker_threads");
			const { port1, port2 } = new MessageChannel();
			const signalBuf = new SharedArrayBuffer(4);
			const signal = new Int32Array(signalBuf);
			parentPort.postMessage(
				{
					type: "twin:sharedObjectBuffer:getBuffer",
					objectId: "${objectId}",
					signal: signalBuf,
					port: port2,
					createIfMissing: false
				},
				[port2]
			);
			if (Atomics.wait(signal, 0, 0, ${WORKER_WAIT_MS}) === "timed-out") {
				throw new Error("Timed out waiting for the buffer from the main thread");
			}
			const resp = receiveMessageOnPort(port1);
			port1.close();
			const buf = resp.message.buffer;
			const dataLen = Atomics.load(new Int32Array(buf, 0, 1), 0);
			parentPort.postMessage({ byteLength: buf.byteLength, dataLen });
		`;

		test("worker receives a SharedArrayBuffer via the protocol handshake", async () => {
			const objectId = "thread-size";
			await createAndWrite(objectId, { value: 1 });
			const expectedLen = Atomics.load(new Int32Array(getBuffers()[objectId], 0, 1), 0);

			const { worker, exited } = startWorker(makeFetchAndReportScript(objectId));
			worker.on("message", (msg: unknown) => {
				SharedObjectBuffer.handleWorkerMessage(msg);
			});

			const report = await waitForWorkerMessage<{ byteLength: number; dataLen: number }>(
				worker,
				msg => Is.object(msg) && "byteLength" in msg
			);
			await waitForWorkerExit(worker, exited);

			expect(report.byteLength).toBe(getBuffers()[objectId].byteLength);
			expect(report.dataLen).toBe(expectedLen);
		});

		test("worker observes data written by the main thread (non-zero dataLen)", async () => {
			const objectId = "thread-main-to-worker";
			await createAndWrite(objectId, { signal: 42 });

			const { worker, exited } = startWorker(makeFetchAndReportScript(objectId));
			worker.on("message", (msg: unknown) => {
				SharedObjectBuffer.handleWorkerMessage(msg);
			});

			const report = await waitForWorkerMessage<{ dataLen: number }>(
				worker,
				msg => Is.object(msg) && "dataLen" in msg
			);
			await waitForWorkerExit(worker, exited);

			expect(report.dataLen).toBeGreaterThan(0);
		});

		test("worker is not left waiting when the main thread responds before it waits", async () => {
			// The main thread can handle the request before the worker reaches Atomics.wait.
			// The worker pauses after posting to force that ordering, the response must still
			// be seen rather than the worker blocking until it times out (lost wakeup).
			const objectId = "thread-early-response";
			await createAndWrite(objectId, { early: true });

			const script = `
				const { parentPort, MessageChannel, receiveMessageOnPort } = require("worker_threads");
				const { port1, port2 } = new MessageChannel();
				const signalBuf = new SharedArrayBuffer(4);
				const signal = new Int32Array(signalBuf);
				parentPort.postMessage(
					{ type: "twin:sharedObjectBuffer:getBuffer", objectId: "${objectId}", signal: signalBuf, port: port2 },
					[port2]
				);
				Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
				const waitResult = Atomics.wait(signal, 0, 0, ${WORKER_WAIT_MS});
				const resp = receiveMessageOnPort(port1);
				port1.close();
				const dataLen = resp ? Atomics.load(new Int32Array(resp.message.buffer, 0, 1), 0) : 0;
				parentPort.postMessage({ waitResult, dataLen });
			`;

			const { worker, exited } = startWorker(script);
			worker.on("message", (msg: unknown) => {
				SharedObjectBuffer.handleWorkerMessage(msg);
			});

			const report = await waitForWorkerMessage<{ waitResult: string; dataLen: number }>(
				worker,
				msg => Is.object(msg) && "waitResult" in msg
			);
			await waitForWorkerExit(worker, exited);

			expect(report.waitResult).toBe("not-equal");
			expect(report.dataLen).toBeGreaterThan(0);
		});

		test("worker write into the shared buffer is visible to the main thread", async () => {
			const objectId = "thread-worker-to-main";
			await SharedObjectBuffer.create(objectId);

			// Worker fetches the buffer and writes the value 77 directly into the header slot.
			const writeScript = `
				const { parentPort, MessageChannel, receiveMessageOnPort } = require("worker_threads");
				const { port1, port2 } = new MessageChannel();
				const signalBuf = new SharedArrayBuffer(4);
				const signal = new Int32Array(signalBuf);
				parentPort.postMessage(
					{ type: "twin:sharedObjectBuffer:getBuffer", objectId: "${objectId}", signal: signalBuf, port: port2, createIfMissing: false },
					[port2]
				);
				if (Atomics.wait(signal, 0, 0, ${WORKER_WAIT_MS}) === "timed-out") {
					throw new Error("Timed out waiting for the buffer from the main thread");
				}
				const resp = receiveMessageOnPort(port1);
				port1.close();
				const buf = resp.message.buffer;
				Atomics.store(new Int32Array(buf, 0, 1), 0, 77);
				parentPort.postMessage("done");
			`;

			const { worker, exited } = startWorker(writeScript);
			worker.on("message", (msg: unknown) => {
				SharedObjectBuffer.handleWorkerMessage(msg);
			});

			await waitForWorkerMessage<string>(worker, msg => msg === "done");
			await waitForWorkerExit(worker, exited);

			const mainBuf = getBuffers()[objectId];
			expect(mainBuf).toBeInstanceOf(SharedArrayBuffer);
			expect(Atomics.load(new Int32Array(mainBuf, 0, 1), 0)).toBe(77);
		});

		test("multiple workers fetching the same objectId all see the same dataLen", async () => {
			const objectId = "thread-multi-fetch";
			await createAndWrite(objectId, { v: 1 });
			const mainLen = Atomics.load(new Int32Array(getBuffers()[objectId], 0, 1), 0);

			const workerCount = 4;
			const reports: { dataLen: number }[] = [];
			const exited: Promise<void>[] = [];
			const workers: Worker[] = [];
			const errors: string[] = [];

			for (let i = 0; i < workerCount; i++) {
				const w = new Worker(makeFetchAndReportScript(objectId), { eval: true });
				workers.push(w);
				w.on("error", err => errors.push(String(err)));
				w.on("message", (msg: unknown) => {
					SharedObjectBuffer.handleWorkerMessage(msg);
					if (Is.object(msg) && "dataLen" in msg) {
						reports.push(msg as { dataLen: number });
					}
				});
				exited.push(new Promise<void>(resolve => w.on("exit", resolve)));
			}

			await waitForWorkerExits(exited, workers, errors);

			expect(reports).toHaveLength(workerCount);
			for (const r of reports) {
				expect(r.dataLen).toBe(mainLen);
			}
		});

		test("Atomics.wait returns timed-out when the main thread never handles the message", async () => {
			// Exercises the timeout path that SharedObjectBuffer.getOrFetchBuffer relies on.
			// Uses a 100 ms wait instead of the hardcoded 30 s to keep the test suite fast.
			const script = `
				const { parentPort, MessageChannel } = require("worker_threads");
				const { port1, port2 } = new MessageChannel();
				const signalBuf = new SharedArrayBuffer(4);
				const signal = new Int32Array(signalBuf);
				parentPort.postMessage(
					{
						type: "twin:sharedObjectBuffer:getBuffer",
						objectId: "wait-timeout-test",
						signal: signalBuf,
						port: port2,
						createIfMissing: false
					},
					[port2]
				);
				const waitResult = Atomics.wait(signal, 0, 0, 100);
				parentPort.postMessage({ waitResult });
				port1.close();
			`;

			const { worker, exited } = startWorker(script);
			// Intentionally NOT wiring handleWorkerMessage.

			const result = await waitForWorkerMessage<{ waitResult: string }>(
				worker,
				msg => Is.object(msg) && "waitResult" in msg
			);

			await waitForWorkerExit(worker, exited);
			expect(result.waitResult).toBe("timed-out");
		});
	});
});
