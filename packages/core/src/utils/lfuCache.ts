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
 * A fixed-capacity LFU cache with time-to-idle eviction.
 *
 * Entries are removed in two ways:
 * - Capacity eviction: when the cache is full the least-frequently-used entry is removed first.
 * Ties in frequency are broken by recency the least-recently-used entry among those with the
 * minimum frequency is evicted.
 * - TTI eviction: a background timer sweeps idle entries every ttiMs milliseconds.
 * The timer only runs while there are entries; it stops automatically when the cache empties.
 *
 * `get` and `set` increment an entry's access frequency and reset its idle timer.
 * `set` and `getOrSet` accept an optional hard expiry timestamp; the entry is removed once that
 * time is reached however recently it was used, and the TTI still applies alongside it.
 * `has` and `keys` are pure peeks they evict idle entries but do not affect frequency or TTI.
 * Call `destroy` when the cache is no longer needed to stop the background timer.
 */
export class LfuCache<T> {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<LfuCache<unknown>>();

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
	 * Maps each key to its cached value, access frequency, and last-accessed timestamp.
	 * @internal
	 */
	private readonly _keyMap: Map<
		string,
		{ value: T; freq: number; lastAccessed: number; expires: number | undefined }
	>;

	/**
	 * Maps each frequency to the ordered set of keys at that frequency (insertion order = LRU).
	 * @internal
	 */
	private readonly _freqMap: Map<number, Set<string>>;

	/**
	 * The lowest frequency among all live entries. Maintained to make eviction O(1).
	 * @internal
	 */
	private _minFreq: number;

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
	 * Create a new instance of LfuCache.
	 * @param options The cache options.
	 * @param options.capacity Maximum number of entries. Defaults to 1000. Must be a positive integer.
	 * @param options.ttiMs Time-to-idle in milliseconds. Defaults to 10000. Must be a positive integer.
	 * @param options.mutexTimeoutMs Maximum time in milliseconds to wait for getOrSet mutex acquisition.
	 * @throws ValidationError if capacity or ttiMs is not a positive integer.
	 */
	constructor(options?: { capacity?: number; ttiMs?: number; mutexTimeoutMs?: number }) {
		const capacity = options?.capacity ?? LfuCache.DEFAULT_CAPACITY;
		const ttiMs = options?.ttiMs ?? LfuCache.DEFAULT_TTI_MS;
		const mutexTimeoutMs = options?.mutexTimeoutMs;

		Guards.integer(LfuCache.CLASS_NAME, nameof(capacity), capacity);
		Guards.integer(LfuCache.CLASS_NAME, nameof(ttiMs), ttiMs);
		if (Is.notEmpty(mutexTimeoutMs)) {
			Guards.integer(LfuCache.CLASS_NAME, nameof(mutexTimeoutMs), mutexTimeoutMs);
		}

		const failures: IValidationFailure[] = [];
		Validation.integer(nameof(capacity), capacity, failures, undefined, { minValue: 1 });
		Validation.integer(nameof(ttiMs), ttiMs, failures, undefined, { minValue: 1 });
		if (Is.notEmpty(mutexTimeoutMs)) {
			Validation.integer(nameof(mutexTimeoutMs), mutexTimeoutMs, failures, undefined, {
				minValue: 0
			});
		}
		Validation.asValidationError(LfuCache.CLASS_NAME, nameof<LfuCache<unknown>>(), failures);

		this._capacity = capacity;
		this._ttiMs = ttiMs;
		this._mutexTimeoutMs = mutexTimeoutMs;
		this._mutexScope = `${LfuCache.CLASS_NAME}:${RandomHelper.generateUuidV7()}`;
		this._keyMap = new Map();
		this._freqMap = new Map();
		this._minFreq = 0;
		this._nextExpires = undefined;
		this._scheduledDueAt = 0;
		this._sweepTimer = undefined;
	}

	/**
	 * The number of entries currently held in the cache.
	 * @returns The number of entries in the cache.
	 */
	public count(): number {
		return this._keyMap.size;
	}

