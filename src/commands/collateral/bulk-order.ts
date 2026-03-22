import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { globalOptions } from '../../lib/global-options';
import { authenticatedPost } from '../../lib/http';

export const collateralBulkOrderCommand = defineCommand({
  name: 'bulk-order',
  description: 'Create multiple collateral limit orders',
  options: {
    ...globalOptions,
    orders: option(z.string().min(1), {
      short: 'o',
      description: 'JSON array of orders with side, amount, price, leverage, clientOrderId',
    }),
  },
  handler: async ({ positional, flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const market = parseArg(
      positional[0],
      z.string().min(1),
      'MARKET',
      'whitebit trade collateral bulk-order <market> --orders <json>',
    );

    const orders = JSON.parse(flags.orders);
    const body = {
      market,
      orders,
    };
    const response = await authenticatedPost('/api/v4/order/collateral/bulk', body, config);
    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
