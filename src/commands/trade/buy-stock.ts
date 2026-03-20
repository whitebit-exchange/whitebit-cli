import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { TradeApi } from '../../lib/api/trade';
import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { globalOptions } from '../../lib/global-options';
import { HttpClient } from '../../lib/http';

export const tradeBuyStockCommand = defineCommand({
  name: 'buy-stock',
  description: 'Buy exact quantity of base asset at best market price (specify amount not value)',
  options: {
    ...globalOptions,
    clientOrderId: option(z.string().optional(), {
      short: 'c',
      description: 'User-defined order ID for tracking and cancellation',
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
      'whitebit trade spot buy-stock <pair> <amount>',
    );
    const amount = parseArg(
      positional[1],
      z.string().min(1),
      'AMOUNT',
      'whitebit trade spot buy-stock <pair> <amount>',
    );

    const response = await api.createBuyStockMarketOrder({
      market,
      amount,
      clientOrderId: flags.clientOrderId,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
