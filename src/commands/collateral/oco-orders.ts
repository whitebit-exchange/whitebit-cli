import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { authenticatedPost } from '../../lib/http';

export const collateralOcoOrdersCommand = defineCommand({
  name: 'oco-orders',
  description: 'Get unexecuted OCO orders',
  options: {
    market: option(z.string().optional(), {
      short: 'm',
      description: 'Filter by market symbol (optional)',
    }),
  },
  handler: async ({ flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();
    const body = flags.market ? { market: flags.market } : {};
    const response = await authenticatedPost('/api/v4/collateral-oco-orders', body, config);
    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
