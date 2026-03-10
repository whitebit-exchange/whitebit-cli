import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { ConvertApi } from '../../lib/api/convert';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput, unwrapTableData } from '../../lib/formatter';
import { globalOptions } from '../../lib/global-options';
import { HttpClient } from '../../lib/http';

export const convertHistoryCommand = defineCommand({
  name: 'history',
  description: 'View completed conversions with rates and amounts (paginated)',
  options: {
    ...globalOptions,
    limit: option(z.number().min(1).max(500).optional(), {
      short: 'l',
      description: 'Number of records to retrieve (1-500, default: 50)',
    }),
    offset: option(z.number().min(0).optional(), {
      short: 'o',
      description: 'Starting position for pagination (default: 0)',
    }),
  },
  handler: async ({ flags }) => {
    const runtimeConfig = loadConfig({
      profile: flags.profile,
      apiUrl: flags.apiUrl,
      format: flags.json ? 'json' : flags.format,
      verbose: flags.verbose,
      retry: flags.noRetry === true ? false : undefined,
      dryRun: flags.dryRun,
    });
    const config = loadAuthConfig({
      apiUrl: flags.apiUrl,
      apiKey: flags.apiKey,
      apiSecret: flags.apiSecret,
      profile: flags.profile,
    });
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
