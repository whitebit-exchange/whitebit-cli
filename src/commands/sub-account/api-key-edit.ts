import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { SubAccountApi } from '../../lib/api/sub-account';
import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { globalOptions } from '../../lib/global-options';
import { HttpClient } from '../../lib/http';

export const apiKeyEditCommand = defineCommand({
  name: 'api-key-edit',
  description: 'Update API key label and permissions for sub-account',
  options: {
    ...globalOptions,
    label: option(z.string().min(1).optional(), {
      short: 'l',
      description: 'Update API key label for identification',
    }),
    permissions: option(z.string().min(1).optional(), {
      short: 'p',
      description: 'Update API key permissions (comma-separated)',
    }),
  },
  handler: async ({ positional, flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const subAccountId = parseArg(
      positional[0],
      z.string().min(1),
      'SUB_ACCOUNT_ID',
      'whitebit sub-account api-key-edit <sub_account_id> <api_key_id>',
    );

    const apiKeyId = parseArg(
      positional[1],
      z.string().min(1),
      'API_KEY_ID',
      'whitebit sub-account api-key-edit <sub_account_id> <api_key_id>',
    );

    const httpClient = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new SubAccountApi(httpClient);
    const result = await api.apiKeyEdit({
      subAccountId,
      apiKeyId,
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
