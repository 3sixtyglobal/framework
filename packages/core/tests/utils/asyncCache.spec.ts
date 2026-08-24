// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { AsyncCache } from "../../src/utils/asyncCache.js";
import { Is } from "../../src/utils/is.js";
import { SharedStore } from "../../src/utils/sharedStore.js";

let counter = 0;

const counterIncrement = vi.fn(async (sleep: number = 0) => {
	if (sleep > 0) {
		await new Promise<void>(resolve => setTimeout(resolve, sleep));
	}
	counter++;
	return counter;
});

const createDeferred = <T>(): {
	promise: Promise<T>;
	resolve: (value: T) => void;
	reject: (reason?: unknown) => void;
} => {
	let storedResolve: ((value: T | PromiseLike<T>) => void) | undefined;
	let storedReject: ((reason?: unknown) => void) | undefined;

	const promise = new Promise<T>((resolve, reject) => {
		storedResolve = resolve;
		storedReject = reject;
	});

	return {
		promise,
		resolve: (value: T) => storedResolve?.(value),
		reject: (reason?: unknown) => storedReject?.(reason)
	};
};

describe("AsyncCache", () => {
	beforeEach(() => {
		AsyncCache.clearCache();
		SharedStore.set("asyncCacheLastCleanup", 0);
		counterIncrement.mockClear();
		counter = 0;
	});

	test("can execute without caching if ttl is not set", async () => {
		const res = AsyncCache.exec("key", undefined, counterIncrement);
		expect(Is.promise(res)).toEqual(true);
		expect(await res).toEqual(1);

		const res2 = AsyncCache.exec("key", undefined, counterIncrement);
		expect(Is.promise(res2)).toEqual(true);
		expect(await res2).toEqual(2);
		expect(counterIncrement).toHaveBeenCalledTimes(2);
	});

	test("can cache if the ttl is set", async () => {
		const res = AsyncCache.exec("key", 1, counterIncrement);
		expect(Is.promise(res)).toEqual(true);
		expect(counter).toEqual(1);
	});

	test("can cache if the ttl is set and reuse result", async () => {
		const res = AsyncCache.exec("key", 100000, counterIncrement);
		expect(Is.promise(res)).toEqual(true);
		expect(counter).toEqual(1);
		const res2 = AsyncCache.exec("key", 100000, counterIncrement);
		expect(Is.promise(res2)).toEqual(true);
		expect(counter).toEqual(1);
		expect(counterIncrement).toHaveBeenCalledTimes(1);
	});

	test("can cache if the ttl is set and not reuse result", async () => {
		const res = AsyncCache.exec("key", 1, counterIncrement);
		expect(Is.promise(res)).toEqual(true);
		expect(counter).toEqual(1);

		// Sleep for 10ms which should mean the cache expires so the next
		// request will get a new value
		await new Promise<void>(resolve => setTimeout(resolve, 10));
		const res2 = AsyncCache.exec("key", 1, counterIncrement);
		expect(Is.promise(res2)).toEqual(true);
		expect(counter).toEqual(2);
		expect(counterIncrement).toHaveBeenCalledTimes(2);
	});

	test("can get a second promise if the action is still in progress", async () => {
		const res = AsyncCache.exec("key", 1, async () => counterIncrement(1000));
		expect(Is.promise(res)).toEqual(true);
		expect(counter).toEqual(0);

		const res2 = AsyncCache.exec("key", 1, async () => counterIncrement(1000));
		expect(Is.promise(res2)).toEqual(true);
		expect(counter).toEqual(0);

		const settledResult = await Promise.allSettled([res, res2]);
		expect(settledResult[0].status === "fulfilled" && settledResult[0].value === 1).toEqual(true);
		expect(settledResult[1].status === "fulfilled" && settledResult[1].value === 1).toEqual(true);
		expect(counterIncrement).toHaveBeenCalledTimes(1);
	});

	test("can not cache if the promise throws", async () => {
		const res = AsyncCache.exec("key", 1, async () => {
			throw new Error("Test error");
		});
		expect(Is.promise(res)).toEqual(true);
		expect(counter).toEqual(0);

		const res2 = AsyncCache.exec("key", 1, async () => counterIncrement(1000));
		expect(Is.promise(res2)).toEqual(true);
		expect(counter).toEqual(0);

		const settledResult = await Promise.allSettled([res, res2]);
		expect(
			settledResult[0].status === "rejected" &&
				settledResult[0].reason instanceof Error &&
				settledResult[0].reason.message === "Test error"
		).toEqual(true);
		expect(settledResult[1].status === "fulfilled" && settledResult[1].value === 1).toEqual(true);
		expect(counterIncrement).toHaveBeenCalledTimes(1);
	});

	test("can cache if the promise throws and the cache failures is set", async () => {
		const res = AsyncCache.exec(
			"key",
			1,
			async () => {
				throw new Error("Test error");
			},
			true
		);
		expect(Is.promise(res)).toEqual(true);
		expect(counter).toEqual(0);

		const res2 = AsyncCache.exec("key", 1, async () => counterIncrement(1000));
		expect(Is.promise(res2)).toEqual(true);
		expect(counter).toEqual(0);

		const settledResult = await Promise.allSettled([res, res2]);
		expect(
			settledResult[0].status === "rejected" &&
				settledResult[0].reason instanceof Error &&
				settledResult[0].reason.message === "Test error"
		).toEqual(true);
		expect(
			settledResult[1].status === "rejected" &&
				settledResult[1].reason instanceof Error &&
				settledResult[1].reason.message === "Test error"
		).toEqual(true);
		expect(counterIncrement).toHaveBeenCalledTimes(0);
	});

	test("can not cache if the promise throws and secondary promise also throws", async () => {
		const res = AsyncCache.exec("key", 1, async () => {
			throw new Error("Test error");
		});
		expect(Is.promise(res)).toEqual(true);
		expect(counter).toEqual(0);

		const res2 = AsyncCache.exec("key", 1, async () => {
			throw new Error("Test error 2");
		});
		expect(Is.promise(res2)).toEqual(true);
		expect(counter).toEqual(0);

		const settledResult = await Promise.allSettled([res, res2]);
		expect(
			settledResult[0].status === "rejected" &&
				settledResult[0].reason instanceof Error &&
				settledResult[0].reason.message === "Test error"
		).toEqual(true);
		expect(
			settledResult[1].status === "rejected" &&
				settledResult[1].reason instanceof Error &&
				settledResult[1].reason.message === "Test error 2"
		).toEqual(true);
	});

	test("can settle in-flight requests after remove is called", async () => {
		const deferred = createDeferred<number>();

		const res = AsyncCache.exec("key", 1000, async () => deferred.promise);
		const res2 = AsyncCache.exec("key", 1000, async () => counterIncrement(1000));

		expect(Is.promise(res)).toEqual(true);
		expect(Is.promise(res2)).toEqual(true);

		AsyncCache.remove("key");
		deferred.resolve(1);

		const settledResult = await Promise.allSettled([res, res2]);
		expect(settledResult[0].status === "fulfilled" && settledResult[0].value === 1).toEqual(true);
		expect(settledResult[1].status === "fulfilled" && settledResult[1].value === 1).toEqual(true);
		expect(counterIncrement).toHaveBeenCalledTimes(0);
	});

	test("can retry queued requests after remove is called and the promise throws", async () => {
		const deferred = createDeferred<number>();

		const res = AsyncCache.exec("key", 1000, async () => deferred.promise);
		const res2 = AsyncCache.exec("key", 1000, async () => counterIncrement(1000));

		expect(Is.promise(res)).toEqual(true);
		expect(Is.promise(res2)).toEqual(true);

		AsyncCache.remove("key");
		deferred.reject(new Error("Test error"));

		const settledResult = await Promise.allSettled([res, res2]);
		expect(
			settledResult[0].status === "rejected" &&
				settledResult[0].reason instanceof Error &&
				settledResult[0].reason.message === "Test error"
		).toEqual(true);
		expect(settledResult[1].status === "fulfilled" && settledResult[1].value === 1).toEqual(true);
		expect(counterIncrement).toHaveBeenCalledTimes(1);
	});

	test("can settle cached failures after remove is called without reusing the error", async () => {
		const deferred = createDeferred<number>();

		const res = AsyncCache.exec("key", 1000, async () => deferred.promise, true);
		const res2 = AsyncCache.exec("key", 1000, async () => counterIncrement(1000), true);

		expect(Is.promise(res)).toEqual(true);
		expect(Is.promise(res2)).toEqual(true);

		AsyncCache.remove("key");
		deferred.reject(new Error("Test error"));

		const settledResult = await Promise.allSettled([res, res2]);
		expect(
			settledResult[0].status === "rejected" &&
				settledResult[0].reason instanceof Error &&
				settledResult[0].reason.message === "Test error"
		).toEqual(true);
		expect(
			settledResult[1].status === "rejected" &&
				settledResult[1].reason instanceof Error &&
				settledResult[1].reason.message === "Test error"
		).toEqual(true);

		const res3 = AsyncCache.exec("key", 1000, async () => counterIncrement(), true);
		expect(await res3).toEqual(1);
		expect(counterIncrement).toHaveBeenCalledTimes(1);
	});

	test("does not let a removed in-flight success overwrite a replacement entry", async () => {
		const deferred = createDeferred<number>();

		const res = AsyncCache.exec("key", 1000, async () => deferred.promise);
		const res2 = AsyncCache.exec("key", 1000, async () => counterIncrement(1000));

		expect(Is.promise(res)).toEqual(true);
		expect(Is.promise(res2)).toEqual(true);

		AsyncCache.remove("key");
		const res3 = AsyncCache.exec("key", 1000, async () => counterIncrement());
		deferred.resolve(2);

		const settledResult = await Promise.allSettled([res, res2, res3]);
		expect(settledResult[0].status === "fulfilled" && settledResult[0].value === 2).toEqual(true);
		expect(settledResult[1].status === "fulfilled" && settledResult[1].value === 2).toEqual(true);
		expect(settledResult[2].status === "fulfilled" && settledResult[2].value === 1).toEqual(true);
		expect(await AsyncCache.get("key")).toEqual(1);
		expect(counterIncrement).toHaveBeenCalledTimes(1);
	});

	test("does not let a removed in-flight failure overwrite a replacement entry", async () => {
		const deferred = createDeferred<number>();

		const res = AsyncCache.exec("key", 1000, async () => deferred.promise);
		const res2 = AsyncCache.exec("key", 1000, async () => counterIncrement(1000));

		expect(Is.promise(res)).toEqual(true);
		expect(Is.promise(res2)).toEqual(true);

		AsyncCache.remove("key");
		const res3 = AsyncCache.exec("key", 100000, async () => counterIncrement());
		deferred.reject(new Error("Test error"));

		const settledResult = await Promise.allSettled([res, res2, res3]);
		expect(
			settledResult[0].status === "rejected" &&
				settledResult[0].reason instanceof Error &&
				settledResult[0].reason.message === "Test error"
		).toEqual(true);
		expect(settledResult[1].status === "fulfilled" && settledResult[1].value === 2).toEqual(true);
		expect(settledResult[2].status === "fulfilled" && settledResult[2].value === 1).toEqual(true);
		expect(await AsyncCache.get("key")).toEqual(1);
		expect(counterIncrement).toHaveBeenCalledTimes(2);
	});

	test("can settle in-flight requests after clearCache is called", async () => {
		const deferred = createDeferred<number>();

		const res = AsyncCache.exec("key", 1000, async () => deferred.promise);
		const res2 = AsyncCache.exec("key", 1000, async () => counterIncrement(1000));

		expect(Is.promise(res)).toEqual(true);
		expect(Is.promise(res2)).toEqual(true);

		AsyncCache.clearCache();
		deferred.resolve(1);

		const settledResult = await Promise.allSettled([res, res2]);
		expect(settledResult[0].status === "fulfilled" && settledResult[0].value === 1).toEqual(true);
		expect(settledResult[1].status === "fulfilled" && settledResult[1].value === 1).toEqual(true);
		expect(counterIncrement).toHaveBeenCalledTimes(0);
	});

	test("can retry queued requests after clearCache is called and the promise throws", async () => {
		const deferred = createDeferred<number>();

		const res = AsyncCache.exec("key", 1000, async () => deferred.promise);
		const res2 = AsyncCache.exec("key", 1000, async () => counterIncrement(1000));

		expect(Is.promise(res)).toEqual(true);
		expect(Is.promise(res2)).toEqual(true);

		AsyncCache.clearCache();
		deferred.reject(new Error("Test error"));

		const settledResult = await Promise.allSettled([res, res2]);
		expect(
			settledResult[0].status === "rejected" &&
				settledResult[0].reason instanceof Error &&
				settledResult[0].reason.message === "Test error"
		).toEqual(true);
		expect(settledResult[1].status === "fulfilled" && settledResult[1].value === 1).toEqual(true);
		expect(counterIncrement).toHaveBeenCalledTimes(1);
	});

	test("can settle cached failures after clearCache is called without reusing the error", async () => {
		const deferred = createDeferred<number>();

		const res = AsyncCache.exec("key", 1000, async () => deferred.promise, true);
		const res2 = AsyncCache.exec("key", 1000, async () => counterIncrement(1000), true);

		expect(Is.promise(res)).toEqual(true);
		expect(Is.promise(res2)).toEqual(true);

		AsyncCache.clearCache();
		deferred.reject(new Error("Test error"));

		const settledResult = await Promise.allSettled([res, res2]);
		expect(
			settledResult[0].status === "rejected" &&
				settledResult[0].reason instanceof Error &&
				settledResult[0].reason.message === "Test error"
		).toEqual(true);
		expect(
			settledResult[1].status === "rejected" &&
				settledResult[1].reason instanceof Error &&
				settledResult[1].reason.message === "Test error"
		).toEqual(true);

		const res3 = AsyncCache.exec("key", 1000, async () => counterIncrement(), true);
		expect(await res3).toEqual(1);
		expect(counterIncrement).toHaveBeenCalledTimes(1);
	});

	test("can settle in-flight requests after clearing a matching prefix", async () => {
		const deferred = createDeferred<number>();

		const res = AsyncCache.exec("api-key", 1000, async () => deferred.promise);
		const res2 = AsyncCache.exec("api-key", 1000, async () => counterIncrement(1000));

		expect(Is.promise(res)).toEqual(true);
		expect(Is.promise(res2)).toEqual(true);

		AsyncCache.clearCache("api-");
		deferred.resolve(1);

		const settledResult = await Promise.allSettled([res, res2]);
		expect(settledResult[0].status === "fulfilled" && settledResult[0].value === 1).toEqual(true);
		expect(settledResult[1].status === "fulfilled" && settledResult[1].value === 1).toEqual(true);
		expect(counterIncrement).toHaveBeenCalledTimes(0);
	});

	test("can retry queued requests after clearing a matching prefix and the promise throws", async () => {
		const deferred = createDeferred<number>();

		const res = AsyncCache.exec("api-key", 1000, async () => deferred.promise);
		const res2 = AsyncCache.exec("api-key", 1000, async () => counterIncrement(1000));

		expect(Is.promise(res)).toEqual(true);
		expect(Is.promise(res2)).toEqual(true);

		AsyncCache.clearCache("api-");
		deferred.reject(new Error("Test error"));

		const settledResult = await Promise.allSettled([res, res2]);
		expect(
			settledResult[0].status === "rejected" &&
				settledResult[0].reason instanceof Error &&
				settledResult[0].reason.message === "Test error"
		).toEqual(true);
		expect(settledResult[1].status === "fulfilled" && settledResult[1].value === 1).toEqual(true);
		expect(counterIncrement).toHaveBeenCalledTimes(1);
	});

	test("can set a value in the cache and retrieve it", async () => {
		await AsyncCache.set("key", 1);

		const value = await AsyncCache.get("key");
		expect(value).toEqual(1);
	});

	test("returns undefined for a missing key", async () => {
		const value = await AsyncCache.get("missing");
		expect(value).toBeUndefined();
	});

	test("can clear only entries matching a prefix", async () => {
		await AsyncCache.set("api-a", 1, 100000);
		await AsyncCache.set("api-b", 2, 100000);
		await AsyncCache.set("other", 3, 100000);

		AsyncCache.clearCache("api-");

		expect(await AsyncCache.get("api-a")).toBeUndefined();
		expect(await AsyncCache.get("api-b")).toBeUndefined();
		expect(await AsyncCache.get("other")).toEqual(3);
	});

	test("set with ttl 0 expires immediately", async () => {
		await AsyncCache.set("key", 1, 0);
		await new Promise<void>(resolve => setTimeout(resolve, 2));

		AsyncCache.cleanupExpired();
		expect(await AsyncCache.get("key")).toBeUndefined();
	});

	test("exec with ttl 0 does not cache", async () => {
		const res1 = await AsyncCache.exec("key", 0, counterIncrement);
		const res2 = await AsyncCache.exec("key", 0, counterIncrement);
		expect(res1).toEqual(1);
		expect(res2).toEqual(2);
		expect(counterIncrement).toHaveBeenCalledTimes(2);
		expect(await AsyncCache.get("key")).toBeUndefined();
	});

	test("cached failures expire after their ttl", async () => {
		const res = AsyncCache.exec(
			"key",
			1,
			async () => {
				throw new Error("Test error");
			},
			true
		);

		expect(Is.promise(res)).toEqual(true);

		const settledResult = await Promise.allSettled([res]);
		expect(
			settledResult[0].status === "rejected" &&
				settledResult[0].reason instanceof Error &&
				settledResult[0].reason.message === "Test error"
		).toEqual(true);

		await new Promise<void>(resolve => setTimeout(resolve, 10));
		const res2 = AsyncCache.exec("key", 1, async () => counterIncrement(), true);
		expect(await res2).toEqual(1);
		expect(counterIncrement).toHaveBeenCalledTimes(1);
	});

	test("get evicts an expired entry even when cleanup is throttled", async () => {
		await AsyncCache.set("key", 1, 1);
		SharedStore.set("asyncCacheLastCleanup", Date.now());
		await new Promise<void>(resolve => setTimeout(resolve, 10));
		expect(await AsyncCache.get("key")).toBeUndefined();
	});

	test("exec re-executes for an expired entry even when cleanup is throttled", async () => {
		await AsyncCache.exec("key", 1, counterIncrement);
		SharedStore.set("asyncCacheLastCleanup", Date.now());
		await new Promise<void>(resolve => setTimeout(resolve, 10));
		const res = await AsyncCache.exec("key", 100000, counterIncrement);
		expect(res).toEqual(2);
		expect(counterIncrement).toHaveBeenCalledTimes(2);
	});

	test("get throws for a cached error entry", async () => {
		await expect(
			AsyncCache.exec(
				"key",
				100000,
				async () => {
					throw new Error("cached error");
				},
				true
			)
		).rejects.toThrow("cached error");
		await expect(AsyncCache.get("key")).rejects.toThrow("cached error");
	});

	test("get returns undefined for an in-progress entry", async () => {
		const deferred = createDeferred<number>();
		// Intentionally not awaited - we need the request to remain in-progress so we can
		// verify that get() returns undefined while it is still pending.
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		AsyncCache.exec("key", 1000, async () => deferred.promise);
		expect(await AsyncCache.get("key")).toBeUndefined();
		deferred.resolve(1);
	});

	test("remove on a key that was never set is a no-op", () => {
		expect(() => AsyncCache.remove("never-set")).not.toThrow();
	});

	test("clearCache on an empty cache does not throw", () => {
		expect(() => AsyncCache.clearCache()).not.toThrow();
		expect(() => AsyncCache.clearCache("prefix-")).not.toThrow();
	});

	test("cleanupExpired on an empty cache does not throw", () => {
		expect(() => AsyncCache.cleanupExpired()).not.toThrow();
	});

	test("exec with negative ttl does not cache", async () => {
		const res1 = await AsyncCache.exec("key", -1, counterIncrement);
		const res2 = await AsyncCache.exec("key", -1, counterIncrement);
		expect(res1).toEqual(1);
		expect(res2).toEqual(2);
		expect(counterIncrement).toHaveBeenCalledTimes(2);
	});

	test("queued retries reject if request method throws synchronously", async () => {
		const res = AsyncCache.exec("key", 1, async () => {
			throw new Error("initial failure");
		});
		expect(Is.promise(res)).toEqual(true);

		const res2 = AsyncCache.exec("key", 1, () => {
			throw new Error("sync failure");
		});
		expect(Is.promise(res2)).toEqual(true);

		const settledResult = await Promise.allSettled([res, res2]);
		expect(
			settledResult[0].status === "rejected" &&
				settledResult[0].reason instanceof Error &&
				settledResult[0].reason.message === "initial failure"
		).toEqual(true);
		expect(
			settledResult[1].status === "rejected" &&
				settledResult[1].reason instanceof Error &&
				settledResult[1].reason.message === "sync failure"
		).toEqual(true);
	});

	describe("cleanup optimization", () => {
		const nextExpiryKey = "asyncCacheNextExpiryKey";

		test("next expiry key is set when exec creates an entry", async () => {
			await AsyncCache.exec("key", 5000, counterIncrement);
			expect(SharedStore.get<string>(nextExpiryKey)).toEqual("key");
		});

		test("next expiry key is set when set creates an entry", async () => {
			await AsyncCache.set("key", 1, 5000);
			expect(SharedStore.get<string>(nextExpiryKey)).toEqual("key");
		});

		test("next expiry key tracks the entry with the earliest expiry", async () => {
			await AsyncCache.set("long", 1, 50000);
			await AsyncCache.set("short", 1, 500);
			expect(SharedStore.get<string>(nextExpiryKey)).toEqual("short");
		});

		test("next expiry key is not overwritten by a later-expiring entry", async () => {
			await AsyncCache.set("short", 1, 500);
			await AsyncCache.set("long", 1, 50000);
			expect(SharedStore.get<string>(nextExpiryKey)).toEqual("short");
		});

		test("cleanupExpired skips scan when tracked entry has not expired", async () => {
			await AsyncCache.set("key", 1, 100000);
			AsyncCache.cleanupExpired();
			AsyncCache.cleanupExpired();
			AsyncCache.cleanupExpired();
			expect(await AsyncCache.get("key")).toEqual(1);
		});

		test("next expiry key advances to next soonest entry after cleanup removes expired entry", async () => {
			await AsyncCache.set("short", 1, 1);
			await AsyncCache.set("long", 2, 100000);
			await new Promise<void>(resolve => setTimeout(resolve, 10));
			AsyncCache.cleanupExpired();
			expect(await AsyncCache.get("short")).toBeUndefined();
			expect(await AsyncCache.get("long")).toEqual(2);
			expect(SharedStore.get<string>(nextExpiryKey)).toEqual("long");
		});

		test("next expiry key is cleared after full clearCache", async () => {
			await AsyncCache.set("key", 1, 100000);
			AsyncCache.clearCache();
			expect(SharedStore.get<string>(nextExpiryKey)).toBeUndefined();
		});

		test("next expiry key is recalculated after removing the tracked entry", async () => {
			await AsyncCache.set("a", 1, 500);
			await AsyncCache.set("b", 2, 100000);
			expect(SharedStore.get<string>(nextExpiryKey)).toEqual("a");
			AsyncCache.remove("a");
			expect(SharedStore.get<string>(nextExpiryKey)).toEqual("b");
		});

		test("next expiry key is unchanged after removing a non-tracked entry", async () => {
			await AsyncCache.set("a", 1, 500);
			await AsyncCache.set("b", 2, 100000);
			expect(SharedStore.get<string>(nextExpiryKey)).toEqual("a");
			AsyncCache.remove("b");
			expect(SharedStore.get<string>(nextExpiryKey)).toEqual("a");
		});

		test("next expiry key is recalculated after prefixed clearCache removes the tracked entry", async () => {
			await AsyncCache.set("api-a", 1, 500);
			await AsyncCache.set("other", 2, 100000);
			expect(SharedStore.get<string>(nextExpiryKey)).toEqual("api-a");
			AsyncCache.clearCache("api-");
			expect(SharedStore.get<string>(nextExpiryKey)).toEqual("other");
		});

		test("next expiry key is unchanged after prefixed clearCache that does not remove the tracked entry", async () => {
			await AsyncCache.set("other", 1, 500);
			await AsyncCache.set("api-a", 2, 100000);
			expect(SharedStore.get<string>(nextExpiryKey)).toEqual("other");
			AsyncCache.clearCache("api-");
			expect(SharedStore.get<string>(nextExpiryKey)).toEqual("other");
		});

		test("next expiry key is undefined after removing the only cached entry", async () => {
			await AsyncCache.set("only", 1, 100000);
			expect(SharedStore.get<string>(nextExpiryKey)).toEqual("only");
			AsyncCache.remove("only");
			expect(SharedStore.get<string>(nextExpiryKey)).toBeUndefined();
		});

		test("cleanupExpired scan is throttled to at most once every 5 seconds", async () => {
			vi.useFakeTimers();
			try {
				// Re-clear inside the fake-timer scope so _LAST_CLEANUP_KEY is set to fake
				// time, then advance past the initial interval so the first scan is allowed.
				AsyncCache.clearCache();
				vi.advanceTimersByTime(5001);

				await AsyncCache.set("a", 1, 1);
				vi.advanceTimersByTime(10);

				// First call after expiry should scan and remove "a" from the raw cache
				AsyncCache.cleanupExpired();
				const rawCache = SharedStore.get<{ [key: string]: unknown }>("asyncCache") ?? {};
				expect("a" in rawCache).toEqual(false);

				// Add another expired entry
				await AsyncCache.set("b", 2, 1);
				vi.advanceTimersByTime(10);

				// Second call is within 5 s - scan is throttled so "b" remains in the raw cache
				AsyncCache.cleanupExpired();
				expect("b" in rawCache).toEqual(true);

				// Advance past the 5 s interval
				vi.advanceTimersByTime(5000);

				// Now the scan runs and removes "b" from the raw cache
				AsyncCache.cleanupExpired();
				expect("b" in rawCache).toEqual(false);
			} finally {
				vi.useRealTimers();
			}
		});
	});

	describe("nullish success does not hang later callers", () => {
		test("a later caller does not hang after an earlier request settles with undefined", async () => {
			vi.useFakeTimers();
			try {
				const requestMethod = vi.fn().mockResolvedValue(undefined);
				const key = "hang-repro";

				// First call settles normally with `undefined`.
				const first = await AsyncCache.exec(key, 100000, requestMethod);
				expect(first).toBeUndefined();
				expect(requestMethod).toHaveBeenCalledTimes(1);

				// Second call, made *after* the first has already fully settled (not
				// concurrently) - this is exactly the scenario where AsyncCache mistakes
				// "settled but empty" for "still in progress" and queues a waiter that
				// nothing will ever drain.
				const second = AsyncCache.exec(key, 100000, requestMethod);

				const TIMEOUT = Symbol("timeout");
				const timeoutPromise = new Promise(resolve => {
					setTimeout(() => resolve(TIMEOUT), 200);
				});
				const racePromise = Promise.race([second, timeoutPromise]);

				// Advance virtual time so the timeout sentinel has a chance to fire.
				// Before the fix, `second` never settles, so the sentinel always wins.
				await vi.advanceTimersByTimeAsync(200);
				const raceResult = await racePromise;

				// This assertion fails before the fix (raceResult is the TIMEOUT sentinel)
				// and passes after it (raceResult is `undefined`, from a fresh re-run).
				expect(raceResult).not.toBe(TIMEOUT);
				expect(raceResult).toBeUndefined();
			} finally {
				vi.useRealTimers();
			}
		});

		test("concurrent callers with a nullish eventual result are both served once it settles", async () => {
			const deferred = createDeferred<undefined>();
			const requestMethod = vi.fn(async () => deferred.promise);

			// Both calls are issued synchronously, in the same tick, before requestMethod's
			// promise ever settles - genuinely still in flight regardless of how long it
			// takes, so no real wall-clock wait is needed to exercise this.
			const res = AsyncCache.exec("hang-concurrent", 100000, requestMethod);
			const res2 = AsyncCache.exec("hang-concurrent", 100000, requestMethod);

			deferred.resolve(undefined);

			const settledResult = await Promise.allSettled([res, res2]);
			expect(
				settledResult[0].status === "fulfilled" && settledResult[0].value === undefined
			).toEqual(true);
			expect(
				settledResult[1].status === "fulfilled" && settledResult[1].value === undefined
			).toEqual(true);
			// Still a single underlying call - the fix must not affect genuinely-concurrent
			// queuing while the original request is actually still in flight.
			expect(requestMethod).toHaveBeenCalledTimes(1);
		});

		test("a later call after a nullish settle genuinely re-invokes requestMethod", async () => {
			const requestMethod = vi.fn().mockResolvedValue(undefined);
			const key = "hang-reinvoke";

			const first = await AsyncCache.exec(key, 100000, requestMethod);
			expect(first).toBeUndefined();

			const second = await AsyncCache.exec(key, 100000, requestMethod);
			expect(second).toBeUndefined();

			// Proves the second caller was served by a genuine fresh invocation, not by
			// some other accidental resolution path.
			expect(requestMethod).toHaveBeenCalledTimes(2);
		});

		test("a caller arriving while the retry itself is in flight queues rather than recursing again", async () => {
			const key = "hang-retry-queue";
			let callCount = 0;
			const retryDeferred = createDeferred<string>();
			const requestMethod = vi.fn(async () => {
				callCount++;
				if (callCount === 1) {
					// First call settles nullish - this is what triggers the retry below.
					return undefined;
				}
				// The retry (second invocation) stays in flight until retryDeferred
				// resolves, giving a third caller a deterministic window to queue
				// against it, with no dependency on real elapsed time.
				return retryDeferred.promise;
			});

			const first = await AsyncCache.exec(key, 100000, requestMethod);
			expect(first).toBeUndefined();

			// Triggers the fresh retry (call #2) synchronously - requestMethod is
			// invoked immediately, in this same tick, so it's already in flight by the
			// time the next statement runs, regardless of how long it takes to settle.
			const second = AsyncCache.exec(key, 100000, requestMethod);

			// Arrives in the same tick, right after the retry started (no await in
			// between) - must queue against it, not recurse into a third invocation.
			const third = AsyncCache.exec(key, 100000, requestMethod);

			retryDeferred.resolve("real-value");

			const [secondResult, thirdResult] = await Promise.all([second, third]);
			expect(secondResult).toEqual("real-value");
			expect(thirdResult).toEqual("real-value");
			expect(requestMethod).toHaveBeenCalledTimes(2);
		});

		test("cacheFailures does not change nullish-success retry behavior", async () => {
			const requestMethod = vi.fn().mockResolvedValue(undefined);
			const key = "hang-cachefailures-interplay";

			const first = await AsyncCache.exec(key, 100000, requestMethod, true);
			expect(first).toBeUndefined();

			const second = await AsyncCache.exec(key, 100000, requestMethod, true);
			expect(second).toBeUndefined();

			// A nullish success is never eligible for the cacheFailures failure-caching
			// path - confirms the two concepts stay orthogonal after the fix.
			expect(requestMethod).toHaveBeenCalledTimes(2);
		});

		test("an expired nullish entry is evicted via the normal TTL mechanism, not the new retry branch", async () => {
			const requestMethod = vi.fn().mockResolvedValue(undefined);
			const key = "hang-ttl-expiry";

			const first = await AsyncCache.exec(key, 1, requestMethod);
			expect(first).toBeUndefined();

			// Let the entry's 1ms TTL actually expire, so evictIfExpired (not the new
			// settled-but-empty branch) is what removes it on the next call.
			await new Promise<void>(resolve => setTimeout(resolve, 10));

			const second = await AsyncCache.exec(key, 100000, requestMethod);
			expect(second).toBeUndefined();
			expect(requestMethod).toHaveBeenCalledTimes(2);
		});

		test("exec does not hang on a nullish entry created via set, where inProgress is undefined rather than false", async () => {
			// AsyncCache.set never assigns inProgress at all, so a set(key, undefined)
			// entry has inProgress === undefined, not false. The fix's `!cachedEntry.inProgress`
			// check only catches this because it tests falsiness rather than strict
			// equality - pinning that here so a future "tidy-up" to
			// `cachedEntry.inProgress === false` can't silently reintroduce the hang for
			// entries created this way.
			const key = "hang-set-created";
			await AsyncCache.set(key, undefined, 100000);

			const requestMethod = vi.fn().mockResolvedValue("fresh-value");
			const result = await AsyncCache.exec(key, 100000, requestMethod);

			expect(result).toEqual("fresh-value");
			expect(requestMethod).toHaveBeenCalledTimes(1);
		});
	});
});
