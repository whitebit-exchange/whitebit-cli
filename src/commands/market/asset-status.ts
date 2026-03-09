import { defineCommand } from '@bunli/core';

import { MarketApi } from '../../lib/api/market';
import { loadConfig, loadPublicConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';

export const assetStatusCommand = defineCommand({
  name: 'asset-status',
  description: 'Get asset withdrawal and deposit status',
  handler: async () => {
    const runtimeConfig = loadConfig();
    const config = loadPublicConfig();
    const api = new MarketApi({ apiUrl: config.apiUrl });
    const response = await api.assetStatus();

    if (runtimeConfig.dryRun) {
      return;
    }

    if (!response.success) {
      throw new Error(response.error?.message ?? 'Failed to fetch asset status');
    }

    formatOutput(response.data, { format: runtimeConfig.format });
  },
});
