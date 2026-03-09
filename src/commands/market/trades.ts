import { defineCommand, option } from '@bunli/core';

import { MarketApi } from '../../lib/api/market';
import { loadConfig, loadPublicConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';

export const tradesCommand = defineCommand({
  name: 'trades',
  description: 'Get recently executed trades for a market',
  options: {
    market: option({
      type: 'string',
      description: 'Market pair (e.g., BTC_USDT)',
      required: true,
    }),
    type: option({
      type: 'string',
      description: 'Trade type filter (buy or sell)',
      required: false,
    }),
  },
  handler: async ({ options }) => {
    const runtimeConfig = loadConfig();
    const config = loadPublicConfig();
    const api = new MarketApi({ apiUrl: config.apiUrl });

    if (options.type && options.type !== 'buy' && options.type !== 'sell') {
      throw new Error('Trade type must be "buy" or "sell"');
    }

    const response = await api.trades({
      market: options.market,
      type: options.type as 'buy' | 'sell' | undefined,
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
