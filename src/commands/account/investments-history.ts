import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { AccountApi } from '../../lib/api/account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput, unwrapTableData } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const accountInvestmentsHistoryCommand = defineCommand({
  name: 'investments-history',
  description: 'Get fixed investments history',
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

    const response = await api.investmentsHistory({
      limit: flags.limit,
      offset: flags.offset,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    const data = runtimeConfig.format === 'table' ? unwrapTableData(response) : response;
    formatOutput(data, { format: runtimeConfig.format });
  },
});
