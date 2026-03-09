import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { SubAccountApi } from '../../lib/api/sub-account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const ipDeleteCommand = defineCommand({
  name: 'ip-delete',
  description: 'Remove IP address from API key whitelist',
  options: {
    subAccountId: option(z.string().min(1), {
      short: 's',
      description: 'Sub-account ID',
    }),
    apiKeyId: option(z.string().min(1), {
      short: 'k',
      description: 'API key ID',
    }),
    ip: option(z.string().min(1), {
      short: 'i',
      description: 'IP address to remove',
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
    const result = await api.ipAddressDelete({
      subAccountId: flags.subAccountId,
      apiKeyId: flags.apiKeyId,
      ip: flags.ip,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(result, { format: runtimeConfig.format });
  },
});
