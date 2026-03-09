import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { authenticatedPost } from '../../lib/http';

export const accountBalanceCommand = defineCommand({
  name: 'balance',
  description: 'Fetch spot trading balance',
  options: {
    ticker: option(z.string().min(1).optional(), {
      short: 't',
      description: 'Optional market symbol (for example BTC)',
    }),
  },
  handler: async ({ flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();
    const body = flags.ticker ? { ticker: flags.ticker } : {};
    const response = await authenticatedPost('/api/v4/trade-balance', body, config);
    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
