import { defineCommand } from '@bunli/core';
import { z } from 'zod';

import { SubAccountApi } from '../../lib/api/sub-account';
import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const ipListCommand = defineCommand({
  name: 'ip-list',
  description: 'List IP addresses whitelisted for API key access',
  handler: async ({ positional }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const subAccountId = parseArg(
      positional[0],
      z.string().min(1),
      'SUB_ACCOUNT_ID',
      'whitebit sub-account ip-list <sub_account_id> <api_key_id>',
    );
    const apiKeyId = parseArg(
      positional[1],
      z.string().min(1),
      'API_KEY_ID',
      'whitebit sub-account ip-list <sub_account_id> <api_key_id>',
    );

    const httpClient = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new SubAccountApi(httpClient);
    const result = await api.ipAddressList({
      subAccountId,
      apiKeyId,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(result, { format: runtimeConfig.format });
  },
});
