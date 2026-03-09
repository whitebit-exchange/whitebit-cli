import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { SubAccountApi } from '../../lib/api/sub-account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const blockCommand = defineCommand({
  name: 'block',
  description: 'Block a sub-account',
  options: {
    id: option(z.string().min(1), {
      short: 'i',
      description: 'Sub-account ID',
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
    const result = await api.block({ id: flags.id });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(result, { format: runtimeConfig.format });
  },
});
