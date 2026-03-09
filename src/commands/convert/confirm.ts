import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { ConvertApi } from '../../lib/api/convert';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const convertConfirmCommand = defineCommand({
  name: 'confirm',
  description: 'Confirm and execute a conversion',
  options: {
    estimateId: option(z.string().min(1), {
      short: 'e',
      description: 'Estimate ID from convert estimate',
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

    const result = await api.confirm({
      estimateId: flags.estimateId,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(result, { format: runtimeConfig.format });
  },
});
