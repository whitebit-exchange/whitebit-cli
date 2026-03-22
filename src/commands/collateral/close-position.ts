import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { globalOptions } from '../../lib/global-options';
import { authenticatedPost } from '../../lib/http';

export const collateralClosePositionCommand = defineCommand({
  name: 'close-position',
  description: 'Close a collateral position',
  options: {
    ...globalOptions,
    positionId: option(z.number().optional(), {
      short: 'p',
      description: 'Position ID (optional)',
    }),
  },
  handler: async ({ positional, flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const market = parseArg(
      positional[0],
      z.string().min(1),
      'MARKET',
      'whitebit trade collateral close-position <market>',
    );

    const body = {
      market,
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
