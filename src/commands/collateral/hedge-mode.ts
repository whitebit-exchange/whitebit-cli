import { defineCommand } from '@bunli/core';

import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { authenticatedPost } from '../../lib/http';

export const collateralHedgeModeCommand = defineCommand({
  name: 'hedge-mode',
  description: 'Get collateral account hedge mode status',
  handler: async () => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();
    const response = await authenticatedPost('/api/v4/collateral-account/hedge-mode', {}, config);
    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
