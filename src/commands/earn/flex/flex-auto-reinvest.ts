import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { AccountApi } from '../../lib/api/account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const accountFlexAutoReinvestCommand = defineCommand({
  name: 'flex-auto-reinvest',
  description: 'Set auto-reinvest for flexible investment',
  options: {
    id: option(z.coerce.number().int().positive(), {
      description: 'Investment ID',
    }),
    enabled: option(z.coerce.boolean(), {
      short: 'e',
      description: 'Enable (true) or disable (false) auto-reinvest',
    }),
  },
  handler: async ({ flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new AccountApi(client);

    const response = await api.flexAutoReinvest({
      id: flags.id,
      enabled: flags.enabled,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
