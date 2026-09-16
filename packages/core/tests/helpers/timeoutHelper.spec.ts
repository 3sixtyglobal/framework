// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { GeneralError } from "../../src/errors/generalError.js";
import { TimeoutHelper } from "../../src/helpers/timeoutHelper.js";

/**
 * Create a promise which resolves after the given delay.
 * @param delayMs The delay in milliseconds.
 * @param value The value to resolve with.
 * @returns The delayed promise.
 */
async function delayedResolve<T>(delayMs: number, value: T): Promise<T> {
	return new Promise<T>(resolve => {
		setTimeout(() => resolve(value), delayMs);
	});
}

/**
 * Create a promise which rejects after the given delay.
 * @param delayMs The delay in milliseconds.
 * @param error The error to reject with.
 * @returns The delayed promise.
 */
async function delayedReject(delayMs: number, error: Error): Promise<never> {
	return new Promise<never>((resolve, reject) => {
		setTimeout(() => reject(error), delayMs);
	});
}

/**
 * Throw the timeout error used by most of the tests.
 * @param properties Additional properties to include in the error.
 * @throws GeneralError always.
 */
function throwTimedOut(properties?: { [id: string]: unknown }): never {
	throw new GeneralError("source", "timedOut", properties);
}

describe("TimeoutHelper", () => {
	test("can return the operation result when it settles before the timeout", async () => {
		const result = await TimeoutHelper.withTimeout(delayedResolve(5, "done"), 1000, () =>
			throwTimedOut()
		);
		expect(result).toEqual("done");
	});

	test("can return the operation result when it is already resolved", async () => {
		const result = await TimeoutHelper.withTimeout(Promise.resolve("done"), 1000, () =>
			throwTimedOut()
		);
		expect(result).toEqual("done");
	});

	test("can propagate the operation error when it rejects before the timeout", async () => {
		await expect(
			TimeoutHelper.withTimeout(delayedReject(5, new Error("failed")), 1000, () => throwTimedOut())
		).rejects.toThrow("failed");
	});

	test("can fail with the error thrown by the callback when the operation does not settle", async () => {
		await expect(
			TimeoutHelper.withTimeout(delayedResolve(1000, "done"), 10, () =>
				throwTimedOut({ timeoutMs: 10 })
			)
		).rejects.toMatchObject({
			name: "GeneralError",
			source: "source",
			message: "source.timedOut",
			properties: { timeoutMs: 10 }
		});
	});

	test("can fail with the error thrown by the callback when the operation never settles", async () => {
		await expect(
			TimeoutHelper.withTimeout(new Promise<string>(() => {}), 10, () => throwTimedOut())
		).rejects.toMatchObject({
			name: "GeneralError",
			message: "source.timedOut"
		});
	});

	test("can call the callback only when the wait expires", async () => {
		const onTimeout = vi.fn(() => throwTimedOut());

		await TimeoutHelper.withTimeout(delayedResolve(5, "done"), 1000, onTimeout);

		expect(onTimeout).not.toHaveBeenCalled();

		await expect(
			TimeoutHelper.withTimeout(delayedResolve(1000, "done"), 10, onTimeout)
		).rejects.toThrow();

		expect(onTimeout).toHaveBeenCalledTimes(1);
	});

	test("can complete with the fallback value when the callback returns instead of throwing", async () => {
		const result = await TimeoutHelper.withTimeout(
			delayedResolve(1000, "done"),
			10,
			() => "fallback"
		);
		expect(result).toEqual("fallback");
	});

	test("can wait indefinitely when the timeout is zero", async () => {
		const result = await TimeoutHelper.withTimeout(delayedResolve(20, "done"), 0, () =>
			throwTimedOut()
		);
		expect(result).toEqual("done");
	});

	test("can wait indefinitely when the timeout is negative", async () => {
		const result = await TimeoutHelper.withTimeout(delayedResolve(20, "done"), -1, () =>
			throwTimedOut()
		);
		expect(result).toEqual("done");
	});

	test("can propagate the operation error when the timeout is zero", async () => {
		await expect(
			TimeoutHelper.withTimeout(delayedReject(5, new Error("failed")), 0, () => throwTimedOut())
		).rejects.toThrow("failed");
	});

	test("can clear the timer when the operation settles first", async () => {
		const clearSpy = vi.spyOn(globalThis, "clearTimeout");

		await TimeoutHelper.withTimeout(delayedResolve(5, "done"), 1000, () => throwTimedOut());

		expect(clearSpy).toHaveBeenCalled();

		clearSpy.mockRestore();
	});

	test("can clear the timer when the operation rejects first", async () => {
		const clearSpy = vi.spyOn(globalThis, "clearTimeout");

		await expect(
			TimeoutHelper.withTimeout(delayedReject(5, new Error("failed")), 1000, () => throwTimedOut())
		).rejects.toThrow("failed");

		expect(clearSpy).toHaveBeenCalled();

		clearSpy.mockRestore();
	});

	test("can abandon the operation but still allow it to settle after a timeout", async () => {
		let settled = false;
		const operation = (async () => {
			const value = await delayedResolve(30, "done");
			settled = true;
			return value;
		})();

		await expect(
			TimeoutHelper.withTimeout(operation, 10, () => throwTimedOut())
		).rejects.toMatchObject({ name: "GeneralError" });

		expect(settled).toEqual(false);

		await expect(operation).resolves.toEqual("done");
		expect(settled).toEqual(true);
	});
});
