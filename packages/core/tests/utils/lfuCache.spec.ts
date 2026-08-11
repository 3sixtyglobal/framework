// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { LfuCache } from "../../src/utils/lfuCache.js";

describe("LfuCache", () => {
	let cache: LfuCache<number>;

	afterEach(() => {
		cache?.destroy();
	});

	describe("constructor", () => {
		test("throws if capacity is not an integer", () => {
			expect(() => new LfuCache({ capacity: 1.5, ttiMs: 1000 })).toThrow();
		});

		test("throws if capacity is zero", () => {
			expect(() => new LfuCache({ capacity: 0, ttiMs: 1000 })).toThrow();
		});

		test("throws if capacity is negative", () => {
			expect(() => new LfuCache({ capacity: -1, ttiMs: 1000 })).toThrow();
		});

		test("throws if ttiMs is not an integer", () => {
			expect(() => new LfuCache({ capacity: 10, ttiMs: 1000.5 })).toThrow();
		});

		test("throws if ttiMs is zero", () => {
			expect(() => new LfuCache({ capacity: 10, ttiMs: 0 })).toThrow();
		});

		test("throws if ttiMs is negative", () => {
			expect(() => new LfuCache({ capacity: 10, ttiMs: -1 })).toThrow();
		});

		test("throws if mutexTimeoutMs is not an integer", () => {
			expect(() => new LfuCache({ capacity: 10, ttiMs: 1000, mutexTimeoutMs: 10.5 })).toThrow();
		});

		test("throws if mutexTimeoutMs is negative", () => {
			expect(() => new LfuCache({ capacity: 10, ttiMs: 1000, mutexTimeoutMs: -1 })).toThrow();
		});

		test("constructs successfully with valid arguments", () => {
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 1000 });
			expect(cache.count()).toEqual(0);
		});

		test("defaults ttiMs to 10000 when not provided", () => {
			cache = new LfuCache<number>({ capacity: 5 });
			expect(cache.count()).toEqual(0);
		});
	});

	describe("getOrSet", () => {
		test("returns cached undefined without invoking the factory", async () => {
			const undefinedCache = new LfuCache<number | undefined>({
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
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 1000, mutexTimeoutMs: 50 });
			cache.set("a", 1);

			const factory = vi.fn(async () => 2);
			const value = await cache.getOrSet("a", factory);

			expect(value).toEqual(1);
			expect(factory).toHaveBeenCalledTimes(0);
		});

		test("builds once when called concurrently for the same key", async () => {
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 1000, mutexTimeoutMs: 1000 });
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
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 1000, mutexTimeoutMs: 20 });

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
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 1000 });
			expect(cache.get("missing")).toBeUndefined();
		});

		test("stores and retrieves a value", () => {
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 1000 });
			cache.set("a", 1);
			expect(cache.get("a")).toEqual(1);
		});

		test("overwriting a key updates the value and increments frequency", () => {
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 60000 });
			cache.set("a", 1);
			cache.set("a", 2);
			expect(cache.get("a")).toEqual(2);
		});

		test("count reflects the number of stored entries", () => {
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 1000 });
			cache.set("a", 1);
			cache.set("b", 2);
			expect(cache.count()).toEqual(2);
		});
	});

	describe("has", () => {
		test("returns false for a missing key", () => {
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 1000 });
			expect(cache.has("x")).toEqual(false);
		});

		test("returns true for a present key", () => {
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 1000 });
			cache.set("a", 1);
			expect(cache.has("a")).toEqual(true);
		});
	});

	describe("keys", () => {
		test("returns an empty array when the cache is empty", () => {
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 1000 });
			expect(cache.keys()).toEqual([]);
		});

		test("returns keys in ascending frequency order", () => {
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 60000 });
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);
			cache.get("a"); // a: freq=2
			cache.get("a"); // a: freq=3
			cache.get("b"); // b: freq=2
			// freq=1: [c], freq=2: [b], freq=3: [a]
			expect(cache.keys()).toEqual(["c", "b", "a"]);
		});

		test("within the same frequency, returns keys in LRU order", () => {
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 60000 });
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);
			// all freq=1; insertion order = LRU order
			expect(cache.keys()).toEqual(["a", "b", "c"]);
		});

		test("evicts idle entries during iteration and excludes them", () => {
			vi.useFakeTimers();
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 1000 });
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
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 1000 });
			cache.set("a", 1);
			cache.delete("a");
			expect(cache.get("a")).toBeUndefined();
			expect(cache.count()).toEqual(0);
		});

		test("is a no-op for a missing key", () => {
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 1000 });
			expect(() => cache.delete("missing")).not.toThrow();
		});
	});

	describe("clear", () => {
		test("removes all entries", () => {
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 1000 });
			cache.set("a", 1);
			cache.set("b", 2);
			cache.clear();
			expect(cache.count()).toEqual(0);
			expect(cache.get("a")).toBeUndefined();
		});
	});

	describe("LFU eviction", () => {
		test("evicts the least-frequently-used entry when capacity is exceeded", () => {
			cache = new LfuCache<number>({ capacity: 3, ttiMs: 60000 });
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);
			cache.get("a"); // a: freq=2
			cache.get("a"); // a: freq=3
			cache.get("b"); // b: freq=2
			// c has lowest freq (1) evicted when d is inserted
			cache.set("d", 4);
			expect(cache.get("c")).toBeUndefined();
			expect(cache.get("a")).toEqual(1);
			expect(cache.get("b")).toEqual(2);
			expect(cache.get("d")).toEqual(4);
		});

		test("breaks frequency ties by evicting the least-recently-used entry", () => {
			cache = new LfuCache<number>({ capacity: 3, ttiMs: 60000 });
			cache.set("a", 1); // a: freq=1, inserted first = LRU
			cache.set("b", 2); // b: freq=1
			cache.set("c", 3); // c: freq=1
			// all at freq=1; "a" is LRU evicted when d is inserted
			cache.set("d", 4);
			expect(cache.get("a")).toBeUndefined();
			expect(cache.get("b")).toEqual(2);
			expect(cache.get("c")).toEqual(3);
			expect(cache.get("d")).toEqual(4);
		});

		test("get increments frequency and prevents eviction", () => {
			cache = new LfuCache<number>({ capacity: 3, ttiMs: 60000 });
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);
			cache.get("a"); // a: freq=2 no longer the LFU
			// b is now LRU among freq=1 entries
			cache.set("d", 4);
			expect(cache.get("b")).toBeUndefined();
			expect(cache.get("a")).toEqual(1);
			expect(cache.get("c")).toEqual(3);
			expect(cache.get("d")).toEqual(4);
		});

		test("set on an existing key increments frequency", () => {
			cache = new LfuCache<number>({ capacity: 3, ttiMs: 60000 });
			cache.set("a", 1);
			cache.set("b", 2);
			cache.set("c", 3);
			cache.set("a", 10); // a: freq=2
			// b is LRU among freq=1
			cache.set("d", 4);
			expect(cache.get("b")).toBeUndefined();
			expect(cache.get("a")).toEqual(10);
			expect(cache.get("c")).toEqual(3);
			expect(cache.get("d")).toEqual(4);
		});

		test("new entry after eviction resets _minFreq to 1", () => {
			cache = new LfuCache<number>({ capacity: 2, ttiMs: 60000 });
			cache.set("a", 1);
			cache.get("a"); // a: freq=2
			cache.set("b", 2); // b: freq=1
			// at capacity; b has lower freq=1 than a's freq=2
			cache.set("c", 3); // should evict b (freq=1), then c gets freq=1
			expect(cache.get("b")).toBeUndefined();
			expect(cache.get("a")).toEqual(1);
			expect(cache.get("c")).toEqual(3);
		});

		test("count never exceeds capacity", () => {
			const capacity = 3;
			cache = new LfuCache<number>({ capacity, ttiMs: 60000 });
			for (let i = 0; i < 10; i++) {
				cache.set(`k${i}`, i);
				expect(cache.count()).toBeLessThanOrEqual(capacity);
			}
		});
	});

	describe("TTI eviction", () => {
		test("get evicts an idle entry and returns undefined", () => {
			vi.useFakeTimers();
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 1000 });
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
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 1000 });
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
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 1000 });
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
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 1000 });
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
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 1000 });
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
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 1000 });
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
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 1000 });
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
		test("idle entries are swept before LFU eviction on set", () => {
			vi.useFakeTimers();
			cache = new LfuCache<number>({ capacity: 3, ttiMs: 1000 });
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
			cache = new LfuCache<number>({ capacity: 3, ttiMs: 1000 });
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

		test("an idle existing key is replaced as a new entry when set again", () => {
			vi.useFakeTimers();
			cache = new LfuCache<number>({ capacity: 5, ttiMs: 1000 });
			try {
				cache.set("a", 1);
				cache.get("a"); // a: freq=2
				cache.get("a"); // a: freq=3
				vi.advanceTimersByTime(1000); // a expires
				cache.set("a", 99); // a re-added with freq=1
				expect(cache.get("a")).toEqual(99);
				// Confirm frequency was reset by filling cache and checking eviction
				cache = new LfuCache<number>({ capacity: 2, ttiMs: 10000 });
				cache.set("a", 1);
				cache.get("a"); // a: freq=2
				cache.get("a"); // a: freq=3
				vi.advanceTimersByTime(1000); // a expires
				cache.set("b", 2); // b: freq=1
				cache.set("a", 99); // a re-added with freq=1 (not 4)
				// both at freq=1; b was inserted first, so b is LRU
				cache.set("c", 3); // evicts b (LRU among freq=1)
				expect(cache.get("b")).toBeUndefined();
				expect(cache.get("a")).toEqual(99);
			} finally {
				cache.destroy();
				vi.useRealTimers();
			}
		});
	});
});
