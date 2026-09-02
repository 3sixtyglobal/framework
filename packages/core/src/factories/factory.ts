// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { nameof } from "@twin.org/nameof";
import { GeneralError } from "../errors/generalError.js";
import type { IFacade } from "../models/IFacade.js";
import { Guards } from "../utils/guards.js";
import { Is } from "../utils/is.js";
import { SharedStore } from "../utils/sharedStore.js";

/**
 * Factory for creating implementation of generic types.
 */
export class Factory<T> {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<Factory<unknown>>();

	/**
	 * Type name for the instances.
	 * @internal
	 */
	private readonly _typeName: string;

	/**
	 * Store the generators.
	 * @internal
	 */
	private _generators: {
		[name: string]: {
			generator: (args?: unknown) => T;
			order: number;
		};
	};

	/**
	 * Store the created instances.
	 * @internal
	 */
	private _instances: { [name: string]: T };

	/**
	 * The factory the facades are resolved from, held once resolved. It cannot be resolved in the
	 * constructor, because createFactory only stores a factory after constructing it, so the facade
	 * factory would recurse while constructing itself.
	 * @internal
	 */
	private _facadeFactory?: Factory<IFacade>;

	/**
	 * The facades applied to the instances, in the order they were activated. The facade is
	 * resolved when it is activated rather than when an instance is produced, so unregistering or
	 * replacing it afterwards cannot affect a factory which has already activated it.
	 * @internal
	 */
	private _facades: { name: string; facade: IFacade }[];

	/**
	 * Store the instances with the facades applied, keyed as the instances are.
	 * The unwrapped instances stay in _instances, so activating or deactivating a facade only has
	 * to discard this cache rather than rebuild the components themselves.
	 * @internal
	 */
	private _wrappedInstances: { [name: string]: T };

	/**
	 * Counter for the ordering.
	 * @internal
	 */
	private _orderCounter: number;

	/**
	 * Automatically created an instance when registered.
	 * @internal
	 */
	private readonly _autoInstance: boolean;

	/**
	 * Match the name of the instance.
	 * @internal
	 */
	private readonly _matcher: (names: string[], name: string) => string | undefined;

	/**
	 * Create a new instance of Factory, private use createFactory.
	 * @param typeName The type name for the instances.
	 * @param autoInstance Automatically create an instance when registered.
	 * @param matcher Match the name of the instance.
	 * @internal
	 */
	private constructor(
		typeName: string,
		autoInstance: boolean = false,
		matcher?: (names: string[], name: string) => string | undefined
	) {
		this._typeName = typeName;
		this._generators = {};
		this._instances = {};
		this._facades = [];
		this._wrappedInstances = {};
		this._orderCounter = 0;
		this._autoInstance = autoInstance;
		this._matcher = matcher ?? this.defaultMatcher.bind(this);
	}

	/**
	 * Create a new factory, which is shared throughout all library instances.
	 * @param typeName The type name for the instances.
	 * @param autoInstance Automatically create an instance when registered.
	 * @param matcher Match the name of the instance.
	 * @returns The factory instance.
	 */
	public static createFactory<U>(
		typeName: string,
		autoInstance: boolean = false,
		matcher?: (names: string[], name: string) => string | undefined
	): Factory<U> {
		const factories = Factory.getFactories();

		if (Is.undefined(factories[typeName])) {
			factories[typeName] = new Factory<U>(typeName, autoInstance, matcher);
		}
		return factories[typeName] as Factory<U>;
	}

	/**
	 * Get all the factories.
	 * @returns All the factories.
	 */
	public static getFactories(): { [typeName: string]: Factory<unknown> } {
		return SharedStore.get<{
			[typeName: string]: Factory<unknown>;
		}>("factories", () => ({}));
	}

	/**
	 * Get a specific factory by type name.
	 * @param typeName The type name of the factory.
	 * @returns The factory instance if it exists, otherwise undefined.
	 */
	public static getFactory<T = unknown>(typeName: string): Factory<T> | undefined {
		const factories = Factory.getFactories();

		return factories[typeName] as Factory<T> | undefined;
	}

	/**
	 * Reset all the factories, which removes any created instances, but not the registrations.
	 */
	public static resetFactories(): void {
		const factories = Factory.getFactories();

		for (const typeName in factories) {
			factories[typeName].reset();
		}
	}

	/**
	 * Clear all the factories, which removes anything registered with the factories.
	 */
	public static clearFactories(): void {
		const factories = Factory.getFactories();

		for (const typeName in factories) {
			factories[typeName].clear();
		}
	}

	/**
	 * Get the type name of the factory.
	 * @returns The type name of the factory.
	 */
	public typeName(): string {
		return this._typeName;
	}

