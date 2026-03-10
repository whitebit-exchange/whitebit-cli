import { defineCommand } from '@bunli/core';
import { z } from 'zod';

import { SubAccountApi } from '../../lib/api/sub-account';
import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const editCommand = defineCommand({
  name: 'edit',
  description: 'Update sub-account alias and information',
  handler: async ({ positional }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const id = parseArg(
      positional[0],
      z.string().min(1),
      'ID',
      'whitebit sub-account edit <id> <alias>',
    );

    const alias = parseArg(
      positional[1],
      z.string().min(1),
      'ALIAS',
      'whitebit sub-account edit <id> <alias>',
    );

    const httpClient = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new SubAccountApi(httpClient);
    const result = await api.edit({ id, alias });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(result, { format: runtimeConfig.format });
  },
});
