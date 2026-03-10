import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { AccountApi } from '../../lib/api/account';
import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const accountWithdrawCryptoCommand = defineCommand({
  name: 'crypto',
  description: 'Withdraw crypto: you specify amount, network fee deducted from amount',
  options: {
    network: option(z.string().min(1).optional(), {
      short: 'n',
      description: 'Network identifier (e.g., ERC20)',
    }),
    memo: option(z.string().min(1).optional(), {
      short: 'm',
      description: 'Memo/tag if required by the network',
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
      'whitebit withdraw crypto <ticker> <amount> <address>',
    );
    const amount = parseArg(
      positional[1],
      z.string().min(1),
      'AMOUNT',
      'whitebit withdraw crypto <ticker> <amount> <address>',
    );
    const address = parseArg(
      positional[2],
      z.string().min(1),
      'ADDRESS',
      'whitebit withdraw crypto <ticker> <amount> <address>',
    );

    const response = await api.withdrawCrypto({
      ticker,
      amount,
      address,
      network: flags.network,
      memo: flags.memo,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
