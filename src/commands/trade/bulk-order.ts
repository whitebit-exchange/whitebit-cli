import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { TradeApi } from '../../lib/api/trade';
import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const tradeBulkOrderCommand = defineCommand({
  name: 'bulk-order',
  description: 'Create multiple orders in bulk',
  options: {
    orders: option(z.string().min(1), {
      short: 'o',
      description: 'Orders JSON array (e.g., \'[{"side":"buy","amount":"0.01","price":"50000"}]\')',
    }),
  },
  handler: async ({ positional, flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const market = parseArg(
      positional[0],
      z.string().min(1),
      'PAIR',
      'whitebit trade spot bulk-order <pair>',
    );

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
      market,
      orders,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
