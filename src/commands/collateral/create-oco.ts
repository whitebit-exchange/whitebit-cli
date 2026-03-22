import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { globalOptions } from '../../lib/global-options';
import { authenticatedPost } from '../../lib/http';

export const collateralCreateOcoCommand = defineCommand({
  name: 'create-oco',
  description: 'Create an OCO (One-Cancels-Other) order',
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
      'whitebit trade collateral create-oco <market> <side> <amount> <price> <stop_price>',
    );
    const side = parseArg(
      positional[1],
      z.enum(['buy', 'sell']),
      'SIDE',
      'whitebit trade collateral create-oco <market> <side> <amount> <price> <stop_price>',
    );
    const amount = parseArg(
      positional[2],
      z.string().min(1),
      'AMOUNT',
      'whitebit trade collateral create-oco <market> <side> <amount> <price> <stop_price>',
    );
    const price = parseArg(
      positional[3],
      z.string().min(1),
      'PRICE',
      'whitebit trade collateral create-oco <market> <side> <amount> <price> <stop_price>',
    );
    const stopPrice = parseArg(
      positional[4],
      z.string().min(1),
      'STOP_PRICE',
      'whitebit trade collateral create-oco <market> <side> <amount> <price> <stop_price>',
    );

    const body = {
      market,
      side,
      amount,
      price,
      stop_price: stopPrice,
      ...(flags.leverage !== undefined && { leverage: flags.leverage }),
      ...(flags.clientOrderId && { clientOrderId: flags.clientOrderId }),
    };
    const response = await authenticatedPost('/api/v4/order/collateral/oco', body, config);
    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
