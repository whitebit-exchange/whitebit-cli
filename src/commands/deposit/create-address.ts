import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { AccountApi } from '../../lib/api/account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const accountCreateAddressCommand = defineCommand({
  name: 'create-address',
  description: 'Create a new deposit address',
  options: {
    ticker: option(z.string().min(1), {
      short: 't',
      description: 'Cryptocurrency ticker (e.g., BTC)',
    }),
    network: option(z.string().min(1).optional(), {
      short: 'n',
      description: 'Network identifier (e.g., ERC20)',
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

    const response = await api.createAddress({
      ticker: flags.ticker,
      network: flags.network,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
