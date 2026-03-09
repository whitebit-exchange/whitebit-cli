import { defineCommand } from '@bunli/core';

import { MarketApi } from '../../lib/api/market';
import { loadConfig, loadPublicConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';

export const serverTimeCommand = defineCommand({
  name: 'server-time',
  description: 'Get current server time',
  handler: async () => {
    const runtimeConfig = loadConfig();
    const config = loadPublicConfig();
    const api = new MarketApi({ apiUrl: config.apiUrl });
    const response = await api.serverTime();

    if (runtimeConfig.dryRun) {
      return;
    }

    if (!response.success) {
      throw new Error(response.error?.message ?? 'Failed to fetch server time');
    }

    formatOutput(response.data, { format: runtimeConfig.format });
  },
});
