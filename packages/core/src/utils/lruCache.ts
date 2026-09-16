// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { nameof } from "@twin.org/nameof";
import { Guards } from "./guards.js";
import { Is } from "./is.js";
import { Mutex } from "./mutex.js";
import { Validation } from "./validation.js";
import { RandomHelper } from "../helpers/randomHelper.js";
import type { IValidationFailure } from "../models/IValidationFailure.js";

/**
 * A fixed-capacity LRU cache with time-to-idle eviction.
 *
 * Entries are removed in two ways:
 * - Capacity eviction: when the cache is full the least-recently-used entry is removed first.
 * - TTI eviction: a background timer sweeps idle entries every ttiMs milliseconds.
 * The timer only runs while there are entries; it stops automatically when the cache empties.
 *
 * `get` and `set` both update an entry's LRU position and reset its idle timer.
 * `set` and `getOrSet` accept an optional hard expiry timestamp; the entry is removed once that
 * time is reached however recently it was used, and the TTI still applies alongside it.
 * `has` is a pure peek it evicts idle entries but does not refresh a live entry's TTI.
 * Call `destroy` when the cache is no longer needed to stop the background timer.
 */
export class LruCache<T = unknown> {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<LruCache>();

	/**
	 * Default capacity.
	 */
	public static readonly DEFAULT_CAPACITY = 1000;

	/**
	 * Default time-to-idle in milliseconds.
	 */
	public static readonly DEFAULT_TTI_MS = 10000;

	/**
	 * The maximum number of entries the cache will hold.
	 * @internal
	 */
	private readonly _capacity: number;

	/**
	 * The idle duration in milliseconds after which an untouched entry is evicted.
	 * @internal
	 */
	private readonly _ttiMs: number;

	/**
	 * Optional timeout in milliseconds for mutex acquisition.
	 * @internal
	 */
	private readonly _mutexTimeoutMs: number | undefined;

	/**
	 * Per-instance namespace prefix for mutex keys.
	 * @internal
	 */
	private readonly _mutexScope: string;

	/**
	 * Underlying storage; Map iteration order tracks LRU position (first = oldest).
	 * @internal
	 */
	private readonly _cache: Map<
		string,
		{ value: T; lastAccessed: number; expires: number | undefined }
	>;

	/**
	 * The earliest hard expiry timestamp among the live entries, used to pace the sweep timer.
	 * @internal
	 */
	private _nextExpires: number | undefined;

	/**
	 * The timestamp the pending sweep is due to run at.
	 * @internal
	 */
	private _scheduledDueAt: number;

	/**
	 * Handle for the pending idle-sweep timeout, or undefined if no timer is scheduled.
	 * @internal
	 */
	private _sweepTimer: ReturnType<typeof setTimeout> | undefined;

	/**
	 * Create a new instance of LruCache.
	 * @param options The cache options.
	 * @param options.capacity Maximum number of entries. Defaults to 1000. Must be a positive integer.
	 * @param options.ttiMs Time-to-idle in milliseconds. Defaults to 10000. Must be a positive integer.
	 * @param options.mutexTimeoutMs Maximum time in milliseconds to wait for getOrSet mutex acquisition.
	 * @throws ValidationError if capacity or ttiMs is not a positive integer.
	 */
	constructor(options?: { capacity?: number; ttiMs?: number; mutexTimeoutMs?: number }) {
		const capacity = options?.capacity ?? LruCache.DEFAULT_CAPACITY;
		const ttiMs = options?.ttiMs ?? LruCache.DEFAULT_TTI_MS;
		const mutexTimeoutMs = options?.mutexTimeoutMs;

		Guards.integer(LruCache.CLASS_NAME, nameof(capacity), capacity);
		Guards.integer(LruCache.CLASS_NAME, nameof(ttiMs), ttiMs);
		if (Is.notEmpty(mutexTimeoutMs)) {
			Guards.integer(LruCache.CLASS_NAME, nameof(mutexTimeoutMs), mutexTimeoutMs);
		}

		const failures: IValidationFailure[] = [];
		Validation.integer(nameof(capacity), capacity, failures, undefined, { minValue: 1 });
		Validation.integer(nameof(ttiMs), ttiMs, failures, undefined, { minValue: 1 });
		if (Is.notEmpty(mutexTimeoutMs)) {
			Validation.integer(nameof(mutexTimeoutMs), mutexTimeoutMs, failures, undefined, {
				minValue: 0
			});
		}
		Validation.asValidationError(LruCache.CLASS_NAME, nameof<LruCache>(), failures);

		this._capacity = capacity;
		this._ttiMs = ttiMs;
		this._mutexTimeoutMs = mutexTimeoutMs;
		this._mutexScope = `${LruCache.CLASS_NAME}:${RandomHelper.generateUuidV7()}`;
		this._cache = new Map();
		this._nextExpires = undefined;
		this._scheduledDueAt = 0;
		this._sweepTimer = undefined;
	}

