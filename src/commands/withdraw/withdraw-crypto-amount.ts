import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { AccountApi } from '../../lib/api/account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const accountWithdrawCryptoAmountCommand = defineCommand({
  name: 'withdraw-crypto-amount',
  description: 'Withdraw cryptocurrency with exact amount',
  options: {
    ticker: option(z.string().min(1), {
      short: 't',
      description: 'Cryptocurrency ticker (e.g., BTC)',
    }),
    amount: option(z.string().min(1), {
      short: 'a',
      description: 'Amount to withdraw',
    }),
    address: option(z.string().min(1), {
      description: 'Destination address',
    }),
    network: option(z.string().min(1).optional(), {
      short: 'n',
      description: 'Network identifier (e.g., ERC20)',
    }),
  },
  handler: async ({ flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new AccountApi(client);

    const response = await api.withdrawCryptoWithAmount({
      ticker: flags.ticker,
      amount: flags.amount,
      address: flags.address,
      network: flags.network,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
