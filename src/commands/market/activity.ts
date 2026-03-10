import { defineCommand } from '@bunli/core';

import { MarketApi } from '../../lib/api/market';
import { loadConfig, loadPublicConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { recordToRows, unwrapWhitebitPayload } from './helpers';

export const activityCommand = defineCommand({
  name: 'activity',
  description: 'Get 24-hour trading activity metrics (price, volume, changes) per pair',
  handler: async () => {
    const runtimeConfig = loadConfig();
    const config = loadPublicConfig();
    const api = new MarketApi({ apiUrl: config.apiUrl });
    const response = await api.marketActivity();

    if (runtimeConfig.dryRun) {
      return;
    }

    if (!response.success) {
      throw new Error(response.error?.message ?? 'Failed to fetch market activity');
    }

    const payload = unwrapWhitebitPayload<Record<string, unknown>>(response.data);
    formatOutput(recordToRows(payload, 'market'), { format: runtimeConfig.format });
  },
});