	/**
	 * Register a new generator.
	 * @param name The name of the generator.
	 * @param generator The function to create an instance.
	 */
	public register<U extends T>(name: string, generator: (args?: unknown) => U): void {
		Guards.stringValue(Factory.CLASS_NAME, nameof(name), name);
		Guards.function(Factory.CLASS_NAME, nameof(generator), generator);
		this._generators[name] = {
			generator,
			order: this._orderCounter++
		};

		// Remove any existing instance
		this.removeInstance(name);
		if (this._autoInstance) {
			this._instances[name] = generator();
		}
	}

	/**
	 * Unregister a generator.
	 * @param name The name of the generator to unregister.
	 * @throws GuardError if the parameters are invalid.
	 * @throws GeneralError if no generator exists.
	 */
	public unregister(name: string): void {
		Guards.stringValue(Factory.CLASS_NAME, nameof(name), name);
		if (!this._generators[name]) {
			throw new GeneralError(Factory.CLASS_NAME, "noUnregister", {
				typeName: this._typeName,
				name
			});
		}
		delete this._generators[name];
		// Remove any existing instance
		this.removeInstance(name);
	}

	/**
	 * Get a generator instance.
	 * @param name The name of the instance to generate.
	 * @returns An instance of the item.
	 * @throws GuardError if the parameters are invalid.
	 * @throws GeneralError if no item exists to get.
	 */
	public get<U extends T>(name: string): U {
		Guards.stringValue(Factory.CLASS_NAME, nameof(name), name);
		const instance = this.getIfExists(name);
		if (!instance) {
			throw new GeneralError(Factory.CLASS_NAME, "noGet", {
				typeName: this._typeName,
				name
			});
		}
		return instance as U;
	}

	/**
	 * Get a generator instance with no exceptions.
	 * @param name The name of the instance to generate.
	 * @returns An instance of the item or undefined if it does not exist.
	 */
	public getIfExists<U extends T>(name?: string): U | undefined {
		if (Is.empty(name)) {
			return;
		}
		Guards.stringValue(Factory.CLASS_NAME, nameof(name), name);

		const matchName = this._matcher(Object.keys(this._generators), name);

		if (Is.stringValue(matchName) && this._generators[matchName]) {
			if (!this._instances[matchName]) {
				this._instances[matchName] = this._generators[matchName].generator();
			}
			if (this._instances[matchName]) {
				return this.wrappedInstance(matchName) as U;
			}
		}
	}

	/**
	 * Create a new instance without caching it.
	 * @param name The name of the instance to generate.
	 * @param args The arguments to pass to the generator.
	 * @returns A new instance of the item.
	 * @throws GuardError if the parameters are invalid.
	 * @throws GeneralError if no item exists to create.
	 */
	public create<U extends T>(name: string, args?: unknown): U {
		Guards.stringValue(Factory.CLASS_NAME, nameof(name), name);
		const instance = this.createIfExists(name, args);
		if (!instance) {
			throw new GeneralError(Factory.CLASS_NAME, "noCreate", {
				typeName: this._typeName,
				name,
				args: Is.undefined(args) ? "" : JSON.stringify(args)
			});
		}
		return instance as U;
	}

	/**
	 * Create a new instance without caching it if it exists.
	 * @param name The name of the instance to generate.
	 * @param args The arguments to pass to the generator.
	 * @returns A new instance of the item if it exists.
	 * @throws GuardError if the parameters are invalid.
	 */
	public createIfExists<U extends T>(name: string, args?: unknown): U | undefined {
		Guards.stringValue(Factory.CLASS_NAME, nameof(name), name);
		const matchName = this._matcher(Object.keys(this._generators), name);

		if (Is.stringValue(matchName) && this._generators[matchName]) {
			const instance = this._generators[matchName].generator(args);

			if (!Is.empty(instance)) {
				return this.applyFacades(instance) as U;
			}
		}
	}

	/**
	 * Remove all the instances and leave the generators intact.
	 */
	public reset(): void {
		for (const name in this._generators) {
			this.removeInstance(name);
		}
		this._instances = {};
		this._wrappedInstances = {};
	}

	/**
	 * Remove all the instances and the generators.
	 */
	public clear(): void {
		this._instances = {};
		this._wrappedInstances = {};
		this._facades = [];
		this._generators = {};
		this._orderCounter = 0;
	}

	/**
	 * Activate a facade for this factory, so every instance it produces is wrapped by it.
	 * An instance is passed through the facades in the order they were activated, so the facade
	 * activated first is the outermost. Activating a facade which is already active does nothing.
	 * @param name The name of the facade, as registered with the facade factory.
	 * @throws GuardError if the parameters are invalid.
	 * @throws GeneralError if no facade is registered with the name, or the factory is the facade
	 * factory itself.
	 */
	public useFacade(name: string): void {
		Guards.stringValue(Factory.CLASS_NAME, nameof(name), name);

		const facadeFactory = this.facadeFactory();

		// Wrapping the facades themselves would mean resolving a facade in order to apply it.
		if (this._typeName === facadeFactory.typeName()) {
			throw new GeneralError(Factory.CLASS_NAME, "noFacadeOnFacades");
		}

		if (!facadeFactory.hasName(name)) {
			throw new GeneralError(Factory.CLASS_NAME, "noFacade", {
				typeName: this._typeName,
				name
			});
		}

		if (!this._facades.some(f => f.name === name)) {
			this._facades.push({ name, facade: facadeFactory.get(name) });
			// Instances handed out before this point keep the facades they were built with, the
			// change applies to instances produced from here on.
			this._wrappedInstances = {};
		}
	}

