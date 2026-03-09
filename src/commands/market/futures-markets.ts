import { defineCommand } from '@bunli/core';

import { MarketApi } from '../../lib/api/market';
import { loadConfig, loadPublicConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { unwrapWhitebitPayload } from './helpers';

export const futuresMarketsCommand = defineCommand({
  name: 'futures-markets',
  description: 'Get available futures markets list',
  handler: async () => {
    const runtimeConfig = loadConfig();
    const config = loadPublicConfig();
    const api = new MarketApi({ apiUrl: config.apiUrl });
    const response = await api.availableFuturesMarkets();

    if (runtimeConfig.dryRun) {
      return;
    }

    if (!response.success) {
      throw new Error(response.error?.message ?? 'Failed to fetch futures markets');
    }

    formatOutput(unwrapWhitebitPayload(response.data), { format: runtimeConfig.format });
  },
});
