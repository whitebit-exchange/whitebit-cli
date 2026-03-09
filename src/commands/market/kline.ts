import { defineCommand, option } from '@bunli/core';

import { MarketApi } from '../../lib/api/market';
import { loadConfig, loadPublicConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';

export const klineCommand = defineCommand({
  name: 'kline',
  description: 'Get candlestick/kline data for a market',
  options: {
    market: option({
      type: 'string',
      description: 'Market pair (e.g., BTC_USDT)',
      required: true,
    }),
    interval: option({
      type: 'string',
      description: 'Kline interval (e.g., 1m, 5m, 15m, 1h, 4h, 1d)',
      required: true,
    }),
    start: option({
      type: 'number',
      description: 'Start time (Unix timestamp)',
      required: false,
    }),
    end: option({
      type: 'number',
      description: 'End time (Unix timestamp)',
      required: false,
    }),
    limit: option({
      type: 'number',
      description: 'Number of records to return',
      required: false,
    }),
  },
  handler: async ({ options }) => {
    const runtimeConfig = loadConfig();
    const config = loadPublicConfig();
    const api = new MarketApi({ apiUrl: config.apiUrl });
    const response = await api.kline({
      market: options.market,
      interval: options.interval,
      start: options.start,
      end: options.end,
      limit: options.limit,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    if (!response.success) {
      throw new Error(response.error?.message ?? 'Failed to fetch kline data');
    }

    formatOutput(response.data, { format: runtimeConfig.format });
  },
});
