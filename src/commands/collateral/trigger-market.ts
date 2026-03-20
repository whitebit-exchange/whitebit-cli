import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { globalOptions } from '../../lib/global-options';
import { authenticatedPost } from '../../lib/http';

export const collateralTriggerMarketCommand = defineCommand({
  name: 'trigger-market',
  description: 'Create stop order: executes as market order at trigger price',
  options: {
    ...globalOptions,
    leverage: option(z.number().optional(), {
      short: 'l',
      description: 'Leverage multiplier (optional, required for margin)',
    }),
    clientOrderId: option(z.string().optional(), {
      short: 'c',
      description: 'Your custom order ID for tracking (optional)',
    }),
  },
  handler: async ({ positional, flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const market = parseArg(
      positional[0],
      z.string().min(1),
      'MARKET',
      'whitebit trade collateral trigger-market <market> <side> <amount> <activation_price>',
    );
    const side = parseArg(
      positional[1],
      z.enum(['buy', 'sell']),
      'SIDE',
      'whitebit trade collateral trigger-market <market> <side> <amount> <activation_price>',
    );
    const amount = parseArg(
      positional[2],
      z.string().min(1),
      'AMOUNT',
      'whitebit trade collateral trigger-market <market> <side> <amount> <activation_price>',
    );
    const activationPrice = parseArg(
      positional[3],
      z.string().min(1),
      'ACTIVATION_PRICE',
      'whitebit trade collateral trigger-market <market> <side> <amount> <activation_price>',
    );

    const body = {
      market,
      side,
      amount,
      activation_price: activationPrice,
      ...(flags.leverage !== undefined && { leverage: flags.leverage }),
      ...(flags.clientOrderId && { clientOrderId: flags.clientOrderId }),
    };
    const response = await authenticatedPost(
      '/api/v4/order/collateral/trigger-market',
      body,
      config,
    );
    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
