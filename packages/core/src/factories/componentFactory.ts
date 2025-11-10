// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Factory } from "./factory.js";
import type { IComponent } from "../models/IComponent.js";

/**
 * Factory for creating implementation of component types.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ComponentFactory = Factory.createFactory<IComponent>("component");
