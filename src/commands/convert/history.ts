import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { ConvertApi } from '../../lib/api/convert';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput, unwrapTableData } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const convertHistoryCommand = defineCommand({
  name: 'history',
  description: 'Get conversion history',
  options: {
    limit: option(z.number().min(1).max(500).optional(), {
      short: 'l',
      description: 'Number of records to fetch (default: 50)',
    }),
    offset: option(z.number().min(0).optional(), {
      short: 'o',
      description: 'Pagination offset (default: 0)',
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

    const result = await api.history({
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