	/**
	 * The number of entries currently held in the cache.
	 * @returns The number of entries in the cache.
	 */
	public count(): number {
		return this._cache.size;
	}

	/**
	 * Get a value from the cache.
	 * Returns undefined if the key is absent or the entry has idled out.
	 * A successful hit resets the entry's idle timer and moves it to most-recently-used.
	 * @param key The key to retrieve.
	 * @returns The cached value, or undefined on a miss or idle eviction.
	 */
	public get(key: string): T | undefined {
		Guards.stringValue(LruCache.CLASS_NAME, nameof(key), key);

		const entry = this._cache.get(key);
		if (entry === undefined) {
			return undefined;
		}
		const now = Date.now();
		if (this.isExpired(entry, now)) {
			this._cache.delete(key);
			return undefined;
		}
		// Move to end of Map (most-recently-used) via delete + re-insert
		this._cache.delete(key);
		entry.lastAccessed = now;
		this._cache.set(key, entry);

		return entry.value;
	}

	/**
	 * Store a value in the cache.
	 * If the key already exists its value and idle timer are refreshed.
	 * When the cache is at capacity, idle entries are swept first; if it is still full the
	 * least-recently-used entry is evicted.
	 * @param key The key to store.
	 * @param value The value to cache.
	 * @param expires Hard expiry timestamp in milliseconds since the epoch. The entry is removed
	 * once this time is reached regardless of how recently it was used. Must be an integer.
	 */
	public set(key: string, value: T, expires?: number): void {
		Guards.stringValue(LruCache.CLASS_NAME, nameof(key), key);

		if (!Is.empty(expires)) {
			Guards.integer(LruCache.CLASS_NAME, nameof(expires), expires);
		}

		const now = Date.now();
		// Remove any existing entry so the refreshed version is inserted at the end
		this._cache.delete(key);
		if (this._cache.size >= this._capacity) {
			this.sweepIdle();
		}
		if (this._cache.size >= this._capacity) {
			const lruKey = this._cache.keys().next().value;
			if (lruKey !== undefined) {
				this._cache.delete(lruKey);
			}
		}
		this._cache.set(key, { value, lastAccessed: now, expires });
		this.trackExpires(expires);
		this.startTimer();
	}

	/**
	 * Atomically get an existing value or create and store it once using an async factory.
	 * Concurrent calls for the same key are serialized via a mutex.
	 * @param key The key to get or create.
	 * @param valueFactory Async callback used to build a value when the key is absent.
	 * @param expires Hard expiry timestamp in milliseconds since the epoch, applied to the entry
	 * when one is created. Must be an integer.
	 * @returns The existing or newly created value.
	 */
	public async getOrSet(key: string, valueFactory: () => Promise<T>, expires?: number): Promise<T> {
		Guards.stringValue(LruCache.CLASS_NAME, nameof(key), key);
		Guards.function(LruCache.CLASS_NAME, nameof(valueFactory), valueFactory);
		if (!Is.empty(expires)) {
			Guards.integer(LruCache.CLASS_NAME, nameof(expires), expires);
		}

		const mutexKey = `${this._mutexScope}:${key}`;
		await Mutex.lock(mutexKey, {
			timeoutMs: this._mutexTimeoutMs,
			throwOnTimeout: true
		});

		try {
			if (this.has(key)) {
				return this.get(key) as T;
			}

			const value = await valueFactory();
			this.set(key, value, expires);
			return value;
		} finally {
			Mutex.unlock(mutexKey);
		}
	}

