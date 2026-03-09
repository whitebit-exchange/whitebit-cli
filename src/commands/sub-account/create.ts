import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { SubAccountApi } from '../../lib/api/sub-account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const createCommand = defineCommand({
  name: 'create',
  description: 'Create a new sub-account',
  options: {
    alias: option(z.string().min(1), {
      short: 'a',
      description: 'Sub-account alias/name',
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
    const result = await api.create({ alias: flags.alias });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(result, { format: runtimeConfig.format });
  },
});
