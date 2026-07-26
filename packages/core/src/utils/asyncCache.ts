// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Is } from "./is.js";
import { SharedStore } from "./sharedStore.js";

/**
 * Cache the results from asynchronous requests.
 */
export class AsyncCache {
	/**
	 * Cache key for the shared cache object in the SharedStore.
	 * @internal
	 */
	private static readonly _CACHE_KEY = "asyncCache";

	/**
	 * Cache key for the entry key of the soonest-expiring cache entry, used to optimize cleanup.
	 * @internal
	 */
	private static readonly _NEXT_EXPIRY_CACHE_KEY = "asyncCacheNextExpiryKey";

	/**
	 * Cache key for the timestamp of the last full cleanup scan.
	 * @internal
	 */
	private static readonly _LAST_CLEANUP_KEY = "asyncCacheLastCleanup";

	/**
	 * Minimum interval in ms between full cleanup scans.
	 * @internal
	 */
	private static readonly _CLEANUP_INTERVAL_MS = 5000;

	/**
	 * Execute an async request and cache the result. A result that resolves to
	 * undefined or null is treated as a cache miss for later callers, who re-run
	 * requestMethod themselves instead of waiting on the empty value.
	 * @param key The key for the entry in the cache.
	 * @param ttlMs The TTL of the entry in the cache.
	 * @param requestMethod The method to call if not cached.
	 * @param cacheFailures Cache failure results, defaults to false.
	 * @returns The response.
	 */
	public static async exec<T = unknown>(
		key: string,
		ttlMs: number | undefined,
		requestMethod: () => Promise<T>,
		cacheFailures?: boolean
	): Promise<T> {
		const cacheEnabled = Is.integer(ttlMs) && ttlMs > 0;
		if (!cacheEnabled) {
			// No caching, just execute the request method
			return requestMethod();
		}

		AsyncCache.cleanupExpired();
		// Cleanup will not necessarily remove the entry for the key we are requesting
		// as it is throttled, so we also check and evict if expired here to ensure we don't return stale data.
		AsyncCache.evictIfExpired(key);

		const cache = AsyncCache.getSharedCache<T>();
		const cachedEntry = cache[key];

		// Do we have a cache entry for the key
		if (cachedEntry) {
			if (!Is.empty(cachedEntry.result)) {
				// If the cache has already resulted in a value, resolve it
				return Promise.resolve(cachedEntry.result);
			} else if (!Is.empty(cachedEntry.error)) {
				// If the cache has already resulted in an error, reject it
				return Promise.reject(cachedEntry.error);
			} else if (!cachedEntry.inProgress) {
				// The request already settled with an empty/nullish result. Both result
				// and error are empty here, which would otherwise look identical to
				// "still in progress" - but inProgress tells us the one-time settlement
				// callback below already fired, so nothing would ever drain a new queue
				// entry for this stale record. Treat it as a miss and re-run fresh,
				// mirroring how an uncached failure is handled just below.
				if (cache[key] === cachedEntry) {
					delete cache[key];
				}
				return AsyncCache.exec(key, ttlMs, requestMethod, cacheFailures);
			}

			// Otherwise create a promise to return and store the resolver
			// and rejector in the cache entry, so that we can call then
			// when the request is done

			let storedResolve: ((value: T | PromiseLike<T>) => void) | undefined;
			let storedReject: ((reason?: unknown) => void) | undefined;
			const wait = new Promise<T>((resolve, reject) => {
				storedResolve = resolve;
				storedReject = reject;
			});
			if (!Is.empty(storedResolve) && !Is.empty(storedReject)) {
				cachedEntry.promiseQueue.push({
					requestMethod,
					resolve: storedResolve,
					reject: storedReject
				});
			}
			return wait;
		}

		// If we don't have a cache entry, create a new one
		const expires = Date.now() + ttlMs;
		const cacheEntry: {
			result?: T;
			error?: unknown;
			inProgress?: boolean;
			promiseQueue: {
				requestMethod: () => Promise<T>;
				resolve: (value: T | PromiseLike<T>) => void;
				reject: (reason?: unknown) => void;
			}[];
			expires: number;
		} = {
			inProgress: true,
			promiseQueue: [],
			expires
		};
		cache[key] = cacheEntry;
		AsyncCache.updateNextExpiryKey(key, expires);

		// Return a promise that wraps the original request method
		// so that we can store any results or errors in the cache
		return new Promise((resolve, reject) => {
			// Call the request method and store the result
			requestMethod()
				// eslint-disable-next-line promise/prefer-await-to-then
				.then(res => {
					// If the request was successful, store the result
					cacheEntry.inProgress = false;
					cacheEntry.result = res;

					// and resolve both this promise and all the waiters
					resolve(res);
					for (const wait of cacheEntry.promiseQueue) {
						wait.resolve(res);
					}
					cacheEntry.promiseQueue = [];
					return res;
				})
				// eslint-disable-next-line promise/prefer-await-to-then
				.catch((err: unknown) => {
					// Reject the promise
					reject(err);
					cacheEntry.inProgress = false;

					// Handle the waiters based on the cacheFailures flag
					if (cacheFailures ?? false) {
						// If we are caching failures, store the error and reject the waiters
						cacheEntry.error = err;
						for (const wait of cacheEntry.promiseQueue) {
							wait.reject(err);
						}
						// Clear the waiters so we don't call them again
						cacheEntry.promiseQueue = [];
					} else {
						// If not caching failures for any queued requests we
						// have no value to either resolve or reject, so we
						// just resolve with the original request method
						for (const wait of cacheEntry.promiseQueue) {
							// eslint-disable-next-line @typescript-eslint/no-floating-promises
							AsyncCache.resolveWaiter(wait.requestMethod, wait.resolve, wait.reject);
						}
						if (cache[key] === cacheEntry) {
							delete cache[key];
						}
					}
				});
		});
	}

