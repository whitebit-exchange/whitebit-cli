import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { authenticatedPost } from '../../lib/http';

export const collateralSetHedgeModeCommand = defineCommand({
  name: 'set-hedge-mode',
  description: 'Update collateral account hedge mode',
  options: {
    enabled: option(z.boolean(), {
      short: 'e',
      description: 'Enable or disable hedge mode',
    }),
  },
  handler: async ({ flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();
    const body = { enabled: flags.enabled };
    const response = await authenticatedPost('/api/v4/collateral-hedge-mode-set', body, config);
    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
