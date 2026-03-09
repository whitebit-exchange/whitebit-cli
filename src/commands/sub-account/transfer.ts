import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { SubAccountApi } from '../../lib/api/sub-account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const transferCommand = defineCommand({
  name: 'transfer',
  description: 'Transfer funds to/from sub-account',
  options: {
    ticker: option(z.string().min(1), {
      short: 't',
      description: 'Asset ticker (e.g., BTC)',
    }),
    amount: option(z.string().min(1), {
      short: 'a',
      description: 'Amount to transfer',
    }),
    fromId: option(z.string().min(1).optional(), {
      short: 'f',
      description: 'Source sub-account ID (omit for main account)',
    }),
    toId: option(z.string().min(1).optional(), {
      short: 'o',
      description: 'Destination sub-account ID (omit for main account)',
    }),
  },
  handler: async ({ flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();
    const httpClient = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new SubAccountApi(httpClient);
    const result = await api.transfer({
      ticker: flags.ticker,
      amount: flags.amount,
      fromId: flags.fromId,
      toId: flags.toId,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(result, { format: runtimeConfig.format });
  },
});
