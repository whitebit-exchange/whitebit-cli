import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { MarketApi } from '../../lib/api/market';
import { parseArg } from '../../lib/cli-helpers';
import { loadConfig, loadPublicConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';

export const klineCommand = defineCommand({
  name: 'kline',
  description: 'Get candlestick (OHLCV) data for charting and technical analysis',
  options: {
    start: option(z.coerce.number().int().optional(), {
      description: 'Start time in Unix milliseconds',
    }),
    end: option(z.coerce.number().int().optional(), {
      description: 'End time in Unix milliseconds',
    }),
    limit: option(z.coerce.number().int().positive().optional(), {
      description: 'Maximum number of candles to return',
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
      'whitebit market kline <pair> <interval>',
    );

    const interval = parseArg(
      positional[1],
      z.string().min(1),
      'INTERVAL',
      'whitebit market kline <pair> <interval>',
    );

    const response = await api.kline({
      market,
      interval,
      start: flags.start,
      end: flags.end,
      limit: flags.limit,
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