	/**
	 * Get an entry from the cache.
	 * @param key The key to get from the cache.
	 * @returns The item from the cache if it exists, or undefined if the key is missing, expired, or
	 * its request is still in-progress. Throws if a cached failure exists for the key.
	 */
	public static async get<T = unknown>(key: string): Promise<T | undefined> {
		if (AsyncCache.evictIfExpired(key)) {
			return undefined;
		}

		const cache = AsyncCache.getSharedCache<T>();
		const entry = cache[key];

		if (!Is.empty(entry?.result)) {
			// If the cache has already resulted in a value, resolve it
			return entry.result;
		}

		if (!Is.empty(entry?.error)) {
			// If the cache has already resulted in an error, reject it
			throw entry.error as Error;
		}
	}

	/**
	 * Set an entry into the cache.
	 * @param key The key to set in the cache.
	 * @param value The value to set in the cache.
	 * @param ttlMs The TTL of the entry in the cache in milliseconds. Defaults to 1000 (1 second).
	 * @returns A promise that resolves when the entry has been stored.
	 */
	public static async set<T = unknown>(key: string, value: T, ttlMs?: number): Promise<void> {
		const expires = Date.now() + (ttlMs ?? 1000);
		const cache = AsyncCache.getSharedCache();
		cache[key] = {
			result: value,
			promiseQueue: [],
			expires
		};
		AsyncCache.updateNextExpiryKey(key, expires);
	}

	/**
	 * Remove an entry from the cache.
	 * @param key The key to remove from the cache.
	 */
	public static remove(key: string): void {
		const cache = AsyncCache.getSharedCache();
		delete cache[key];
		const nextKey = SharedStore.get<string>(AsyncCache._NEXT_EXPIRY_CACHE_KEY);
		if (nextKey === key) {
			AsyncCache.recalculateNextKey();
		}
	}

	/**
	 * Clear the cache.
	 * @param prefix Optional prefix to clear only entries with that prefix.
	 */
	public static clearCache(prefix?: string): void {
		const cache = AsyncCache.getSharedCache();
		if (Is.stringValue(prefix)) {
			const nextKey = SharedStore.get<string>(AsyncCache._NEXT_EXPIRY_CACHE_KEY);
			let nextKeyRemoved = false;
			for (const entry in cache) {
				if (entry.startsWith(prefix)) {
					if (entry === nextKey) {
						nextKeyRemoved = true;
					}
					delete cache[entry];
				}
			}
			if (nextKeyRemoved) {
				AsyncCache.recalculateNextKey();
			}
		} else {
			SharedStore.set(AsyncCache._CACHE_KEY, {});
			SharedStore.set(AsyncCache._NEXT_EXPIRY_CACHE_KEY, undefined);
			SharedStore.set(AsyncCache._LAST_CLEANUP_KEY, Date.now());
		}
	}

	/**
	 * Perform a cleanup of the expired entries in the cache.
	 */
	public static cleanupExpired(): void {
		const now = Date.now();
		const lastCleanup = SharedStore.get<number>(AsyncCache._LAST_CLEANUP_KEY) ?? 0;
		if (now - lastCleanup < AsyncCache._CLEANUP_INTERVAL_MS) {
			return;
		}

		const expiry = AsyncCache.getNextExpiry();
		if (expiry !== undefined && expiry > now) {
			// Nothing is expired yet. Stamp the time so the throttle suppresses further checks
			// for the next interval. Per-key freshness is still guaranteed because exec() and
			// get() call evictIfExpired() directly before reading the cache.
			SharedStore.set(AsyncCache._LAST_CLEANUP_KEY, now);
			return;
		}

		SharedStore.set(AsyncCache._LAST_CLEANUP_KEY, now);
		AsyncCache.recalculateNextKey();
	}

