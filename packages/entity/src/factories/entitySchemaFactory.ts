// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Factory } from "@3sixty/core";
import type { IEntitySchema } from "../models/IEntitySchema.js";

/**
 * Factory for creating entity schemas.
 */
export const EntitySchemaFactory = Factory.createFactory<IEntitySchema>("entity-schema");
