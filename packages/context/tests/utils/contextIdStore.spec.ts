// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import path from "node:path";
import { describe, it, expect } from "vitest";
import type { IContextIds } from "../../src/models/IContextIds.js";
import { ContextIdStore } from "../../src/utils/contextIdStore.js";

describe("ContextIdStore", () => {
	it("should return undefined when no context is set", async () => {
		const contextIds = await ContextIdStore.getContextIds();
		expect(contextIds).toBeUndefined();
	});

	it("should store and retrieve context IDs within run method", async () => {
		const testContextIds: IContextIds = {
			organization: "org123",
			user: "user456"
		};

		await ContextIdStore.run(testContextIds, async () => {
			const retrievedContextIds = await ContextIdStore.getContextIds();
			expect(retrievedContextIds).toEqual(testContextIds);
		});
	});

	it("should return undefined after run method completes", async () => {
		const testContextIds: IContextIds = {
			organization: "org123"
		};

		await ContextIdStore.run(testContextIds, async () => {
			// Context should be available here
			expect(await ContextIdStore.getContextIds()).toEqual(testContextIds);
		});

		// Context should be undefined after run completes
		expect(await ContextIdStore.getContextIds()).toBeUndefined();
	});

	it("should handle nested run calls with different context IDs", async () => {
		const outerContext: IContextIds = {
			organization: "outer-org"
		};

		const innerContext: IContextIds = {
			organization: "inner-org",
			user: "inner-user"
		};

		await ContextIdStore.run(outerContext, async () => {
			expect(await ContextIdStore.getContextIds()).toEqual(outerContext);

			await ContextIdStore.run(innerContext, async () => {
				expect(await ContextIdStore.getContextIds()).toEqual(innerContext);
			});

			// Should restore outer context after inner run completes
			expect(await ContextIdStore.getContextIds()).toEqual(outerContext);
		});
	});

	it("should handle empty context IDs object", async () => {
		const emptyContext: IContextIds = {};

		await ContextIdStore.run(emptyContext, async () => {
			const retrievedContextIds = await ContextIdStore.getContextIds();
			expect(retrievedContextIds).toEqual(emptyContext);
		});
	});

	it("should handle context IDs with undefined values", async () => {
		const contextWithUndefined: IContextIds = {
			organization: "org123",
			user: undefined
		};

		await ContextIdStore.run(contextWithUndefined, async () => {
			const retrievedContextIds = await ContextIdStore.getContextIds();
			expect(retrievedContextIds).toEqual(contextWithUndefined);
			expect(retrievedContextIds?.organization).toBe("org123");
			expect(retrievedContextIds?.user).toBeUndefined();
		});
	});

	it("should maintain context across async operations", async () => {
		const testContextIds: IContextIds = {
			organization: "org123",
			user: "user456"
		};

		await ContextIdStore.run(testContextIds, async () => {
			// Simulate async operation
			await new Promise(resolve => setTimeout(resolve, 10));

			expect(await ContextIdStore.getContextIds()).toEqual(testContextIds);

			// Another async operation
			await Promise.resolve();

			expect(await ContextIdStore.getContextIds()).toEqual(testContextIds);
		});
	});

	it("should handle exceptions within run method", async () => {
		const testContextIds: IContextIds = {
			organization: "org123"
		};

		await expect(
			ContextIdStore.run(testContextIds, async () => {
				expect(await ContextIdStore.getContextIds()).toEqual(testContextIds);
				throw new Error("Test error");
			})
		).rejects.toThrow("Test error");

		// Context should be cleared even after exception
		expect(await ContextIdStore.getContextIds()).toBeUndefined();
	});

	it("should isolate context between concurrent runs", async () => {
		const context1: IContextIds = { organization: "org1" };
		const context2: IContextIds = { organization: "org2" };

		const results: string[] = [];

		const promise1 = ContextIdStore.run(context1, async () => {
			await new Promise(resolve => setTimeout(resolve, 20));
			const ctx = await ContextIdStore.getContextIds();
			results.push(ctx?.organization ?? "undefined");
		});

		const promise2 = ContextIdStore.run(context2, async () => {
			await new Promise(resolve => setTimeout(resolve, 10));
			const ctx = await ContextIdStore.getContextIds();
			results.push(ctx?.organization ?? "undefined");
		});

		await Promise.all([promise1, promise2]);

		expect(results).toContain("org1");
		expect(results).toContain("org2");
		expect(results).toHaveLength(2);
	});

	it("should handle multiple keys in context IDs", async () => {
		const complexContext: IContextIds = {
			organization: "org123",
			user: "user456",
			tenant: "tenant789",
			session: "session-abc"
		};

		await ContextIdStore.run(complexContext, async () => {
			const retrievedContextIds = await ContextIdStore.getContextIds();
			expect(retrievedContextIds).toEqual(complexContext);
			expect(retrievedContextIds?.organization).toBe("org123");
			expect(retrievedContextIds?.user).toBe("user456");
			expect(retrievedContextIds?.tenant).toBe("tenant789");
			expect(retrievedContextIds?.session).toBe("session-abc");
		});
	});

	it("should preserve context inside setTimeout callback", async () => {
		const ids: IContextIds = { organization: "timer-org", user: "timer-user" };
		let capturedInside: IContextIds | undefined;
		let capturedAfter: IContextIds | undefined;

		await ContextIdStore.run(ids, async () => {
			await new Promise<void>(resolve => {
				setTimeout(async () => {
					capturedInside = await ContextIdStore.getContextIds();
					resolve();
				}, 25);
			});
			capturedAfter = await ContextIdStore.getContextIds();
		});

		expect(capturedInside).toEqual(ids);
		expect(capturedAfter).toEqual(ids);
		expect(await ContextIdStore.getContextIds()).toBeUndefined();
	});

	it("should preserve context inside setImmediate callback", async () => {
		const ids: IContextIds = { organization: "immediate-org" };
		let captured: IContextIds | undefined;
		await ContextIdStore.run(ids, async () => {
			await new Promise<void>(resolve => {
				setImmediate(async () => {
					captured = await ContextIdStore.getContextIds();
					resolve();
				});
			});
			// Still in run scope
			expect(await ContextIdStore.getContextIds()).toEqual(ids);
		});
		expect(captured).toEqual(ids);
		expect(await ContextIdStore.getContextIds()).toBeUndefined();
	});

	it("should preserve context inside process.nextTick", async () => {
		const ids: IContextIds = { organization: "nexttick-org", user: "nexttick-user" };
		let tickCaptured: IContextIds | undefined;
		await ContextIdStore.run(ids, async () => {
			await new Promise<void>(resolve => {
				process.nextTick(async () => {
					tickCaptured = await ContextIdStore.getContextIds();
					resolve();
				});
			});
			// After nextTick
			expect(await ContextIdStore.getContextIds()).toEqual(ids);
		});
		expect(tickCaptured).toEqual(ids);
		expect(await ContextIdStore.getContextIds()).toBeUndefined();
	});

	it("should maintain context through chained promises", async () => {
		const ids: IContextIds = { organization: "chain-org", user: "chain-user" };
		let midChain: IContextIds | undefined;
		let endChain: IContextIds | undefined;
		await ContextIdStore.run(ids, async () => {
			await Promise.resolve()
				.then(async () => {
					midChain = await ContextIdStore.getContextIds();
					return undefined;
				})
				.then(async () => {
					endChain = await ContextIdStore.getContextIds();
					return undefined;
				});
		});
		expect(midChain).toEqual(ids);
		expect(endChain).toEqual(ids);
		expect(await ContextIdStore.getContextIds()).toBeUndefined();
	});

	it("should clear context after error in setTimeout", async () => {
		const ids: IContextIds = { organization: "err-timeout-org" };
		let insideBeforeThrow: IContextIds | undefined;
		await expect(
			ContextIdStore.run(ids, async () => {
				await new Promise<void>((_resolve, reject) => {
					setTimeout(async () => {
						insideBeforeThrow = await ContextIdStore.getContextIds();
						reject(new Error("Timeout error"));
					}, 5);
				});
			})
		).rejects.toThrow("Timeout error");
		expect(insideBeforeThrow).toEqual(ids);
		expect(await ContextIdStore.getContextIds()).toBeUndefined();
	});

	it("should maintain context across mixed micro and macro tasks", async () => {
		const ids: IContextIds = { organization: "mixed-org", user: "mixed-user" };
		const observations: (IContextIds | undefined)[] = [];
		await ContextIdStore.run(ids, async () => {
			observations.push(await ContextIdStore.getContextIds()); // initial
			await Promise.resolve().then(async () => {
				observations.push(await ContextIdStore.getContextIds()); // after first microtask
				return undefined;
			});
			await new Promise<void>(resolve => {
				setTimeout(async () => {
					observations.push(await ContextIdStore.getContextIds()); // after macro
					process.nextTick(async () => {
						observations.push(await ContextIdStore.getContextIds()); // nested nextTick
						resolve();
					});
				}, 10);
			});
			observations.push(await ContextIdStore.getContextIds()); // before leaving run
		});
		for (const obs of observations) {
			expect(obs).toEqual(ids);
		}
		expect(observations).toHaveLength(5);
		expect(await ContextIdStore.getContextIds()).toBeUndefined();
	});

	it("should preserve context across multiple setInterval ticks", async () => {
		const ids: IContextIds = { organization: "interval-org", user: "interval-user" };
		const tickContexts: (IContextIds | undefined)[] = [];
		let tickCount = 0;
		await ContextIdStore.run(ids, async () => {
			await new Promise<void>(resolve => {
				const handle = setInterval(async () => {
					// Capture context each tick
					tickContexts.push(await ContextIdStore.getContextIds());
					if (++tickCount === 3) {
						clearInterval(handle);
						resolve();
					}
				}, 15);
			});
			// After interval loop but still in run scope
			expect(await ContextIdStore.getContextIds()).toEqual(ids);
		});
		// Validate each captured tick had the context
		expect(tickContexts).toHaveLength(3);
		for (const ctx of tickContexts) {
			expect(ctx).toEqual(ids);
		}
		expect(await ContextIdStore.getContextIds()).toBeUndefined();
	});

	it("should preserve context in bound class method invoked asynchronously", async () => {
		/**
		 * Worker used to test bound/unbound method calls retaining context.
		 */
		class Worker {
			public actions: string[];

			/**
			 * Create a new worker.
			 */
			constructor() {
				this.actions = [];
			}

			/**
			 * Perform a work step capturing current context.
			 * @param step The step identifier.
			 */
			public async doWork(step: string): Promise<void> {
				this.actions.push(step);
				// Capture context inside method
				const ctx = await ContextIdStore.getContextIds();
				capturedContexts.push(ctx);
			}
		}
		const capturedContexts: (IContextIds | undefined)[] = [];
		const ids: IContextIds = { organization: "bind-org", user: "bind-user" };
		const worker = new Worker();

		await ContextIdStore.run(ids, async () => {
			// Pass method without bind (should still work because no 'this' requirement for context retrieval)
			await Promise.resolve().then(async () => worker.doWork("unbound-call"));
			// Pass method with explicit bind to ensure stable 'this'
			const bound = worker.doWork.bind(worker);
			await new Promise<void>(resolve =>
				setTimeout(async () => {
					await bound("bound-call");
					resolve();
				}, 5)
			);
		});

		expect(capturedContexts).toHaveLength(2);
		for (const ctx of capturedContexts) {
			expect(ctx).toEqual(ids);
		}
		// Validate worker actions
		expect(worker.actions).toEqual(["unbound-call", "bound-call"]);
		expect(await ContextIdStore.getContextIds()).toBeUndefined();
	});

	it("should load a module and maintain context", async () => {
		const { hasNodeContext } = await import(path.join(__dirname, "module.js"));

		await ContextIdStore.run({ node: "node-123" }, async () => {
			const retrievedContextIds = await ContextIdStore.getContextIds();
			expect(retrievedContextIds).toEqual({ node: "node-123" });

			const result = await hasNodeContext();
			expect(result).toBe("node-123");
		});
	});

	it("should load a module and maintain context with an unbound class method", async () => {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const { ContextIdChecker } = await import(path.join(__dirname, "module.js"));

		await ContextIdStore.run({ node: "node-123" }, async () => {
			const retrievedContextIds = await ContextIdStore.getContextIds();
			expect(retrievedContextIds).toEqual({ node: "node-123" });

			const classInstance = new ContextIdChecker();
			const result = await classInstance.hasNodeContext();
			expect(result).toBe("node-123");
		});
	});

	it("should load a module and maintain context with a bound class method", async () => {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		const { ContextIdChecker } = await import(path.join(__dirname, "module.js"));

		await ContextIdStore.run({ node: "node-123" }, async () => {
			const retrievedContextIds = await ContextIdStore.getContextIds();
			expect(retrievedContextIds).toEqual({ node: "node-123" });

			const classInstance = new ContextIdChecker();
			const hasNodeContextMethod = classInstance.hasNodeContext.bind(classInstance);
			const result = await hasNodeContextMethod();
			expect(result).toBe("node-123");
		});
	});
});
