import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { AccountApi } from '../../lib/api/account';
import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const accountWithdrawCryptoAmountCommand = defineCommand({
  name: 'crypto-amount',
  description: 'Withdraw crypto: recipient gets exact amount, fee added on top',
  options: {
    network: option(z.string().min(1).optional(), {
      short: 'n',
      description: 'Network identifier (e.g., ERC20)',
    }),
  },
  handler: async ({ positional, flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new AccountApi(client);

    const ticker = parseArg(
      positional[0],
      z.string().min(1),
      'TICKER',
      'whitebit withdraw crypto-amount <ticker> <address> <amount>',
    );
    const address = parseArg(
      positional[1],
      z.string().min(1),
      'ADDRESS',
      'whitebit withdraw crypto-amount <ticker> <address> <amount>',
    );
    const amount = parseArg(
      positional[2],
      z.string().min(1),
      'AMOUNT',
      'whitebit withdraw crypto-amount <ticker> <address> <amount>',
    );

    const response = await api.withdrawCryptoWithAmount({
      ticker,
      amount,
      address,
      network: flags.network,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
