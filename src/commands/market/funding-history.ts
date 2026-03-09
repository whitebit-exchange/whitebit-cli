import { defineCommand, option } from '@bunli/core';

import { MarketApi } from '../../lib/api/market';
import { loadConfig, loadPublicConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';

export const fundingHistoryCommand = defineCommand({
  name: 'funding-history',
  description: 'Get funding rate history for futures markets',
  options: {
    market: option({
      type: 'string',
      description: 'Futures market pair (e.g., BTC_USDT_PERP)',
      required: true,
    }),
    limit: option({
      type: 'number',
      description: 'Number of records to return',
      required: false,
    }),
    offset: option({
      type: 'number',
      description: 'Offset for pagination',
      required: false,
    }),
  },
  handler: async ({ options }) => {
    const runtimeConfig = loadConfig();
    const config = loadPublicConfig();
    const api = new MarketApi({ apiUrl: config.apiUrl });
    const response = await api.fundingHistory({
      market: options.market,
      limit: options.limit,
      offset: options.offset,
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
