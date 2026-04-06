import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { MarketApi } from '../../lib/api/market';
import { parseArg } from '../../lib/cli-helpers';
import { loadConfig, loadPublicConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { globalOptions } from '../../lib/global-options';

export const depthCommand = defineCommand({
  name: 'depth',
  description: 'Get order book depth within ±2% of market price',
  options: {
    ...globalOptions,
    limit: option(z.coerce.number().int().positive().optional(), {
      description: 'Number of price levels to return',
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
      'whitebit market depth <pair>',
    );

    const response = await api.depth({
      market,
      limit: flags.limit,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    if (!response.success) {
      throw new Error(response.error?.message ?? 'Failed to fetch depth');
    }

    formatOutput(response.data, { format: runtimeConfig.format });
  },
});
