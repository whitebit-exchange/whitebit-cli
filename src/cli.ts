#!/usr/bin/env bun
import { createCLI } from '@bunli/core';

import { accountGroup } from './commands/account';
import { collateralGroup } from './commands/collateral';
import { configGroup } from './commands/config';
import { convertGroup } from './commands/convert';
import { marketGroup } from './commands/market';
import { serverGroup } from './commands/server';
import { spotGroup } from './commands/spot';
import { subAccountGroup } from './commands/sub-account';
import { getGlobalConfigOverrides, setGlobalConfigOverrides } from './lib/config';
import { formatError } from './lib/formatter';

const inferExitCode = (error: unknown): number => {
  const msg = error instanceof Error ? error.message : String(error ?? '');
  const name = error instanceof Error ? error.name : '';
  if (name === 'CredentialsMissingError') return 2;
  if (msg.toLowerCase().includes('missing required') || msg.toLowerCase().includes('usage:'))
    return 4;
  return 1;
};

const cli = await createCLI({
  name: 'whitebit2',
  version: '1.0.0',
  description: 'WhiteBIT CLI v2 — built on whitebit-typescript-sdk',
});

// Parse global format/json/raw overrides from argv before running
const rawArgv = Bun.argv.slice(2);
const overrides: Record<string, unknown> = {};
for (let i = 0; i < rawArgv.length; i++) {
  if (rawArgv[i] === '--json') overrides.json = true;
  if (rawArgv[i] === '--raw') overrides.raw = true;
  if (rawArgv[i] === '--format' && rawArgv[i + 1]) overrides.format = rawArgv[++i];
}
setGlobalConfigOverrides(overrides);

cli.command(serverGroup);
cli.command(marketGroup);
cli.command(spotGroup);
cli.command(collateralGroup);
cli.command(accountGroup);
cli.command(convertGroup);
cli.command(subAccountGroup);
cli.command(configGroup);

try {
  await cli.run(rawArgv);
} catch (error) {
  const overrides = getGlobalConfigOverrides();
  const format =
    overrides.json || overrides.raw
      ? 'json'
      : (overrides.format as string) === 'json'
        ? 'json'
        : 'table';
  formatError(error, format as 'json' | 'table');
  process.exit(inferExitCode(error));
}
