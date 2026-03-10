import { defineCommand } from '@bunli/core';
import { z } from 'zod';

import { AccountApi } from '../../lib/api/account';
import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const accountWithdrawFiatCommand = defineCommand({
  name: 'fiat',
  description: 'Withdraw fiat currency to bank account or payment provider',
  handler: async ({ positional }) => {
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
      'CURRENCY',
      'whitebit withdraw fiat <currency> <amount> <provider>',
    );
    const amount = parseArg(
      positional[1],
      z.string().min(1),
      'AMOUNT',
      'whitebit withdraw fiat <currency> <amount> <provider>',
    );
    const provider = parseArg(
      positional[2],
      z.string().min(1),
      'PROVIDER',
      'whitebit withdraw fiat <currency> <amount> <provider>',
    );

    const response = await api.withdrawFiat({
      ticker,
      amount,
      provider,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
