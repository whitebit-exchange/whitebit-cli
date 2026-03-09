import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { AccountApi } from '../../lib/api/account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const accountFlexWithdrawCommand = defineCommand({
  name: 'flex-withdraw',
  description: 'Withdraw from flexible investment',
  options: {
    id: option(z.coerce.number().int().positive(), {
      description: 'Investment ID',
    }),
    amount: option(z.string().min(1), {
      short: 'a',
      description: 'Amount to withdraw',
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

    const response = await api.flexWithdraw({
      id: flags.id,
      amount: flags.amount,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