	/**
	 * Get a value from the cache.
	 * Returns undefined if the key is absent or the entry has idled out.
	 * A successful hit increments the entry's frequency and resets its idle timer.
	 * @param key The key to retrieve.
	 * @returns The cached value, or undefined on a miss or idle eviction.
	 */
	public get(key: string): T | undefined {
		Guards.stringValue(LfuCache.CLASS_NAME, nameof(key), key);

		const entry = this.lookupLive(key);
		if (Is.empty(entry)) {
			return undefined;
		}
		this.promote(key, entry);

		return entry.value;
	}

	/**
	 * Store a value in the cache.
	 * If the key already exists its value and frequency are updated.
	 * When the cache is at capacity, idle entries are swept first; if it is still full the
	 * least-frequently-used entry is evicted (LRU among ties).
	 * @param key The key to store.
	 * @param value The value to cache.
	 * @param expires Hard expiry timestamp in milliseconds since the epoch. The entry is removed
	 * once this time is reached regardless of how recently it was used. Must be an integer.
	 */
	public set(key: string, value: T, expires?: number): void {
		Guards.stringValue(LfuCache.CLASS_NAME, nameof(key), key);
		if (!Is.empty(expires)) {
			Guards.integer(LfuCache.CLASS_NAME, nameof(expires), expires);
		}

		const existing = this._keyMap.get(key);
		if (existing !== undefined) {
			if (this.isExpired(existing, Date.now())) {
				// Idle or expired: evict and fall through to add as a fresh entry
				this.removeEntry(key);
			} else {
				existing.value = value;
				existing.expires = expires;
				this.trackExpires(expires);
				this.promote(key, existing);
				this.startTimer();
				return;
			}
		}
		if (this._keyMap.size >= this._capacity) {
			this.sweepIdle();
		}
		if (this._keyMap.size >= this._capacity) {
			this.evictLfu();
		}
		const entry = { value, freq: 1, lastAccessed: Date.now(), expires };
		this._keyMap.set(key, entry);
		let bucket = this._freqMap.get(1);
		if (bucket === undefined) {
			bucket = new Set<string>();
			this._freqMap.set(1, bucket);
		}
		bucket.add(key);
		this._minFreq = 1;
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
		Guards.stringValue(LfuCache.CLASS_NAME, nameof(key), key);
		Guards.function(LfuCache.CLASS_NAME, nameof(valueFactory), valueFactory);
		if (!Is.empty(expires)) {
			Guards.integer(LfuCache.CLASS_NAME, nameof(expires), expires);
		}

		const mutexKey = `${this._mutexScope}:${key}`;
		await Mutex.lock(mutexKey, {
			timeoutMs: this._mutexTimeoutMs,
			throwOnTimeout: true
		});

		try {
			const entry = this.lookupLive(key);
			if (Is.notEmpty(entry)) {
				this.promote(key, entry);
				return entry.value;
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
	 * Idle entries are evicted on peek, but a live entry's frequency and TTI are not updated.
	 * @param key The key to test.
	 * @returns True if the key is present and not idle.
	 */
	public has(key: string): boolean {
		Guards.stringValue(LfuCache.CLASS_NAME, nameof(key), key);
		return Is.notEmpty(this.lookupLive(key));
	}

	/**
	 * Return all keys for entries that have not idled out.
	 * Idle entries encountered during iteration are evicted.
	 * Keys are returned in ascending frequency order; within the same frequency, LRU first.
	 * @returns An array of live keys ordered from least-frequently-used to most-frequently-used.
	 */
	public keys(): string[] {
		const now = Date.now();
		for (const [k, entry] of this._keyMap) {
			if (this.isExpired(entry, now)) {
				this.removeEntry(k);
			}
		}
		const result: string[] = [];
		const sortedFreqs = [...this._freqMap.keys()].sort((a, b) => a - b);
		for (const freq of sortedFreqs) {
			const bucket = this._freqMap.get(freq);
			if (bucket !== undefined) {
				for (const k of bucket) {
					result.push(k);
				}
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
		Guards.stringValue(LfuCache.CLASS_NAME, nameof(key), key);
		this.removeEntry(key);
		if (this._keyMap.size === 0) {
			this.cancelTimer();
		}
	}

	/**
	 * Remove all entries from the cache and cancel the background timer.
	 */
	public clear(): void {
		this.cancelTimer();
		this._keyMap.clear();
		this._freqMap.clear();
		this._minFreq = 0;
		this._nextExpires = undefined;
	}

	/**
	 * Stop the background idle-sweep timer and release all entries.
	 * The cache must not be used after this call.
	 */
	public destroy(): void {
		this.cancelTimer();
		this._keyMap.clear();
		this._freqMap.clear();
		this._minFreq = 0;
		this._nextExpires = undefined;
	}

	/**
	 * Resolve an entry which is present and has not expired, evicting it if it has.
	 * The expiry check is evaluated once so a caller cannot observe an entry as live and
	 * then as expired across two separate lookups.
	 * @param key The key to resolve.
	 * @returns The live entry, or undefined if the key is absent or has been evicted.
	 * @internal
	 */
	private lookupLive(
		key: string
	): { value: T; freq: number; lastAccessed: number; expires: number | undefined } | undefined {
		const entry = this._keyMap.get(key);
		if (Is.empty(entry)) {
			return undefined;
		}
		if (this.isExpired(entry, Date.now())) {
			this.removeEntry(key);
			return undefined;
		}
		return entry;
	}

	/**
	 * Increment the frequency of an entry and move it to the correct frequency bucket.
	 * Updates lastAccessed to now.
	 * @param key The key to promote.
	 * @param entry The entry object to update in place.
	 * @param entry.value The cached value.
	 * @param entry.freq The current access frequency.
	 * @param entry.lastAccessed The last-accessed timestamp in milliseconds.
	 * @param entry.expires The hard expiry timestamp in milliseconds, or undefined for none.
	 * @internal
	 */
	private promote(
		key: string,
		entry: { value: T; freq: number; lastAccessed: number; expires: number | undefined }
	): void {
		const oldFreq = entry.freq;
		const oldBucket = this._freqMap.get(oldFreq);
		if (oldBucket !== undefined) {
			oldBucket.delete(key);
			if (oldBucket.size === 0) {
				this._freqMap.delete(oldFreq);
				if (oldFreq === this._minFreq) {
					this._minFreq = oldFreq + 1;
				}
			}
		}
		entry.freq += 1;
		entry.lastAccessed = Date.now();
		let newBucket = this._freqMap.get(entry.freq);
		if (newBucket === undefined) {
			newBucket = new Set<string>();
			this._freqMap.set(entry.freq, newBucket);
		}
		newBucket.add(key);
	}

	/**
	 * Evict the least-frequently-used entry, breaking ties by recency.
	 * @internal
	 */
	private evictLfu(): void {
		const bucket = this._freqMap.get(this._minFreq);
		if (bucket === undefined) {
			return;
		}
		const evictKey = bucket.values().next().value as string;
		bucket.delete(evictKey);
		if (bucket.size === 0) {
			this._freqMap.delete(this._minFreq);
		}
		this._keyMap.delete(evictKey);
	}

	/**
	 * Remove an entry from both the key map and its frequency bucket.
	 * Recalculates _minFreq if the removed entry was the last one at _minFreq.
	 * @param key The key to remove.
	 * @internal
	 */
	private removeEntry(key: string): void {
		const entry = this._keyMap.get(key);
		if (entry === undefined) {
			return;
		}
		this._keyMap.delete(key);
		const bucket = this._freqMap.get(entry.freq);
		if (bucket !== undefined) {
			bucket.delete(key);
			if (bucket.size === 0) {
				this._freqMap.delete(entry.freq);
				if (entry.freq === this._minFreq) {
					let newMin = Number.MAX_SAFE_INTEGER;
					for (const f of this._freqMap.keys()) {
						if (f < newMin) {
							newMin = f;
						}
					}
					this._minFreq = newMin === Number.MAX_SAFE_INTEGER ? 1 : newMin;
				}
			}
		}
	}

	/**
	 * Cancel the pending timer, sweep idle entries, then restart the timer if entries remain.
	 * @internal
	 */
	private sweepIdle(): void {
		this.cancelTimer();
		const now = Date.now();
		let nextExpires: number | undefined;
		for (const [k, entry] of this._keyMap) {
			if (this.isExpired(entry, now)) {
				this.removeEntry(k);
			} else if (
				Is.notEmpty(entry.expires) &&
				(Is.empty(nextExpires) || entry.expires < nextExpires)
			) {
				nextExpires = entry.expires;
			}
		}
		this._nextExpires = nextExpires;
		if (this._keyMap.size > 0) {
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
