import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { ConvertApi } from '../../lib/api/convert';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const convertEstimateCommand = defineCommand({
  name: 'estimate',
  description: 'Estimate conversion rate and amount',
  options: {
    from: option(z.string().min(1), {
      short: 'f',
      description: 'Source currency (e.g., BTC)',
    }),
    to: option(z.string().min(1), {
      short: 't',
      description: 'Target currency (e.g., USDT)',
    }),
    amount: option(z.string().min(1), {
      short: 'a',
      description: 'Amount to convert',
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
    const api = new ConvertApi(httpClient);

    const result = await api.estimate({
      from: flags.from,
      to: flags.to,
      amount: flags.amount,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(result, { format: runtimeConfig.format });
  },
});
