import { defineCommand } from '@bunli/core';

import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { authenticatedPost } from '../../lib/http';

export const collateralBalanceCommand = defineCommand({
  name: 'balance',
  description: 'Fetch collateral account balance',
  handler: async () => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();
    const response = await authenticatedPost('/api/v4/collateral-balance', {}, config);
    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
