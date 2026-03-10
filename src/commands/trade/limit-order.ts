import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { TradeApi } from '../../lib/api/trade';
import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const tradeLimitOrderCommand = defineCommand({
  name: 'limit-order',
  description:
    'Create a limit order at a specific price (sell when price rises, buy when price falls)',
  options: {
    clientOrderId: option(z.string().optional(), {
      short: 'c',
      description: 'User-defined order ID for tracking and cancellation',
    }),
    postOnly: option(z.boolean().optional(), {
      description: 'Only create maker orders (add liquidity, not take existing orders)',
    }),
  },
  handler: async ({ positional, flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new TradeApi(client);

    const market = parseArg(
      positional[0],
      z.string().min(1),
      'PAIR',
      'whitebit trade spot limit-order <pair> <side> <amount> <price>',
    );
    const side = parseArg(
      positional[1],
      z.enum(['buy', 'sell']),
      'SIDE',
      'whitebit trade spot limit-order <pair> <side> <amount> <price>',
    );
    const amount = parseArg(
      positional[2],
      z.string().min(1),
      'AMOUNT',
      'whitebit trade spot limit-order <pair> <side> <amount> <price>',
    );
    const price = parseArg(
      positional[3],
      z.string().min(1),
      'PRICE',
      'whitebit trade spot limit-order <pair> <side> <amount> <price>',
    );

    const response = await api.createLimitOrder({
      market,
      side,
      amount,
      price,
      clientOrderId: flags.clientOrderId,
      postOnly: flags.postOnly,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
