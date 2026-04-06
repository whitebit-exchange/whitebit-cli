import { defineCommand } from '@bunli/core';
import { z } from 'zod';

import { AccountApi } from '../../lib/api/account';
import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { globalOptions } from '../../lib/global-options';
import { HttpClient } from '../../lib/http';

export const accountFiatDepositAddressCommand = defineCommand({
  name: 'fiat-address',
  description: 'Get fiat currency deposit details (bank account or payment provider)',
  options: {
    ...globalOptions,
  },
  handler: async ({ positional }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new AccountApi(client);

    const provider = parseArg(
      positional[0],
      z.string().min(1),
      'PROVIDER',
      'whitebit deposit fiat-address <provider> <currency>',
    );
    const ticker = parseArg(
      positional[1],
      z.string().min(1),
      'CURRENCY',
      'whitebit deposit fiat-address <provider> <currency>',
    );

    const response = await api.fiatDepositAddress({
      ticker,
      provider,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
