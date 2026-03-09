import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { AccountApi } from '../../lib/api/account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const accountMainBalanceCommand = defineCommand({
  name: 'main-balance',
  description: 'Get main account balance',
  options: {
    ticker: option(z.string().min(1).optional(), {
      short: 't',
      description: 'Optional ticker filter (e.g., BTC)',
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

    const response = await api.mainBalance(flags.ticker ? { ticker: flags.ticker } : undefined);

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
