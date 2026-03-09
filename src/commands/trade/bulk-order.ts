import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { TradeApi } from '../../lib/api/trade';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const tradeBulkOrderCommand = defineCommand({
  name: 'bulk-order',
  description: 'Create multiple orders in bulk',
  options: {
    market: option(z.string().min(1), {
      short: 'm',
      description: 'Market symbol (e.g., BTC_USDT)',
    }),
    orders: option(z.string().min(1), {
      short: 'o',
      description: 'Orders JSON array (e.g., \'[{"side":"buy","amount":"0.01","price":"50000"}]\')',
    }),
  },
  handler: async ({ flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    let orders: unknown;
    try {
      orders = JSON.parse(flags.orders);
      if (!Array.isArray(orders)) {
        throw new Error('Orders must be an array');
      }
    } catch (error) {
      throw new Error(
        `Invalid orders JSON: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new TradeApi(client);

    const response = await api.createBulkOrders({
      market: flags.market,
      orders,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
