// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Factory } from "./factory.js";
import type { IFacade } from "../models/IFacade.js";

/**
 * Factory for creating implementation of facade types.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const FacadeFactory = Factory.createFactory<IFacade>("facade");
