import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { authenticatedPost } from '../../lib/http';

export const collateralLimitOrderCommand = defineCommand({
  name: 'limit-order',
  description: 'Create a collateral limit order',
  options: {
    leverage: option(z.number().optional(), {
      short: 'l',
      description: 'Leverage multiplier (optional)',
    }),
    clientOrderId: option(z.string().optional(), {
      short: 'c',
      description: 'Client order ID (optional)',
    }),
    postOnly: option(z.boolean().optional(), {
      description: 'Post-only order flag (optional)',
    }),
    ioc: option(z.boolean().optional(), {
      description: 'Immediate-or-cancel flag (optional)',
    }),
  },
  handler: async ({ positional, flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const market = parseArg(
      positional[0],
      z.string().min(1),
      'MARKET',
      'whitebit trade collateral limit-order <market> <side> <amount> <price>',
    );
    const side = parseArg(
      positional[1],
      z.enum(['buy', 'sell']),
      'SIDE',
      'whitebit trade collateral limit-order <market> <side> <amount> <price>',
    );
    const amount = parseArg(
      positional[2],
      z.string().min(1),
      'AMOUNT',
      'whitebit trade collateral limit-order <market> <side> <amount> <price>',
    );
    const price = parseArg(
      positional[3],
      z.string().min(1),
      'PRICE',
      'whitebit trade collateral limit-order <market> <side> <amount> <price>',
    );

    const body = {
      market,
      side,
      amount,
      price,
      ...(flags.leverage !== undefined && { leverage: flags.leverage }),
      ...(flags.clientOrderId && { clientOrderId: flags.clientOrderId }),
      ...(flags.postOnly !== undefined && { postOnly: flags.postOnly }),
      ...(flags.ioc !== undefined && { ioc: flags.ioc }),
    };
    const response = await authenticatedPost('/api/v4/order/collateral/limit', body, config);
    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
