import { defineCommand } from '@bunli/core';

import { AccountApi } from '../../lib/api/account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const accountMiningHashrateCommand = defineCommand({
  name: 'mining-hashrate',
  description: 'Get mining hashrate information',
  handler: async ({ positional }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new AccountApi(client);

    const account = positional[0];
    if (!account) {
      throw new Error(
        'Missing required argument: ACCOUNT\n\nUsage: whitebit market mining-hashrate <account>',
      );
    }

    const response = await api.miningHashrate({ account });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
