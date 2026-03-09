import { defineCommand } from '@bunli/core';

import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { authenticatedPost } from '../../lib/http';

export const collateralBalanceSummaryCommand = defineCommand({
  name: 'balance-summary',
  description: 'Fetch collateral account balance summary with detailed asset breakdown',
  handler: async () => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();
    const response = await authenticatedPost(
      '/api/v4/collateral-account/balance-summary',
      {},
      config,
    );
    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
