import { defineCommand } from '@bunli/core';
import { z } from 'zod';

import { SubAccountApi } from '../../lib/api/sub-account';
import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { globalOptions } from '../../lib/global-options';
import { HttpClient } from '../../lib/http';

export const apiKeyCreateCommand = defineCommand({
  name: 'api-key-create',
  description: 'Generate new API key with specified permissions for sub-account',
  options: {
    ...globalOptions,
  },
  handler: async ({ positional }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const subAccountId = parseArg(
      positional[0],
      z.string().min(1),
      'SUB_ACCOUNT_ID',
      'whitebit sub-account api-key-create <sub_account_id> <label> <permissions>',
    );

    const label = parseArg(
      positional[1],
      z.string().min(1),
      'LABEL',
      'whitebit sub-account api-key-create <sub_account_id> <label> <permissions>',
    );

    const permissionsString = parseArg(
      positional[2],
      z.string().min(1),
      'PERMISSIONS',
      'whitebit sub-account api-key-create <sub_account_id> <label> <permissions>',
    );

    const httpClient = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new SubAccountApi(httpClient);
    const result = await api.apiKeyCreate({
      subAccountId,
      label,
      permissions: permissionsString.split(',').map((p) => p.trim()),
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(result, { format: runtimeConfig.format });
  },
});
