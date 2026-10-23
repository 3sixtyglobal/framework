#!/usr/bin/env node
// Copyright 2026 3Sixty Trade Ltd.
// SPDX-License-Identifier: Apache-2.0.
import { tsTransform } from '../dist/es/index.js';

const output = tsTransform(process.argv.slice(2), process.cwd());
if (output.length > 0) {
	process.stderr.write(output);
	process.exit(1);
}
