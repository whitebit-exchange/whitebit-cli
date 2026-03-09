import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { SubAccountApi } from '../../lib/api/sub-account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const apiKeyResetCommand = defineCommand({
  name: 'api-key-reset',
  description: 'Reset sub-account API key',
  options: {
    subAccountId: option(z.string().min(1), {
      short: 's',
      description: 'Sub-account ID',
    }),
    apiKeyId: option(z.string().min(1), {
      short: 'k',
      description: 'API key ID',
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
    const result = await api.apiKeyReset({
      subAccountId: flags.subAccountId,
      apiKeyId: flags.apiKeyId,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(result, { format: runtimeConfig.format });
  },
});
