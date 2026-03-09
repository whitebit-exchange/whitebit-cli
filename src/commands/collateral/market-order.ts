import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { authenticatedPost } from '../../lib/http';

export const collateralMarketOrderCommand = defineCommand({
  name: 'market-order',
  description: 'Create a collateral market order',
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
    leverage: option(z.number().optional(), {
      short: 'l',
      description: 'Leverage multiplier (optional)',
    }),
    clientOrderId: option(z.string().optional(), {
      short: 'c',
      description: 'Client order ID (optional)',
    }),
  },
  handler: async ({ flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();
    const body = {
      market: flags.market,
      side: flags.side,
      amount: flags.amount,
      ...(flags.leverage !== undefined && { leverage: flags.leverage }),
      ...(flags.clientOrderId && { clientOrderId: flags.clientOrderId }),
    };
    const response = await authenticatedPost('/api/v4/collateral-market', body, config);
    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