	/**
	 * Deactivate a facade for this factory. Deactivating a facade which is not active does nothing.
	 * @param name The name of the facade to deactivate.
	 * @throws GuardError if the parameters are invalid.
	 */
	public unuseFacade(name: string): void {
		Guards.stringValue(Factory.CLASS_NAME, nameof(name), name);

		const index = this._facades.findIndex(f => f.name === name);
		if (index >= 0) {
			this._facades.splice(index, 1);
			this._wrappedInstances = {};
		}
	}

	/**
	 * Get all the instances as a map.
	 * @param withFacade Return the instances with the active facades applied, defaults to false.
	 * @returns The instances as a map.
	 */
	public instancesMap(withFacade?: boolean): { [name: string]: T } {
		if (!withFacade) {
			return this._instances;
		}

		const instances: { [name: string]: T } = {};
		for (const instanceName in this._instances) {
			instances[instanceName] = this.wrappedInstance(instanceName);
		}
		return instances;
	}

	/**
	 * Get all the instances as a list in the order they were registered.
	 * @param withFacade Return the instances with the active facades applied, defaults to false.
	 * @returns The instances as a list in the order they were registered.
	 */
	public instancesList(withFacade?: boolean): T[] {
		const orderedInstances: { instance: T; order: number }[] = [];
		for (const instanceName in this._instances) {
			orderedInstances.push({
				instance: withFacade ? this.wrappedInstance(instanceName) : this._instances[instanceName],
				order: this._generators[instanceName].order
			});
		}
		return orderedInstances.sort((a, b) => a.order - b.order).map(o => o.instance);
	}

	/**
	 * Get all the generator names in the order they were registered.
	 * @returns The ordered generator names.
	 */
	public names(): string[] {
		const orderedNames: { name: string; order: number }[] = [];
		for (const generator in this._generators) {
			orderedNames.push({
				name: generator,
				order: this._generators[generator].order
			});
		}
		return orderedNames.sort((a, b) => a.order - b.order).map(o => o.name);
	}

	/**
	 * Does the factory contain the name.
	 * @param name The name of the instance to find.
	 * @returns True if the factory has a matching name.
	 */
	public hasName(name: string): boolean {
		Guards.stringValue(Factory.CLASS_NAME, nameof(name), name);
		return Is.stringValue(this._matcher(Object.keys(this._generators), name));
	}

	/**
	 * Remove any instances of the given name.
	 * @param name The name of the instances to remove.
	 * @internal
	 */
	private removeInstance(name: string): void {
		delete this._instances[name];
		delete this._wrappedInstances[name];
	}

	/**
	 * Get the factory the facades are resolved from, resolving it on first use.
	 * @returns The facade factory.
	 * @internal
	 */
	private facadeFactory(): Factory<IFacade> {
		this._facadeFactory ??= Factory.createFactory<IFacade>("facade");

		return this._facadeFactory;
	}

	/**
	 * Get an instance with the active facades applied, wrapping it on first use.
	 * @param name The name of the instance, which must already have been created.
	 * @returns The wrapped instance.
	 * @throws GeneralError if a facade does not return a wrapped instance.
	 * @internal
	 */
	private wrappedInstance(name: string): T {
		this._wrappedInstances[name] ??= this.applyFacades(this._instances[name]);

		return this._wrappedInstances[name];
	}

	/**
	 * Wrap an instance in the active facades. The first activated facade ends up outermost.
	 * @param instance The instance to wrap.
	 * @returns The wrapped instance, or the instance itself when no facades are active.
	 * @throws GeneralError if a facade does not return a wrapped instance.
	 * @internal
	 */
	private applyFacades(instance: T): T {
		let wrapped = instance;

		for (let i = this._facades.length - 1; i >= 0; i--) {
			wrapped = this._facades[i].facade.wrap(wrapped) as T;

			if (Is.empty(wrapped)) {
				throw new GeneralError(Factory.CLASS_NAME, "noFacadeWrap", {
					typeName: this._typeName,
					name: this._facades[i].name
				});
			}
		}

		return wrapped;
	}

	/**
	 * Match the requested name to the generator name.
	 * @param names The list of names for all the generators.
	 * @param name The name to match.
	 * @returns The matched name or undefined if no match.
	 * @internal
	 */
	private defaultMatcher(names: string[], name: string): string | undefined {
		return this._generators[name] ? name : undefined;
	}
}
