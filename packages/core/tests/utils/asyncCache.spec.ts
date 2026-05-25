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
		// Intentionally not awaited — we need the request to remain in-progress so we can
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

				// Second call is within 5 s — scan is throttled so "b" remains in the raw cache
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
});
