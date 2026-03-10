#!/usr/bin/env bun

import { createCLI, defineGroup } from '@bunli/core';
import { balanceGroup } from './commands/balance';
import { codesGroup } from './commands/codes';
import { completionCommand } from './commands/completion';
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
import { accountMiningHashrateCommand } from './commands/market/mining-hashrate';
import { miningPoolCommand } from './commands/market/mining-pool';
import { serverTimeCommand } from './commands/market/server-time';
import { statusCommand } from './commands/market/status';
import { marketTickersCommand } from './commands/market/tickers';
import { tradesCommand } from './commands/market/trades';
import { subAccountGroup } from './commands/sub-account';
import { tradeGroup } from './commands/trade';
import { transferGroup } from './commands/transfer';
import { withdrawGroup } from './commands/withdraw';
import { accountWsTokenCommand } from './commands/ws-token';
import { type LoadConfigOptions, setGlobalConfigOverrides } from './lib/config';
import { CLI_VERSION } from './lib/version';

const readLongFlagValue = (
  argv: string[],
  index: number,
  flagName: string,
): { value: string; nextIndex: number } => {
  const token = argv[index] ?? '';
  const inlinePrefix = `${flagName}=`;
  if (token.startsWith(inlinePrefix)) {
    const value = token.slice(inlinePrefix.length);
    if (value.length === 0) {
      throw new Error(`Flag ${flagName} requires a value`);
    }

    return {
      value,
      nextIndex: index,
    };
  }

  const nextValue = argv[index + 1];
  if (!nextValue || nextValue.startsWith('-')) {
    throw new Error(`Flag ${flagName} requires a value`);
  }

  return {
    value: nextValue,
    nextIndex: index + 1,
  };
};

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

const parseGlobalOptions = (
  argv: string[],
): {
  cleanedArgv: string[];
  overrides: Partial<LoadConfigOptions>;
} => {
  const cleanedArgv: string[] = [];
  const overrides: Partial<LoadConfigOptions> = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index] ?? '';

    if (token === '--') {
      cleanedArgv.push(...argv.slice(index));
      break;
    }

    if (token === '--json') {
      overrides.json = true;
      continue;
    }

    if (token === '--verbose' || token === '-v') {
      overrides.verbose = true;
      continue;
    }

    if (token === '--no-retry') {
      overrides.retry = false;
      continue;
    }

    if (token === '--dry-run') {
      overrides.dryRun = true;
      continue;
    }

    if (token === '--format' || token.startsWith('--format=')) {
      const { value, nextIndex } = readLongFlagValue(argv, index, '--format');
      if (value !== 'json' && value !== 'table') {
        throw new Error(`Invalid --format value: ${value}. Expected 'json' or 'table'.`);
      }

      overrides.format = value;
      index = nextIndex;
      continue;
    }

    if (token === '--profile' || token.startsWith('--profile=')) {
      const { value, nextIndex } = readLongFlagValue(argv, index, '--profile');
      overrides.profile = value;
      index = nextIndex;
      continue;
    }

    if (token === '--api-key' || token.startsWith('--api-key=')) {
      const { value, nextIndex } = readLongFlagValue(argv, index, '--api-key');
      overrides.apiKey = value;
      index = nextIndex;
      continue;
    }

    if (token === '--api-secret' || token.startsWith('--api-secret=')) {
      const { value, nextIndex } = readLongFlagValue(argv, index, '--api-secret');
      overrides.apiSecret = value;
      index = nextIndex;
      continue;
    }

    if (token === '--api-url' || token.startsWith('--api-url=')) {
      const { value, nextIndex } = readLongFlagValue(argv, index, '--api-url');
      overrides.apiUrl = value;
      index = nextIndex;
      continue;
    }

    cleanedArgv.push(token);
  }

  if (overrides.json) {
    overrides.format = 'json';
  }

  return {
    cleanedArgv,
    overrides,
  };
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
    miningPoolCommand,
    accountMiningHashrateCommand,
  ],
});

const configGroup = defineGroup({
  name: 'config',
  description: 'Configuration commands',
  commands: [configSetCommand, configShowCommand],
});

const parsedArgs = (() => {
  try {
    return parseGlobalOptions(Bun.argv.slice(2));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exit(4);
  }
})();

setGlobalConfigOverrides(parsedArgs.overrides);

const cli = await createCLI({
  name: 'whitebit',
  version: CLI_VERSION,
  description: 'WhiteBIT CLI proof-of-concept',
});

cli.command(marketGroup);
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
cli.command(completionCommand);
cli.command(loginCommand);
cli.command(helpCommand);

try {
  await cli.run(parsedArgs.cleanedArgv);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(inferExitCode(error));
}
