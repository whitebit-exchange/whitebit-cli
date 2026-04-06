import { defineCommand } from '@bunli/core';
import { z } from 'zod';

import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { globalOptions } from '../../lib/global-options';
import { authenticatedPost } from '../../lib/http';

export const collateralCancelOcoCommand = defineCommand({
  name: 'cancel-oco',
  description: 'Cancel an OCO order',
  options: {
    ...globalOptions,
  },
  handler: async ({ positional }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const market = parseArg(
      positional[0],
      z.string().min(1),
      'MARKET',
      'whitebit trade collateral cancel-oco <market> <order_id>',
    );
    const orderId = parseArg(
      positional[1],
      z.coerce.number().int().positive(),
      'ORDER_ID',
      'whitebit trade collateral cancel-oco <market> <order_id>',
    );

    const body = {
      market,
      orderId,
    };
    const response = await authenticatedPost('/api/v4/order/oco-cancel', body, config);
    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
