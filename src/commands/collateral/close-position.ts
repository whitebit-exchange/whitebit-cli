import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { authenticatedPost } from '../../lib/http';

export const collateralClosePositionCommand = defineCommand({
  name: 'close-position',
  description: 'Close a collateral position',
  options: {
    market: option(z.string().min(1), {
      short: 'm',
      description: 'Market symbol (e.g., BTC_USDT)',
    }),
    positionId: option(z.number().optional(), {
      short: 'p',
      description: 'Position ID (optional)',
    }),
  },
  handler: async ({ flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();
    const body = {
      market: flags.market,
      ...(flags.positionId !== undefined && { positionId: flags.positionId }),
    };
    const response = await authenticatedPost(
      '/api/v4/collateral-account/position/close',
      body,
      config,
    );
    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
