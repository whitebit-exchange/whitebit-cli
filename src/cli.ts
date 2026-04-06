#!/usr/bin/env bun

import { createCLI, defineGroup } from '@bunli/core';
import { completionsPlugin } from '@bunli/plugin-completions';
import { balanceGroup } from './commands/balance';
import { codesGroup } from './commands/codes';
import { configSetCommand } from './commands/config/set';
import { configShowCommand } from './commands/config/show';
import { accountCreditLinesCommand } from './commands/credit-lines';
import { depositGroup } from './commands/deposit';
import { earnGroup } from './commands/earn';
import { helpCommand } from './commands/help';
import { loginCommand } from './commands/login';
import { activityCommand } from './commands/market/activity';
import { assetStatusCommand } from './commands/market/asset-status';
import { collateralMarketsCommand } from './commands/market/collateral-markets';
import { depthCommand } from './commands/market/depth';
import { feeCommand } from './commands/market/fee';
import { fundingHistoryCommand } from './commands/market/funding-history';
import { futuresMarketsCommand } from './commands/market/futures-markets';
import { klineCommand } from './commands/market/kline';
import { listCommand } from './commands/market/list';
import { marketStatusCommand } from './commands/market/market-status';
import { serverTimeCommand } from './commands/market/server-time';
import { statusCommand } from './commands/market/status';
import { marketTickersCommand } from './commands/market/tickers';
import { tradesCommand } from './commands/market/trades';
import { miningPoolGroup } from './commands/mining-pool';
import { subAccountGroup } from './commands/sub-account';
import { tradeGroup } from './commands/trade';
import { transferGroup } from './commands/transfer';
import { withdrawGroup } from './commands/withdraw';
import { accountWsTokenCommand } from './commands/ws-token';
import { getGlobalConfigOverrides, setGlobalConfigOverrides } from './lib/config';
import {
  ApiAuthError,
  CredentialsMissingError,
  getPendingExitCode,
  NetworkError,
  RateLimitError,
} from './lib/errors';
import { formatError } from './lib/formatter';
import { parseGlobalConfigOverrides } from './lib/global-config-overrides';
import { CLI_VERSION } from './lib/version';

const inferExitCode = (error: unknown): number => {
  // Typed errors: reliable, not dependent on message wording
  if (error instanceof CredentialsMissingError) return 2;
  if (error instanceof ApiAuthError) return 2;
  if (error instanceof RateLimitError) return 5;
  if (error instanceof NetworkError) return 3;

  // Framework-level usage errors from @bunli/core (not under our control)
  const message = error instanceof Error ? error.message : String(error ?? '');
  const normalized = message.toLowerCase();

  if (
    normalized.includes('missing required argument') ||
    normalized.includes('invalid --format') ||
    normalized.includes('requires a value') ||
    normalized.includes('usage:')
  ) {
    return 4;
  }

  return 1;
};

const marketGroup = defineGroup({
  name: 'market',
  description: 'Market data and platform status',
  commands: [
    listCommand,
    marketStatusCommand,
    assetStatusCommand,
    futuresMarketsCommand,
    collateralMarketsCommand,
    marketTickersCommand,
    depthCommand,
    tradesCommand,
    klineCommand,
    feeCommand,
    fundingHistoryCommand,
    activityCommand,
    serverTimeCommand,
    statusCommand,
  ],
});

const configGroup = defineGroup({
  name: 'config',
  description: 'Configuration commands',
  commands: [configSetCommand, configShowCommand],
});

const cli = await createCLI({
  name: 'whitebit',
  version: CLI_VERSION,
  description: 'WhiteBIT CLI proof-of-concept',
  generated: true,
  plugins: [completionsPlugin({})] as const,
});

setGlobalConfigOverrides(parseGlobalConfigOverrides(Bun.argv.slice(2)));

// @bunli/core catches handler errors and always calls process.exit(1), losing
// instanceof identity. Intercept it to use the typed error's intended exit code.
const _originalExit = process.exit.bind(process);
process.exit = ((code?: number): never => {
  const pending = getPendingExitCode();
  return _originalExit(code === 1 && pending !== undefined ? pending : code);
}) as typeof process.exit;

cli.command(marketGroup);
cli.command(miningPoolGroup);
cli.command(balanceGroup);
cli.command(depositGroup);
cli.command(withdrawGroup);
cli.command(transferGroup);
cli.command(codesGroup);
cli.command(earnGroup);
cli.command(accountCreditLinesCommand);
cli.command(accountWsTokenCommand);
cli.command(configGroup);
cli.command(tradeGroup);
cli.command(subAccountGroup);
cli.command(loginCommand);
cli.command(helpCommand);

try {
  await cli.run(Bun.argv.slice(2));
} catch (error) {
  const overrides = getGlobalConfigOverrides();
  const format = overrides.json || overrides.raw ? 'json' : (overrides.format ?? 'table');
  formatError(error, { format });
  process.exit(inferExitCode(error));
}
