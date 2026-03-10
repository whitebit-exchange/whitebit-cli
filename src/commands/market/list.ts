import { defineCommand } from '@bunli/core';

import { MarketApi } from '../../lib/api/market';
import { loadConfig, loadPublicConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';

export const listCommand = defineCommand({
  name: 'list',
  description: 'List all available trading pairs with specifications and status',
  handler: async () => {
    const runtimeConfig = loadConfig();
    const config = loadPublicConfig();
    const api = new MarketApi({ apiUrl: config.apiUrl });
    const response = await api.markets();

    if (runtimeConfig.dryRun) {
      return;
    }

    if (!response.success) {
      throw new Error(response.error?.message ?? 'Failed to fetch markets');
    }

    formatOutput(response.data, { format: runtimeConfig.format });
  },
});
