import { defineCommand } from '@bunli/core';
import { z } from 'zod';
import { AccountApi } from '../../../lib/api/account';
import { parseArg } from '../../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../../lib/config';
import { formatOutput } from '../../../lib/formatter';
import { HttpClient } from '../../../lib/http';

export const accountFlexInvestCommand = defineCommand({
  name: 'invest',
  description: 'Stake tokens in flexible plan; withdraw anytime, variable APR',
  handler: async ({ positional }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const planId = parseArg(
      positional[0],
      z.string().min(1),
      'PLAN_ID',
      'whitebit earn flex invest <plan_id> <amount>',
    );
    const amount = parseArg(
      positional[1],
      z.string().min(1),
      'AMOUNT',
      'whitebit earn flex invest <plan_id> <amount>',
    );

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new AccountApi(client);

    const response = await api.flexInvest({
      planId,
      amount,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
