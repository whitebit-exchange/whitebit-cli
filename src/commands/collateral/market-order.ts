import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { globalOptions } from '../../lib/global-options';
import { authenticatedPost } from '../../lib/http';

export const collateralMarketOrderCommand = defineCommand({
  name: 'market-order',
  description: 'Create a collateral market order',
  options: {
    ...globalOptions,
    leverage: option(z.number().optional(), {
      short: 'l',
      description: 'Leverage multiplier (optional)',
    }),
    clientOrderId: option(z.string().optional(), {
      short: 'c',
      description: 'Client order ID (optional)',
    }),
  },
  handler: async ({ positional, flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const market = parseArg(
      positional[0],
      z.string().min(1),
      'MARKET',
      'whitebit trade collateral market-order <market> <side> <amount>',
    );
    const side = parseArg(
      positional[1],
      z.enum(['buy', 'sell']),
      'SIDE',
      'whitebit trade collateral market-order <market> <side> <amount>',
    );
    const amount = parseArg(
      positional[2],
      z.string().min(1),
      'AMOUNT',
      'whitebit trade collateral market-order <market> <side> <amount>',
    );

    const body = {
      market,
      side,
      amount,
      ...(flags.leverage !== undefined && { leverage: flags.leverage }),
      ...(flags.clientOrderId && { clientOrderId: flags.clientOrderId }),
    };
    const response = await authenticatedPost('/api/v4/order/collateral/market', body, config);
    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
