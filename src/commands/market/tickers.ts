import { defineCommand } from '@bunli/core';

import { MarketApi } from '../../lib/api/market';
import { loadConfig, loadPublicConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { recordToRows, unwrapWhitebitPayload } from './helpers';

export const marketTickersCommand = defineCommand({
  name: 'tickers',
  description: 'Get current price, volume, and change metrics for all trading pairs',
  handler: async () => {
    const runtimeConfig = loadConfig();
    const config = loadPublicConfig();
    const api = new MarketApi({ apiUrl: config.apiUrl });
    const response = await api.tickers();

    if (runtimeConfig.dryRun) {
      return;
    }

    if (!response.success) {
      throw new Error(response.error?.message ?? 'Failed to fetch tickers');
    }

    const payload = unwrapWhitebitPayload<Record<string, unknown>>(response.data);
    formatOutput(recordToRows(payload, 'market'), { format: runtimeConfig.format });
  },
});