	/**
	 * Get the shared cache.
	 * @returns The shared cache.
	 * @internal
	 */
	private static getSharedCache<T = unknown>(): {
		[url: string]: {
			result?: T;
			error?: unknown;
			inProgress?: boolean;
			promiseQueue: {
				requestMethod: () => Promise<T>;
				resolve: (value: T | PromiseLike<T>) => void;
				reject: (reason?: unknown) => void;
			}[];
			expires: number;
		};
	} {
		return SharedStore.get<{
			[url: string]: {
				result?: T;
				error?: unknown;
				inProgress?: boolean;
				promiseQueue: {
					requestMethod: () => Promise<T>;
					resolve: (value: T | PromiseLike<T>) => void;
					reject: (reason?: unknown) => void;
				}[];
				expires: number;
			};
		}>(AsyncCache._CACHE_KEY, () => ({}));
	}

	/**
	 * Resolve a waiter by re-running its request method safely.
	 * @param requestMethod The method to execute.
	 * @param resolve The resolver for the waiter.
	 * @param reject The rejector for the waiter.
	 * @internal
	 */
	private static async resolveWaiter<T>(
		requestMethod: () => Promise<T>,
		resolve: (value: T | PromiseLike<T>) => void,
		reject: (reason?: unknown) => void
	): Promise<void> {
		try {
			resolve(await requestMethod());
		} catch (waitErr) {
			reject(waitErr);
		}
	}

	/**
	 * Scan all cache entries, delete any that have expired, and record the key of the
	 * soonest-expiring remaining entry.
	 * @internal
	 */
	private static recalculateNextKey(): void {
		const now = Date.now();
		const cache = AsyncCache.getSharedCache();

		if (Object.keys(cache).length === 0) {
			SharedStore.set(AsyncCache._NEXT_EXPIRY_CACHE_KEY, undefined);
			return;
		}

		let newNextKey: string | undefined;
		let newNextExpiry = Number.MAX_SAFE_INTEGER;
		for (const entryKey in cache) {
			const { expires, inProgress } = cache[entryKey];
			if (expires > 0 && expires < now && inProgress !== true) {
				delete cache[entryKey];
			} else if (expires > 0 && expires < newNextExpiry) {
				newNextExpiry = expires;
				newNextKey = entryKey;
			}
		}
		SharedStore.set(AsyncCache._NEXT_EXPIRY_CACHE_KEY, newNextKey);
	}

	/**
	 * Update the tracked next-expiry entry key if the given entry expires sooner than the current one.
	 * @param key The cache entry key.
	 * @param expires The expiry timestamp of the entry.
	 * @internal
	 */
	private static updateNextExpiryKey(key: string, expires: number): void {
		const expiry = AsyncCache.getNextExpiry();
		if (expiry !== undefined && expiry <= expires) {
			return;
		}
		SharedStore.set(AsyncCache._NEXT_EXPIRY_CACHE_KEY, key);
	}

	/**
	 * Deletes the given key from the cache if it has expired and is not in-progress.
	 * Returns true if the entry was evicted.
	 * @param key The cache entry key to check.
	 * @returns True if the expired entry was removed; otherwise, false.
	 * @internal
	 */
	private static evictIfExpired(key: string): boolean {
		const cache = AsyncCache.getSharedCache();
		const entry = cache[key];
		if (!Is.empty(entry) && entry.expires > 0 && entry.expires < Date.now() && !entry.inProgress) {
			delete cache[key];
			return true;
		}
		return false;
	}

	/**
	 * Returns the expiry timestamp of the tracked next-expiry entry, or undefined if there
	 * is no tracked entry or it is no longer present in the cache.
	 * @returns The next tracked expiry timestamp, if one is still available.
	 * @internal
	 */
	private static getNextExpiry(): number | undefined {
		const nextKey = SharedStore.get<string>(AsyncCache._NEXT_EXPIRY_CACHE_KEY);
		if (Is.empty(nextKey)) {
			return undefined;
		}
		const cache = AsyncCache.getSharedCache();
		const nextEntry = cache[nextKey];
		return Is.empty(nextEntry) ? undefined : nextEntry.expires;
	}
}
