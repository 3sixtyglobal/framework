// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
const { ContextIdStore } = await import('@twin.org/context');

export const testMethod = () => 1;
export const testMethodAdd = (value1, value2) => value1 + value2;
export const testMethodAddAsync = async (value1, value2) => value1 * value2;
export const testValue = 2;
export const testMethodWithError = () => {
	throw new Error('This is a test error');
};
export const testMethodWithErrorAsync = async () => {
	throw new Error('This is a test error async');
};

let continueRunning = true;
let runningTotal = 0;
const tasks = [];

export const testStartTaskRunner = async () => {
	// eslint-disable-next-line no-unmodified-loop-condition
	while (continueRunning) {
		if (tasks.length > 0) {
			const task = tasks.shift();
			runningTotal += task.value;
			task.complete();
		}
		await new Promise(resolve => setTimeout(resolve, 50));
	}
};

export const testTask = async value =>
	new Promise(resolve => {
		tasks.push({
			complete: () => resolve(runningTotal),
			value
		});
	});

export const testEndTaskRunner = async () => {
	continueRunning = false;
	return runningTotal;
};

export const testMethodWithContextIds = async () => {
	const contextIds = await ContextIdStore.getContextIds();
	return contextIds;
};
