import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { TradeApi } from '../../lib/api/trade';
import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const tradeStopMarketCommand = defineCommand({
  name: 'stop-market',
  description: 'Create a stop-market order',
  options: {
    clientOrderId: option(z.string().optional(), {
      short: 'c',
      description: 'Optional client order ID',
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
      'whitebit trade spot stop-market <pair> <side> <amount> <activation_price>',
    );
    const side = parseArg(
      positional[1],
      z.enum(['buy', 'sell']),
      'SIDE',
      'whitebit trade spot stop-market <pair> <side> <amount> <activation_price>',
    );
    const amount = parseArg(
      positional[2],
      z.string().min(1),
      'AMOUNT',
      'whitebit trade spot stop-market <pair> <side> <amount> <activation_price>',
    );
    const activationPrice = parseArg(
      positional[3],
      z.string().min(1),
      'ACTIVATION_PRICE',
      'whitebit trade spot stop-market <pair> <side> <amount> <activation_price>',
    );

    const response = await api.createStopMarketOrder({
      market,
      side,
      amount,
      activation_price: activationPrice,
      clientOrderId: flags.clientOrderId,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