	/**
	 * Check whether a key exists in the cache and has not idled out.
	 * Idle entries are evicted on peek, but a live entry's TTI is not reset.
	 * @param key The key to test.
	 * @returns True if the key is present and not idle.
	 */
	public has(key: string): boolean {
		Guards.stringValue(LruCache.CLASS_NAME, nameof(key), key);
		const entry = this._cache.get(key);
		if (entry === undefined) {
			return false;
		}
		if (this.isExpired(entry, Date.now())) {
			this._cache.delete(key);
			return false;
		}
		return true;
	}

	/**
	 * Return all keys for entries that have not idled out.
	 * Idle entries encountered during iteration are evicted.
	 * @returns An array of live keys in least-recently-used to most-recently-used order.
	 */
	public keys(): string[] {
		const now = Date.now();
		const result: string[] = [];
		for (const [k, entry] of this._cache) {
			if (this.isExpired(entry, now)) {
				this._cache.delete(k);
			} else {
				result.push(k);
			}
		}
		return result;
	}

	/**
	 * Remove an entry from the cache.
	 * Cancels the background timer if the cache becomes empty.
	 * @param key The key to remove.
	 */
	public delete(key: string): void {
		Guards.stringValue(LruCache.CLASS_NAME, nameof(key), key);
		this._cache.delete(key);
		if (this._cache.size === 0) {
			this.cancelTimer();
		}
	}

	/**
	 * Remove all entries from the cache and cancel the background timer.
	 */
	public clear(): void {
		this.cancelTimer();
		this._cache.clear();
		this._nextExpires = undefined;
	}

	/**
	 * Stop the background idle-sweep timer and release all entries.
	 * The cache must not be used after this call.
	 */
	public destroy(): void {
		this.cancelTimer();
		this._cache.clear();
		this._nextExpires = undefined;
	}

	/**
	 * Delete all entries whose idle time has been exceeded, then restart the timer
	 * if any entries remain.
	 * @internal
	 */
	private sweepIdle(): void {
		this.cancelTimer();
		const now = Date.now();
		let nextExpires: number | undefined;
		for (const [k, entry] of this._cache) {
			if (this.isExpired(entry, now)) {
				this._cache.delete(k);
			} else if (
				Is.notEmpty(entry.expires) &&
				(Is.empty(nextExpires) || entry.expires < nextExpires)
			) {
				nextExpires = entry.expires;
			}
		}
		this._nextExpires = nextExpires;
		if (this._cache.size > 0) {
			this.startTimer();
		}
	}

	/**
	 * Record an entry expiry timestamp if it is earlier than the currently tracked one.
	 * @param expires The expiry timestamp in milliseconds, or undefined for none.
	 * @internal
	 */
	private trackExpires(expires: number | undefined): void {
		if (Is.notEmpty(expires) && (Is.empty(this._nextExpires) || expires < this._nextExpires)) {
			this._nextExpires = expires;
		}
	}

	/**
	 * Determine whether an entry has idled out or reached its hard expiry timestamp.
	 * @param entry The entry to test.
	 * @param entry.lastAccessed The last-accessed timestamp in milliseconds.
	 * @param entry.expires The hard expiry timestamp in milliseconds, or undefined for none.
	 * @param now The current time in milliseconds.
	 * @returns True if the entry should be removed.
	 * @internal
	 */
	private isExpired(
		entry: { lastAccessed: number; expires: number | undefined },
		now: number
	): boolean {
		return (
			now - entry.lastAccessed >= this._ttiMs ||
			(Is.notEmpty(entry.expires) && now >= entry.expires)
		);
	}

	/**
	 * Schedule the next sweep if no timer is already pending, bringing a pending one forward
	 * when an entry with an earlier hard expiry has since been added.
	 * @internal
	 */
	private startTimer(): void {
		const now = Date.now();
		let delay = this._ttiMs;
		if (Is.notEmpty(this._nextExpires)) {
			delay = Math.min(delay, Math.max(0, this._nextExpires - now));
		}
		if (Is.empty(this._sweepTimer)) {
			this._scheduledDueAt = now + delay;
			this._sweepTimer = setTimeout(() => this.sweepIdle(), delay);
		} else if (now + delay < this._scheduledDueAt) {
			this.cancelTimer();
			this.startTimer();
		}
	}

	/**
	 * Cancel the pending idle-sweep timer.
	 * @internal
	 */
	private cancelTimer(): void {
		if (Is.notEmpty(this._sweepTimer)) {
			clearTimeout(this._sweepTimer);
			this._sweepTimer = undefined;
		}
	}
}
