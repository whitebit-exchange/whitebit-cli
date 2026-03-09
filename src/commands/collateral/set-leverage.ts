import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { authenticatedPost } from '../../lib/http';

export const collateralSetLeverageCommand = defineCommand({
  name: 'set-leverage',
  description: 'Set leverage for a collateral market',
  options: {
    market: option(z.string().min(1), {
      short: 'm',
      description: 'Market symbol (e.g., BTC_USDT)',
    }),
    leverage: option(z.number(), {
      short: 'l',
      description: 'Leverage multiplier',
    }),
  },
  handler: async ({ flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();
    const body = {
      market: flags.market,
      leverage: flags.leverage,
    };
    const response = await authenticatedPost('/api/v4/collateral-leverage', body, config);
    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
