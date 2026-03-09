import { defineCommand, option } from '@bunli/core';

import { MarketApi } from '../../lib/api/market';
import { loadConfig, loadPublicConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';

export const depthCommand = defineCommand({
  name: 'depth',
  description: 'Get order book depth within ±2% of market price',
  options: {
    market: option({
      type: 'string',
      description: 'Market pair (e.g., BTC_USDT)',
      required: true,
    }),
    limit: option({
      type: 'number',
      description: 'Number of price levels to return',
      required: false,
    }),
  },
  handler: async ({ options }) => {
    const runtimeConfig = loadConfig();
    const config = loadPublicConfig();
    const api = new MarketApi({ apiUrl: config.apiUrl });
    const response = await api.depth({
      market: options.market,
      limit: options.limit,
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
