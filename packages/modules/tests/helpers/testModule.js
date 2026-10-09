// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
const { ContextIdStore } = await import('@3sixty/context');
const { Mutex, NativeModules, SharedStore } = await import('@3sixty/core');

export function testMethod() {
	return 1;
}

export function testMethodAdd(value1, value2) {
	return value1 + value2;
}

export async function testMethodAddAsync(value1, value2) {
	return value1 * value2;
}

export const testValue = 2;

export function testMethodHasNativeModule(name) {
	return NativeModules.getModule(name) !== undefined;
}

export function testMethodModuleHelperOptions() {
	const options = SharedStore.get('moduleHelperOptions');
	options?.onMessage?.('info', 'test.message', { value: 1 });
	return options === undefined
		? undefined
		: { ...options, hasOnMessage: typeof options.onMessage === 'function', onMessage: undefined };
}

export function testMethodWithError() {
	throw new Error('This is a test error');
}

export async function testMethodWithErrorAsync() {
	throw new Error('This is a test error async');
}

let continueRunning = true;
let runningTotal = 0;
const tasks = [];

export async function testStartTaskRunner() {
	// eslint-disable-next-line no-unmodified-loop-condition
	while (continueRunning) {
		if (tasks.length > 0) {
			const task = tasks.shift();
			runningTotal += task.value;
			task.complete();
		}
		await new Promise(resolve => setTimeout(resolve, 50));
	}
}

export async function testTask(value) {
	return new Promise(resolve => {
		tasks.push({
			complete: () => resolve(runningTotal),
			value
		});
	});
}

export async function testEndTaskRunner() {
	continueRunning = false;
	return runningTotal;
}

export async function testMethodWithContextIds() {
	const contextIds = await ContextIdStore.getContextIds();
	return contextIds;
}

export async function testMethodAcquireMutex(key, holdMs = 0) {
	await Mutex.lock(key, { timeoutMs: 5000, throwOnTimeout: true });
	if (holdMs > 0) {
		await new Promise(resolve => setTimeout(resolve, holdMs));
	}
	Mutex.unlock(key);
	return 'acquired';
}

// Like testMethodAcquireMutex but also writes 1 to signalBuf once the lock is held,
// so the main thread can synchronise without polling or arbitrary sleeps.
export async function testMethodAcquireMutexSignalled(key, signalBuf, holdMs = 0) {
	await Mutex.lock(key, { timeoutMs: 5000, throwOnTimeout: true });
	const signal = new Int32Array(signalBuf);
	Atomics.store(signal, 0, 1);
	Atomics.notify(signal, 0, 1);
	if (holdMs > 0) {
		await new Promise(resolve => setTimeout(resolve, holdMs));
	}
	Mutex.unlock(key);
	return 'acquired';
}

export async function testMethodTryAcquireMutex(key, timeoutMs) {
	return Mutex.lock(key, { timeoutMs });
}

// Acquires the mutex, performs a non-atomic read-modify-write on counterBuf, releases.
// The separate Atomics.load + Atomics.store is intentionally non-atomic so that any gap
// in mutex protection would produce a lost update.
export async function testMethodMutexIncrement(key, counterBuf) {
	await Mutex.lock(key, { timeoutMs: 10000, throwOnTimeout: true });
	const counter = new Int32Array(counterBuf);
	const val = Atomics.load(counter, 0);
	Atomics.store(counter, 0, val + 1);
	Mutex.unlock(key);
	return val + 1;
}
