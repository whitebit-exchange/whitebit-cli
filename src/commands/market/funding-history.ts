import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { MarketApi } from '../../lib/api/market';
import { parseArg } from '../../lib/cli-helpers';
import { loadConfig, loadPublicConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';

export const fundingHistoryCommand = defineCommand({
  name: 'funding-history',
  description: 'Get periodic funding rate payments paid for holding futures positions',
  options: {
    limit: option(z.coerce.number().int().positive().optional(), {
      description: 'Maximum number of records to return',
    }),
    offset: option(z.coerce.number().int().min(0).optional(), {
      description: 'Number of records to skip for pagination',
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
      'whitebit market funding-history <pair>',
    );

    const response = await api.fundingHistory({
      market,
      limit: flags.limit,
      offset: flags.offset,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    if (!response.success) {
      throw new Error(response.error?.message ?? 'Failed to fetch funding history');
    }

    formatOutput(response.data, { format: runtimeConfig.format });
  },
});
