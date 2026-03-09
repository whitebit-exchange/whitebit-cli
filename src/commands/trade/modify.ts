import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { TradeApi } from '../../lib/api/trade';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const tradeModifyCommand = defineCommand({
  name: 'modify',
  description: 'Modify an existing order',
  options: {
    market: option(z.string().min(1), {
      short: 'm',
      description: 'Market symbol (e.g., BTC_USDT)',
    }),
    orderId: option(z.number().int().positive(), {
      short: 'i',
      description: 'Order ID to modify',
    }),
    price: option(z.string().optional(), {
      short: 'p',
      description: 'New order price',
    }),
    amount: option(z.string().optional(), {
      short: 'a',
      description: 'New order amount',
    }),
  },
  handler: async ({ flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    if (!flags.price && !flags.amount) {
      throw new Error('At least one of --price or --amount must be specified');
    }

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new TradeApi(client);

    const response = await api.modifyOrder({
      market: flags.market,
      orderId: flags.orderId,
      price: flags.price,
      amount: flags.amount,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
