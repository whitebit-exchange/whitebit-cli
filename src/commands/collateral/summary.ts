import { defineCommand } from '@bunli/core';

import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { authenticatedPost } from '../../lib/http';

export const collateralSummaryCommand = defineCommand({
  name: 'summary',
  description: 'View collateral account summary with totals and key metrics',
  handler: async () => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();
    const response = await authenticatedPost('/api/v4/collateral-account/summary', {}, config);
    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
