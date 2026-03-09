import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { SubAccountApi } from '../../lib/api/sub-account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const apiKeyCreateCommand = defineCommand({
  name: 'api-key-create',
  description: 'Create API key for sub-account',
  options: {
    subAccountId: option(z.string().min(1), {
      short: 's',
      description: 'Sub-account ID',
    }),
    label: option(z.string().min(1), {
      short: 'l',
      description: 'API key label',
    }),
    permissions: option(z.string().min(1), {
      short: 'p',
      description: 'Comma-separated permissions (e.g., trade,withdraw)',
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
    const result = await api.apiKeyCreate({
      subAccountId: flags.subAccountId,
      label: flags.label,
      permissions: flags.permissions.split(',').map((p) => p.trim()),
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(result, { format: runtimeConfig.format });
  },
});
