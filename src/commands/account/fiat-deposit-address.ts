import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { AccountApi } from '../../lib/api/account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const accountFiatDepositAddressCommand = defineCommand({
  name: 'fiat-deposit-address',
  description: 'Get fiat deposit URL',
  options: {
    ticker: option(z.string().min(1), {
      short: 't',
      description: 'Fiat currency ticker (e.g., USD)',
    }),
    provider: option(z.string().min(1), {
      short: 'p',
      description: 'Payment provider identifier',
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

    const response = await api.fiatDepositAddress({
      ticker: flags.ticker,
      provider: flags.provider,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
