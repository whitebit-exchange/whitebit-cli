import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { TradeApi } from '../../lib/api/trade';
import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { globalOptions } from '../../lib/global-options';
import { HttpClient } from '../../lib/http';

export const tradeModifyCommand = defineCommand({
  name: 'modify',
  description: 'Update price and/or amount of an existing order',
  options: {
    ...globalOptions,
    price: option(z.string().optional(), {
      short: 'p',
      description: 'New order price',
    }),
    amount: option(z.string().optional(), {
      short: 'a',
      description: 'New order amount',
    }),
  },
  handler: async ({ positional, flags }) => {
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

    const market = parseArg(
      positional[0],
      z.string().min(1),
      'PAIR',
      'whitebit trade spot modify <pair> <order_id>',
    );
    const orderId = parseArg(
      positional[1],
      z.coerce.number().int().positive(),
      'ORDER_ID',
      'whitebit trade spot modify <pair> <order_id>',
    );

    const response = await api.modifyOrder({
      market,
      orderId,
      price: flags.price,
      amount: flags.amount,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
