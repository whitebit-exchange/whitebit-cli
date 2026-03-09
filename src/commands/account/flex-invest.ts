import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { AccountApi } from '../../lib/api/account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const accountFlexInvestCommand = defineCommand({
  name: 'flex-invest',
  description: 'Invest in a flexible plan',
  options: {
    planId: option(z.string().min(1), {
      description: 'Investment plan ID',
    }),
    amount: option(z.string().min(1), {
      short: 'a',
      description: 'Amount to invest',
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

    const response = await api.flexInvest({
      planId: flags.planId,
      amount: flags.amount,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
