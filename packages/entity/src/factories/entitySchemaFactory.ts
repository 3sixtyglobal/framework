// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Factory } from "@3sixty/core";
import type { IEntitySchema } from "../models/IEntitySchema.js";

/**
 * Factory for creating entity schemas.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const EntitySchemaFactory = Factory.createFactory<IEntitySchema>("entity-schema");
