import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { AccountApi } from '../../lib/api/account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const accountInterestHistoryCommand = defineCommand({
  name: 'interest-history',
  description: 'Get interest payments history',
  options: {
    limit: option(z.coerce.number().int().positive().optional(), {
      short: 'l',
      description: 'Limit number of results',
    }),
    offset: option(z.coerce.number().int().nonnegative().optional(), {
      short: 'o',
      description: 'Offset for pagination',
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

    const response = await api.interestPaymentsHistory({
      limit: flags.limit,
      offset: flags.offset,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
