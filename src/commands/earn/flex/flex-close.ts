import { defineCommand } from '@bunli/core';
import { z } from 'zod';
import { AccountApi } from '../../../lib/api/account';
import { parseArg } from '../../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../../lib/config';
import { formatOutput } from '../../../lib/formatter';
import { HttpClient } from '../../../lib/http';

export const accountFlexCloseCommand = defineCommand({
  name: 'close',
  description: 'Close flexible staking and withdraw tokens immediately',
  handler: async ({ positional }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const id = parseArg(
      positional[0],
      z.coerce.number().int().positive(),
      'ID',
      'whitebit earn flex close <id>',
    );

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new AccountApi(client);

    const response = await api.flexClose({ id });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
