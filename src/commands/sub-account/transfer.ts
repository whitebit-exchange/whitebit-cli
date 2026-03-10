import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { SubAccountApi } from '../../lib/api/sub-account';
import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const transferCommand = defineCommand({
  name: 'transfer',
  description: 'Transfer funds between main account and sub-accounts',
  options: {
    fromId: option(z.string().min(1).optional(), {
      short: 'f',
      description: 'Source sub-account ID (omit for main account transfer)',
    }),
    toId: option(z.string().min(1).optional(), {
      short: 'o',
      description: 'Destination sub-account ID (omit for main account transfer)',
    }),
  },
  handler: async ({ positional, flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const ticker = parseArg(
      positional[0],
      z.string().min(1),
      'ASSET',
      'whitebit sub-account transfer <asset> <amount>',
    );

    const amount = parseArg(
      positional[1],
      z.string().min(1),
      'AMOUNT',
      'whitebit sub-account transfer <asset> <amount>',
    );

    const httpClient = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new SubAccountApi(httpClient);
    const result = await api.transfer({
      ticker,
      amount,
      fromId: flags.fromId,
      toId: flags.toId,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(result, { format: runtimeConfig.format });
  },
});
