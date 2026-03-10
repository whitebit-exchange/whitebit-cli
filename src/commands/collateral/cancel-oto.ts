import { defineCommand } from '@bunli/core';
import { z } from 'zod';

import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { authenticatedPost } from '../../lib/http';

export const collateralCancelOtoCommand = defineCommand({
  name: 'cancel-oto',
  description: 'Cancel an OTO order',
  handler: async ({ positional }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const market = parseArg(
      positional[0],
      z.string().min(1),
      'MARKET',
      'whitebit trade collateral cancel-oto <market> <order_id>',
    );
    const orderId = parseArg(
      positional[1],
      z.coerce.number().int().positive(),
      'ORDER_ID',
      'whitebit trade collateral cancel-oto <market> <order_id>',
    );

    const body = {
      market,
      orderId,
    };
    const response = await authenticatedPost('/api/v4/order/oto-cancel', body, config);
    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
