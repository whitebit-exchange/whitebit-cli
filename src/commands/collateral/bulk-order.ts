import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { authenticatedPost } from '../../lib/http';

export const collateralBulkOrderCommand = defineCommand({
  name: 'bulk-order',
  description: 'Create multiple collateral limit orders',
  options: {
    market: option(z.string().min(1), {
      short: 'm',
      description: 'Market symbol (e.g., BTC_USDT)',
    }),
    orders: option(z.string().min(1), {
      short: 'o',
      description: 'JSON array of orders with side, amount, price, leverage, clientOrderId',
    }),
  },
  handler: async ({ flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();
    const orders = JSON.parse(flags.orders);
    const body = {
      market: flags.market,
      orders,
    };
    const response = await authenticatedPost('/api/v4/collateral-bulk-limit', body, config);
    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
