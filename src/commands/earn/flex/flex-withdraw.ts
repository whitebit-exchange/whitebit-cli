import { defineCommand } from '@bunli/core';
import { z } from 'zod';
import { AccountApi } from '../../../lib/api/account';
import { parseArg } from '../../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../../lib/config';
import { formatOutput } from '../../../lib/formatter';
import { HttpClient } from '../../../lib/http';

export const accountFlexWithdrawCommand = defineCommand({
  name: 'withdraw',
  description: 'Withdraw tokens from flexible staking anytime',
  handler: async ({ positional }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const id = parseArg(
      positional[0],
      z.coerce.number().int().positive(),
      'ID',
      'whitebit earn flex withdraw <id> <amount>',
    );
    const amount = parseArg(
      positional[1],
      z.string().min(1),
      'AMOUNT',
      'whitebit earn flex withdraw <id> <amount>',
    );

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new AccountApi(client);

    const response = await api.flexWithdraw({
      id,
      amount,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
