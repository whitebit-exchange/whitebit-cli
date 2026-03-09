import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { SubAccountApi } from '../../lib/api/sub-account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const apiKeyEditCommand = defineCommand({
  name: 'api-key-edit',
  description: 'Edit sub-account API key',
  options: {
    subAccountId: option(z.string().min(1), {
      short: 's',
      description: 'Sub-account ID',
    }),
    apiKeyId: option(z.string().min(1), {
      short: 'k',
      description: 'API key ID',
    }),
    label: option(z.string().min(1).optional(), {
      short: 'l',
      description: 'New API key label',
    }),
    permissions: option(z.string().min(1).optional(), {
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
    const result = await api.apiKeyEdit({
      subAccountId: flags.subAccountId,
      apiKeyId: flags.apiKeyId,
      label: flags.label,
      permissions: flags.permissions
        ? flags.permissions.split(',').map((p) => p.trim())
        : undefined,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(result, { format: runtimeConfig.format });
  },
});
