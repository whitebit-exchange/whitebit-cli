import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { TradeApi } from '../../lib/api/trade';
import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { globalOptions } from '../../lib/global-options';
import { HttpClient } from '../../lib/http';

export const tradeDealsCommand = defineCommand({
  name: 'deals',
  description: 'Get all trades executed for a specific order with pagination',
  options: {
    ...globalOptions,
    limit: option(z.number().int().positive().optional(), {
      short: 'l',
      description: 'Maximum number of deals to return',
    }),
    offset: option(z.number().int().nonnegative().optional(), {
      short: 'o',
      description: 'Offset for pagination',
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

    const orderId = parseArg(
      positional[0],
      z.coerce.number().int().positive(),
      'ORDER_ID',
      'whitebit trade spot deals <order_id>',
    );

    const response = await api.executedDeals({
      orderId,
      limit: flags.limit,
      offset: flags.offset,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
