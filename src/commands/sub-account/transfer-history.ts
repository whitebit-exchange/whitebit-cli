import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { SubAccountApi } from '../../lib/api/sub-account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput, unwrapTableData } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const transferHistoryCommand = defineCommand({
  name: 'transfer-history',
  description: 'Get sub-account transfer history',
  options: {
    limit: option(z.number().int().positive().optional(), {
      short: 'l',
      description: 'Limit number of results',
    }),
    offset: option(z.number().int().nonnegative().optional(), {
      short: 'o',
      description: 'Offset for pagination',
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
    const result = await api.transferHistory({
      limit: flags.limit,
      offset: flags.offset,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    const data = runtimeConfig.format === 'table' ? unwrapTableData(result) : result;
    formatOutput(data, { format: runtimeConfig.format });
  },
});
