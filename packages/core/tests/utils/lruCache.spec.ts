// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { LruCache } from "../../src/utils/lruCache.js";

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
});
