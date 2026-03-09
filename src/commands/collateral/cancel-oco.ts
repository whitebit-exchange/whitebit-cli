import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { authenticatedPost } from '../../lib/http';

export const collateralCancelOcoCommand = defineCommand({
  name: 'cancel-oco',
  description: 'Cancel an OCO order',
  options: {
    market: option(z.string().min(1), {
      short: 'm',
      description: 'Market symbol (e.g., BTC_USDT)',
    }),
    orderId: option(z.number(), {
      short: 'i',
      description: 'Order ID',
    }),
  },
  handler: async ({ flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();
    const body = {
      market: flags.market,
      orderId: flags.orderId,
    };
    const response = await authenticatedPost('/api/v4/collateral-cancel-oco', body, config);
    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
