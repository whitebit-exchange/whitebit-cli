import { defineCommand } from '@bunli/core';
import { z } from 'zod';

import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { authenticatedPost } from '../../lib/http';

export const collateralSetLeverageCommand = defineCommand({
  name: 'set-leverage',
  description: 'Set leverage for a collateral market',
  handler: async ({ positional }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const market = parseArg(
      positional[0],
      z.string().min(1),
      'MARKET',
      'whitebit trade collateral set-leverage <market> <leverage>',
    );
    const leverage = parseArg(
      positional[1],
      z.coerce.number().int().positive(),
      'LEVERAGE',
      'whitebit trade collateral set-leverage <market> <leverage>',
    );

    const body = {
      market,
      leverage,
    };
    const response = await authenticatedPost('/api/v4/collateral-account/leverage', body, config);
    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
