import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { AccountApi } from '../../lib/api/account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const accountTransferCommand = defineCommand({
  name: 'transfer',
  description: 'Transfer funds between accounts',
  options: {
    ticker: option(z.string().min(1), {
      short: 't',
      description: 'Currency ticker (e.g., BTC)',
    }),
    amount: option(z.string().min(1), {
      short: 'a',
      description: 'Amount to transfer',
    }),
    from: option(z.string().min(1), {
      short: 'f',
      description: 'Source account (e.g., main, trade)',
    }),
    to: option(z.string().min(1), {
      description: 'Destination account (e.g., main, trade)',
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

    const response = await api.transfer({
      ticker: flags.ticker,
      amount: flags.amount,
      from: flags.from,
      to: flags.to,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
