import { createCLI, defineGroup } from '@bunli/core';

import { accountApplyCodeCommand } from './commands/account/apply-code';
import { accountBalanceCommand } from './commands/account/balance';
import { accountCloseInvestmentCommand } from './commands/account/close-investment';
import { accountCodesHistoryCommand } from './commands/account/codes-history';
import { accountCreateAddressCommand } from './commands/account/create-address';
import { accountCreateCodeCommand } from './commands/account/create-code';
import { accountCreditLinesCommand } from './commands/account/credit-lines';
import { accountDepositAddressCommand } from './commands/account/deposit-address';
import { accountDepositRefundCommand } from './commands/account/deposit-refund';
import { accountFeeCommand } from './commands/account/fee';
import { accountFiatDepositAddressCommand } from './commands/account/fiat-deposit-address';
import { accountFlexAutoReinvestCommand } from './commands/account/flex-auto-reinvest';
import { accountFlexCloseCommand } from './commands/account/flex-close';
import { accountFlexInvestCommand } from './commands/account/flex-invest';
import { accountFlexInvestmentHistoryCommand } from './commands/account/flex-investment-history';
import { accountFlexInvestmentsCommand } from './commands/account/flex-investments';
import { accountFlexPaymentHistoryCommand } from './commands/account/flex-payment-history';
import { accountFlexPlansCommand } from './commands/account/flex-plans';
import { accountFlexWithdrawCommand } from './commands/account/flex-withdraw';
import { accountInterestHistoryCommand } from './commands/account/interest-history';
import { accountInvestCommand } from './commands/account/invest';
import { accountInvestmentsHistoryCommand } from './commands/account/investments-history';
import { accountIssueJwtTokenCommand } from './commands/account/issue-jwt-token';
import { accountMainBalanceCommand } from './commands/account/main-balance';
import { accountMiningHashrateCommand } from './commands/account/mining-hashrate';
import { accountMyCodesCommand } from './commands/account/my-codes';
import { accountOverviewCommand } from './commands/account/overview';
import { accountPlansCommand } from './commands/account/plans';
import { accountRewardsCommand } from './commands/account/rewards';
import { accountTransferCommand } from './commands/account/transfer';
import { accountTransferHistoryCommand } from './commands/account/transfer-history';
import { accountWithdrawCryptoCommand } from './commands/account/withdraw-crypto';
import { accountWithdrawCryptoAmountCommand } from './commands/account/withdraw-crypto-amount';
import { accountWithdrawFiatCommand } from './commands/account/withdraw-fiat';
import { accountWithdrawHistoryCommand } from './commands/account/withdraw-history';
import { accountWsTokenCommand } from './commands/account/ws-token';
import { configSetCommand } from './commands/config/set';
import { configShowCommand } from './commands/config/show';
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
import { miningPoolCommand } from './commands/market/mining-pool';
import { serverTimeCommand } from './commands/market/server-time';
import { statusCommand } from './commands/market/status';
import { marketTickersCommand } from './commands/market/tickers';
import { tradesCommand } from './commands/market/trades';
import { subAccountGroup } from './commands/sub-account';
import { tradeGroup } from './commands/trade';
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
  description: 'Public market data commands',
  commands: [
    serverTimeCommand,
    statusCommand,
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
    miningPoolCommand,
    activityCommand,
  ],
});

const accountGroup = defineGroup({
  name: 'account',
  description: 'Authenticated account commands',
  commands: [
    accountMainBalanceCommand,
    accountOverviewCommand,
    accountBalanceCommand,
    accountFeeCommand,
    accountDepositAddressCommand,
    accountFiatDepositAddressCommand,
    accountCreateAddressCommand,
    accountWithdrawCryptoCommand,
    accountWithdrawCryptoAmountCommand,
    accountWithdrawFiatCommand,
    accountDepositRefundCommand,
    accountWithdrawHistoryCommand,
    accountTransferHistoryCommand,
    accountTransferCommand,
    accountCreateCodeCommand,
    accountApplyCodeCommand,
    accountCodesHistoryCommand,
    accountMyCodesCommand,
    accountPlansCommand,
    accountInvestCommand,
    accountInvestmentsHistoryCommand,
    accountCloseInvestmentCommand,
    accountFlexPlansCommand,
    accountFlexInvestCommand,
    accountFlexInvestmentsCommand,
    accountFlexInvestmentHistoryCommand,
    accountFlexPaymentHistoryCommand,
    accountFlexWithdrawCommand,
    accountFlexCloseCommand,
    accountFlexAutoReinvestCommand,
    accountRewardsCommand,
    accountMiningHashrateCommand,
    accountInterestHistoryCommand,
    accountCreditLinesCommand,
    accountIssueJwtTokenCommand,
    accountWsTokenCommand,
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
    process.exit(1);
  }
})();

setGlobalConfigOverrides(parsedArgs.overrides);

const cli = await createCLI({
  name: 'whitebit',
  version: CLI_VERSION,
  description: 'WhiteBIT CLI proof-of-concept',
});

cli.command(marketGroup);
cli.command(accountGroup);
cli.command(configGroup);
cli.command(tradeGroup);
cli.command(subAccountGroup);

await cli.run(parsedArgs.cleanedArgv);
