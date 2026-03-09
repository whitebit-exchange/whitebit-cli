import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { TradeApi } from '../../lib/api/trade';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';
import { recordOfArraysToRows } from '../market/helpers';

export const tradeExecutedCommand = defineCommand({
  name: 'executed',
  description: 'List executed orders',
  options: {
    market: option(z.string().optional(), {
      short: 'm',
      description: 'Optional market symbol to filter (e.g., BTC_USDT)',
    }),
    limit: option(z.number().int().positive().optional(), {
      short: 'l',
      description: 'Maximum number of orders to return',
    }),
    offset: option(z.number().int().nonnegative().optional(), {
      short: 'o',
      description: 'Offset for pagination',
    }),
  },
  handler: async ({ flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new TradeApi(client);

    const response = await api.executedOrders({
      market: flags.market,
      limit: flags.limit,
      offset: flags.offset,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    const data =
      runtimeConfig.format === 'table' ? recordOfArraysToRows(response, 'market') : response;
    formatOutput(data, { format: runtimeConfig.format });
  },
});
