import { defineCommand } from '@bunli/core';
import { z } from 'zod';

import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { authenticatedPost } from '../../lib/http';

export const collateralSetHedgeModeCommand = defineCommand({
  name: 'set-hedge-mode',
  description: 'Update collateral account hedge mode',
  handler: async ({ positional }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const enabled = parseArg(
      positional[0],
      z.enum(['true', 'false']).transform((v) => v === 'true'),
      'ENABLED',
      'whitebit trade collateral set-hedge-mode <true|false>',
    );

    const body = { enabled };
    const response = await authenticatedPost(
      '/api/v4/collateral-account/hedge-mode/update',
      body,
      config,
    );
    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
