import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { TradeApi } from '../../lib/api/trade';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const tradeLimitOrderCommand = defineCommand({
  name: 'limit-order',
  description: 'Create a limit order',
  options: {
    market: option(z.string().min(1), {
      short: 'm',
      description: 'Market symbol (e.g., BTC_USDT)',
    }),
    side: option(z.enum(['buy', 'sell']), {
      short: 's',
      description: 'Order side: buy or sell',
    }),
    amount: option(z.string().min(1), {
      short: 'a',
      description: 'Order amount',
    }),
    price: option(z.string().min(1), {
      short: 'p',
      description: 'Order price',
    }),
    clientOrderId: option(z.string().optional(), {
      short: 'c',
      description: 'Optional client order ID',
    }),
    postOnly: option(z.boolean().optional(), {
      description: 'Post-only order (maker only)',
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

    const response = await api.createLimitOrder({
      market: flags.market,
      side: flags.side,
      amount: flags.amount,
      price: flags.price,
      clientOrderId: flags.clientOrderId,
      postOnly: flags.postOnly,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
