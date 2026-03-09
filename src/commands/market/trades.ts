import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { MarketApi } from '../../lib/api/market';
import { parseArg } from '../../lib/cli-helpers';
import { loadConfig, loadPublicConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';

export const tradesCommand = defineCommand({
  name: 'trades',
  description: 'Get recently executed trades for a market',
  options: {
    type: option(z.enum(['buy', 'sell']).optional(), {
      description: 'Trade type filter (buy or sell)',
    }),
  },
  handler: async ({ positional, flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadPublicConfig();
    const api = new MarketApi({ apiUrl: config.apiUrl });

    const market = parseArg(
      positional[0],
      z.string().min(1),
      'PAIR',
      'whitebit market trades <pair>',
    );

    const response = await api.trades({
      market,
      type: flags.type,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    if (!response.success) {
      throw new Error(response.error?.message ?? 'Failed to fetch trades');
    }

    formatOutput(response.data, { format: runtimeConfig.format });
  },
});
