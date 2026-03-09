import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { TradeApi } from '../../lib/api/trade';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const tradeCancelCommand = defineCommand({
  name: 'cancel',
  description: 'Cancel a specific order',
  options: {
    market: option(z.string().min(1), {
      short: 'm',
      description: 'Market symbol (e.g., BTC_USDT)',
    }),
    orderId: option(z.number().int().positive(), {
      short: 'i',
      description: 'Order ID to cancel',
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

    const response = await api.cancelOrder({
      market: flags.market,
      orderId: flags.orderId,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
