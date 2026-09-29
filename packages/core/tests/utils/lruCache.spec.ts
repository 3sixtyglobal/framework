// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { LruCache } from "../../src/utils/lruCache.js";
import { SharedStore } from "../../src/utils/sharedStore.js";

describe("LruCache", () => {
	let cache: LruCache<number>;

	afterEach(() => {
		cache?.destroy();
	});

	describe("constructor", () => {
		test("throws if capacity is not an integer", () => {
			expect(() => new LruCache({ capacity: 1.5, ttiMs: 1000 })).toThrow();
		});

		test("throws if capacity is zero", () => {
			expect(() => new LruCache({ capacity: 0, ttiMs: 1000 })).toThrow();
		});

		test("throws if capacity is negative", () => {
			expect(() => new LruCache({ capacity: -1, ttiMs: 1000 })).toThrow();
		});

		test("throws if ttiMs is not an integer", () => {
			expect(() => new LruCache({ capacity: 10, ttiMs: 1000.5 })).toThrow();
		});

		test("throws if ttiMs is zero", () => {
			expect(() => new LruCache({ capacity: 10, ttiMs: 0 })).toThrow();
		});

		test("throws if ttiMs is negative", () => {
			expect(() => new LruCache({ capacity: 10, ttiMs: -1 })).toThrow();
		});

		test("throws if mutexTimeoutMs is not an integer", () => {
			expect(() => new LruCache({ capacity: 10, ttiMs: 1000, mutexTimeoutMs: 10.5 })).toThrow();
		});

		test("throws if mutexTimeoutMs is negative", () => {
			expect(() => new LruCache({ capacity: 10, ttiMs: 1000, mutexTimeoutMs: -1 })).toThrow();
		});

		test("constructs successfully with valid arguments", () => {
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000 });
			expect(cache.count()).toEqual(0);
		});
	});

	describe("getOrSet", () => {
		test("returns cached undefined without invoking the factory", async () => {
			const undefinedCache = new LruCache<number | undefined>({
				capacity: 5,
				ttiMs: 1000,
				mutexTimeoutMs: 50
			});

			try {
				undefinedCache.set("a", undefined);

				const factory = vi.fn(async () => 2);
				const value = await undefinedCache.getOrSet("a", factory);

				expect(value).toBeUndefined();
				expect(factory).toHaveBeenCalledTimes(0);
			} finally {
				undefinedCache.destroy();
			}
		});

		test("returns an existing value without invoking the factory", async () => {
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000, mutexTimeoutMs: 50 });
			cache.set("a", 1);

			const factory = vi.fn(async () => 2);
			const value = await cache.getOrSet("a", factory);

			expect(value).toEqual(1);
			expect(factory).toHaveBeenCalledTimes(0);
		});

		test("returns the cached value when the entry expires mid-lookup", async () => {
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000, mutexTimeoutMs: 50 });
			cache.set("a", 1);

			// An uncontended getOrSet reads the clock once for the mutex deadline and once to
			// test the entry. Hold those two reads inside the idle window and push every later
			// read beyond it, so a second expiry check would evict the entry and miss.
			const base = Date.now();
			let reads = 0;
			const nowSpy = vi.spyOn(Date, "now").mockImplementation(() => {
				reads++;
				return reads <= 2 ? base : base + 5000;
			});

			try {
				const factory = vi.fn(async () => 2);
				const value = await cache.getOrSet("a", factory);

				expect(value).toEqual(1);
				expect(factory).toHaveBeenCalledTimes(0);
			} finally {
				nowSpy.mockRestore();
			}
		});

		test("builds once when called concurrently for the same key", async () => {
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000, mutexTimeoutMs: 1000 });
			let buildCount = 0;

			const first = cache.getOrSet("a", async () => {
				buildCount++;
				await new Promise(resolve => setTimeout(resolve, 20));
				return 123;
			});

			await new Promise(resolve => setTimeout(resolve, 1));

			const second = cache.getOrSet("a", async () => {
				buildCount++;
				return 999;
			});

			const [firstValue, secondValue] = await Promise.all([first, second]);

			expect(firstValue).toEqual(123);
			expect(secondValue).toEqual(123);
			expect(buildCount).toEqual(1);
		});

		test("does not grow the mutex registries per distinct key", async () => {
			cache = new LruCache<number>({ capacity: 5, ttiMs: 60000, mutexTimeoutMs: 1000 });

			// Enough distinct keys to cross the reclamation threshold more than once, so an
			// entry retained per key would be plainly visible in the registry sizes.
			const total = 4000;
			for (let i = 0; i < total; i++) {
				await cache.getOrSet(`k${i}`, async () => i);
			}

			const mutex = SharedStore.get<{
				_locks: Map<string, unknown>;
				_waiters: Map<string, unknown>;
			}>("mutex");
			const locks = mutex?._locks.size ?? 0;
			const waiters = mutex?._waiters.size ?? 0;

			expect(locks).toBeLessThan(total);
			expect(waiters).toEqual(0);
		});

		test("throws when mutex acquisition times out", async () => {
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000, mutexTimeoutMs: 20 });

			let releaseFirst: (value: number) => void = () => {};
			const first = cache.getOrSet(
				"a",
				async () =>
					new Promise<number>(resolve => {
						releaseFirst = resolve;
					})
			);

			await new Promise(resolve => setTimeout(resolve, 1));

			await expect(cache.getOrSet("a", async () => 2)).rejects.toThrow();

			releaseFirst(1);
			await expect(first).resolves.toEqual(1);
		});
	});

	describe("set and get", () => {
		test("returns undefined for a missing key", () => {
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000 });
			expect(cache.get("missing")).toBeUndefined();
		});

		test("stores and retrieves a value", () => {
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000 });
			cache.set("a", 1);
			expect(cache.get("a")).toEqual(1);
		});

		test("overwriting a key updates the value", () => {
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000 });
			cache.set("a", 1);
			cache.set("a", 2);
			expect(cache.get("a")).toEqual(2);
		});

		test("size reflects the number of stored entries", () => {
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000 });
			cache.set("a", 1);
			cache.set("b", 2);
			expect(cache.count()).toEqual(2);
		});
	});

	describe("has", () => {
		test("returns false for a missing key", () => {
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000 });
			expect(cache.has("x")).toEqual(false);
		});

		test("returns true for a present key", () => {
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000 });
			cache.set("a", 1);
			expect(cache.has("a")).toEqual(true);
		});
	});

	describe("keys", () => {
		test("returns an empty array when the cache is empty", () => {
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000 });
			expect(cache.keys()).toEqual([]);
		});

		test("returns all live keys in LRU order", () => {
			cache = new LruCache<number>({ capacity: 5, ttiMs: 60000 });
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);
			expect(cache.keys()).toEqual(["a", "b", "c"]);
		});

		test("promotes an entry when get is called, updating its position in keys", () => {
			cache = new LruCache<number>({ capacity: 5, ttiMs: 60000 });
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);
			cache.get("a");
			expect(cache.keys()).toEqual(["b", "c", "a"]);
		});

		test("evicts idle entries during iteration and excludes them", () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000 });
			try {
				cache.set("a", 1);
				cache.set("b", 2);
				vi.advanceTimersByTime(1000);
				cache.set("c", 3);
				expect(cache.keys()).toEqual(["c"]);
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});
	});

	describe("delete", () => {
		test("removes the entry", () => {
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000 });
			cache.set("a", 1);
			cache.delete("a");
			expect(cache.get("a")).toBeUndefined();
			expect(cache.count()).toEqual(0);
		});

		test("is a no-op for a missing key", () => {
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000 });
			expect(() => cache.delete("missing")).not.toThrow();
		});
	});

	describe("clear", () => {
		test("removes all entries", () => {
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000 });
			cache.set("a", 1);
			cache.set("b", 2);
			cache.clear();
			expect(cache.count()).toEqual(0);
			expect(cache.get("a")).toBeUndefined();
		});
	});

	describe("LRU eviction", () => {
		test("evicts the least-recently-used entry when capacity is exceeded", () => {
			cache = new LruCache<number>({ capacity: 3, ttiMs: 60000 });
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);
			cache.set("d", 4);
			expect(cache.get("a")).toBeUndefined();
			expect(cache.get("b")).toEqual(2);
			expect(cache.get("c")).toEqual(3);
			expect(cache.get("d")).toEqual(4);
		});

		test("get promotes an entry to most-recently-used", () => {
			cache = new LruCache<number>({ capacity: 3, ttiMs: 60000 });
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);
			cache.get("a");
			cache.set("d", 4);
			expect(cache.get("b")).toBeUndefined();
			expect(cache.get("a")).toEqual(1);
			expect(cache.get("c")).toEqual(3);
			expect(cache.get("d")).toEqual(4);
		});

		test("set on an existing key promotes it to most-recently-used", () => {
			cache = new LruCache<number>({ capacity: 3, ttiMs: 60000 });
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);
			cache.set("a", 10);
			cache.set("d", 4);
			expect(cache.get("b")).toBeUndefined();
			expect(cache.get("a")).toEqual(10);
			expect(cache.get("c")).toEqual(3);
			expect(cache.get("d")).toEqual(4);
		});

		test("size never exceeds capacity", () => {
			const capacity = 3;
			cache = new LruCache<number>({ capacity, ttiMs: 60000 });
			for (let i = 0; i < 10; i++) {
				cache.set(`k${i}`, i);
				expect(cache.count()).toBeLessThanOrEqual(capacity);
			}
		});
	});

	describe("TTI eviction", () => {
		test("get evicts an idle entry and returns undefined", () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000 });
			try {
				cache.set("a", 1);
				vi.advanceTimersByTime(1000);
				expect(cache.get("a")).toBeUndefined();
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});

		test("get does not evict an entry accessed just before TTI expires", () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000 });
			try {
				cache.set("a", 1);
				vi.advanceTimersByTime(999);
				expect(cache.get("a")).toEqual(1);
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});

		test("get resets the idle timer on a successful hit", () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000 });
			try {
				cache.set("a", 1);
				vi.advanceTimersByTime(900);
				cache.get("a");
				vi.advanceTimersByTime(900);
				expect(cache.get("a")).toEqual(1);
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});

		test("has evicts an idle entry and returns false", () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000 });
			try {
				cache.set("a", 1);
				vi.advanceTimersByTime(1000);
				expect(cache.has("a")).toEqual(false);
				expect(cache.count()).toEqual(0);
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});

		test("has does not reset TTI on a live entry", () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000 });
			try {
				cache.set("a", 1);
				vi.advanceTimersByTime(800);
				expect(cache.has("a")).toEqual(true);
				vi.advanceTimersByTime(200);
				expect(cache.get("a")).toBeUndefined();
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});

		test("set resets TTI for an existing key", () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000 });
			try {
				cache.set("a", 1);
				vi.advanceTimersByTime(900);
				cache.set("a", 2);
				vi.advanceTimersByTime(900);
				expect(cache.get("a")).toEqual(2);
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});

		test("background timer evicts idle entries without any method call", () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000 });
			try {
				cache.set("a", 1);
				cache.set("b", 2);
				expect(cache.count()).toEqual(2);
				vi.advanceTimersByTime(1000);
				expect(cache.count()).toEqual(0);
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});
	});

	describe("TTI and capacity interaction", () => {
		test("idle entries are swept before LRU eviction on set", () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 3, ttiMs: 1000 });
			try {
				cache.set("a", 1);
				cache.set("b", 2);
				cache.set("c", 3);
				vi.advanceTimersByTime(1000);
				cache.set("d", 4);
				expect(cache.count()).toEqual(1);
				expect(cache.get("d")).toEqual(4);
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});

		test("only idle entries are swept; fresh entries survive", () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 3, ttiMs: 1000 });
			try {
				cache.set("a", 1);
				cache.set("b", 2);
				vi.advanceTimersByTime(1000);
				cache.set("c", 3);
				expect(cache.get("a")).toBeUndefined();
				expect(cache.get("b")).toBeUndefined();
				expect(cache.get("c")).toEqual(3);
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});
	});
	describe("hard expiry timestamp", () => {
		test("throws if expires is not an integer", () => {
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000 });
			expect(() => cache.set("a", 1, Date.now() + 100.5)).toThrow();
		});

		test("the entry expires at the timestamp however recently it was used", () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000 });
			try {
				cache.set("a", 1, Date.now() + 2000);
				vi.advanceTimersByTime(900);
				expect(cache.get("a")).toEqual(1);
				vi.advanceTimersByTime(900);
				expect(cache.get("a")).toEqual(1);
				vi.advanceTimersByTime(200);
				expect(cache.get("a")).toBeUndefined();
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});

		test("the TTI still applies to an entry with a later expiry", () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000 });
			try {
				cache.set("a", 1, Date.now() + 60000);
				vi.advanceTimersByTime(1000);
				expect(cache.get("a")).toBeUndefined();
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});

		test("the background timer removes the entry at the timestamp with no method calls", () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 5, ttiMs: 60000 });
			try {
				cache.set("a", 1);
				cache.set("b", 2, Date.now() + 200);
				vi.advanceTimersByTime(199);
				expect(cache.count()).toEqual(2);
				vi.advanceTimersByTime(1);
				expect(cache.count()).toEqual(1);
				expect(cache.keys()).toEqual(["a"]);
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});

		test("has reports an expired entry as absent and removes it", () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 5, ttiMs: 60000 });
			try {
				cache.set("a", 1, Date.now() + 200);
				expect(cache.has("a")).toEqual(true);
				vi.advanceTimersByTime(200);
				expect(cache.has("a")).toEqual(false);
				expect(cache.count()).toEqual(0);
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});

		test("keys excludes entries past their expiry", () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 5, ttiMs: 60000 });
			try {
				cache.set("a", 1, Date.now() + 200);
				cache.set("b", 2);
				expect(cache.keys()).toEqual(["a", "b"]);
				vi.advanceTimersByTime(200);
				expect(cache.keys()).toEqual(["b"]);
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});

		test("setting the key again without an expiry clears the previous one", () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 5, ttiMs: 60000 });
			try {
				cache.set("a", 1, Date.now() + 200);
				vi.advanceTimersByTime(100);
				cache.set("a", 2);
				vi.advanceTimersByTime(200);
				expect(cache.get("a")).toEqual(2);
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});

		test("setting the key again applies the new expiry", () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 5, ttiMs: 60000 });
			try {
				cache.set("a", 1);
				vi.advanceTimersByTime(100);
				cache.set("a", 2, Date.now() + 200);
				expect(cache.get("a")).toEqual(2);
				vi.advanceTimersByTime(200);
				expect(cache.get("a")).toBeUndefined();
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});

		test("an entry set with a past timestamp is treated as expired", () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 5, ttiMs: 60000 });
			try {
				cache.set("a", 1, Date.now() - 1);
				expect(cache.get("a")).toBeUndefined();
				expect(cache.has("a")).toEqual(false);
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});

		test("expired entries are removed before capacity eviction", () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 2, ttiMs: 60000 });
			try {
				cache.set("a", 1);
				cache.set("b", 2, Date.now() + 200);
				vi.advanceTimersByTime(200);
				cache.set("c", 3);
				expect(cache.keys()).toEqual(["a", "c"]);
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});

		test("getOrSet applies the expiry to a created value", async () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 5, ttiMs: 60000, mutexTimeoutMs: 1000 });
			try {
				await cache.getOrSet("a", async () => 1, Date.now() + 200);
				vi.advanceTimersByTime(199);
				expect(cache.get("a")).toEqual(1);
				vi.advanceTimersByTime(1);
				expect(cache.get("a")).toBeUndefined();
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});

		test("repeated access keeps an entry alive across TTI windows until its expiry", () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000 });
			try {
				cache.set("a", 1, Date.now() + 5000);
				for (let i = 0; i < 5; i++) {
					vi.advanceTimersByTime(900);
					expect(cache.get("a")).toEqual(1);
				}
				vi.advanceTimersByTime(500);
				expect(cache.get("a")).toBeUndefined();
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});

		test("a later expiry does not delay a pending earlier sweep", () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 5, ttiMs: 60000 });
			try {
				cache.set("a", 1, Date.now() + 200);
				cache.set("b", 2, Date.now() + 5000);
				vi.advanceTimersByTime(200);
				expect(cache.count()).toEqual(1);
				expect(cache.keys()).toEqual(["b"]);
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});

		test("entries with different expiries are removed in their own order", () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 5, ttiMs: 60000 });
			try {
				cache.set("a", 1, Date.now() + 100);
				cache.set("b", 2, Date.now() + 300);
				cache.set("c", 3);
				vi.advanceTimersByTime(100);
				expect(cache.keys()).toEqual(["b", "c"]);
				vi.advanceTimersByTime(200);
				expect(cache.keys()).toEqual(["c"]);
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});

		test("deleting the earliest-expiring entry leaves the others on their own schedule", () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 5, ttiMs: 60000 });
			try {
				cache.set("a", 1, Date.now() + 200);
				cache.set("b", 2, Date.now() + 400);
				cache.delete("a");
				vi.advanceTimersByTime(200);
				expect(cache.get("b")).toEqual(2);
				vi.advanceTimersByTime(200);
				expect(cache.get("b")).toBeUndefined();
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});

		test("the cache still works after every entry has expired", () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 5, ttiMs: 60000 });
			try {
				cache.set("a", 1, Date.now() + 200);
				vi.advanceTimersByTime(200);
				expect(cache.count()).toEqual(0);
				cache.set("b", 2, Date.now() + 200);
				expect(cache.get("b")).toEqual(2);
				vi.advanceTimersByTime(200);
				expect(cache.count()).toEqual(0);
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});

		test("getOrSet does not change the expiry of an existing entry", async () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 5, ttiMs: 60000, mutexTimeoutMs: 1000 });
			try {
				cache.set("a", 1, Date.now() + 200);
				const value = await cache.getOrSet("a", async () => 2, Date.now() + 5000);
				expect(value).toEqual(1);
				vi.advanceTimersByTime(200);
				expect(cache.get("a")).toBeUndefined();
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});

		test("getOrSet creates a new value once the entry has expired", async () => {
			vi.useFakeTimers();
			cache = new LruCache<number>({ capacity: 5, ttiMs: 60000, mutexTimeoutMs: 1000 });
			try {
				cache.set("a", 1, Date.now() + 200);
				vi.advanceTimersByTime(200);
				const value = await cache.getOrSet("a", async () => 2);
				expect(value).toEqual(2);
				expect(cache.get("a")).toEqual(2);
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});
	});

	describe("parameter guards", () => {
		beforeEach(() => {
			cache = new LruCache<number>({ capacity: 5, ttiMs: 1000, mutexTimeoutMs: 1000 });
		});

		test("get throws if the key is empty", () => {
			expect(() => cache.get("")).toThrow();
		});

		test("get throws if the key is not a string", () => {
			expect(() => cache.get(undefined as unknown as string)).toThrow();
		});

		test("set throws if the key is empty", () => {
			expect(() => cache.set("", 1)).toThrow();
		});

		test("set throws if the key is not a string", () => {
			expect(() => cache.set(undefined as unknown as string, 1)).toThrow();
		});

		test("has throws if the key is empty", () => {
			expect(() => cache.has("")).toThrow();
		});

		test("delete throws if the key is empty", () => {
			expect(() => cache.delete("")).toThrow();
		});

		test("getOrSet throws if the key is empty", async () => {
			await expect(cache.getOrSet("", async () => 1)).rejects.toThrow();
		});

		test("getOrSet throws if the value factory is not a function", async () => {
			await expect(
				cache.getOrSet("a", undefined as unknown as () => Promise<number>)
			).rejects.toThrow();
		});
	});
});
