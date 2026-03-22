import { defineCommand } from '@bunli/core';

import { MarketApi } from '../../lib/api/market';
import { loadConfig, loadPublicConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { unwrapWhitebitPayload } from './helpers';

export const collateralMarketsCommand = defineCommand({
  name: 'collateral-markets',
  description: 'List markets available for margin and collateral trading',
  handler: async () => {
    const runtimeConfig = loadConfig();
    const config = loadPublicConfig();
    const api = new MarketApi({ apiUrl: config.apiUrl });
    const response = await api.collateralMarkets();

    if (runtimeConfig.dryRun) {
      return;
    }

    if (!response.success) {
      throw new Error(response.error?.message ?? 'Failed to fetch collateral markets');
    }

    formatOutput(unwrapWhitebitPayload(response.data), { format: runtimeConfig.format });
  },
});
