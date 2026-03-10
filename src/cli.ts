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
import { CLI_VERSION } from './lib/version';

const inferExitCode = (error: unknown): number => {
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

  if (
    normalized.includes('api credentials are required') ||
    normalized.includes('api key') ||
    normalized.includes('api secret') ||
    normalized.includes('authentication') ||
    normalized.includes('unauthorized')
  ) {
    return 2;
  }

  if (
    normalized.includes('rate limit') ||
    normalized.includes('429') ||
    normalized.includes('too many requests')
  ) {
    return 5;
  }

  if (
    normalized.includes('network') ||
    normalized.includes('enotfound') ||
    normalized.includes('econnrefused') ||
    normalized.includes('timed out')
  ) {
    return 3;
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
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(inferExitCode(error));
}
