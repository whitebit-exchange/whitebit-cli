import { defineCommand } from '@bunli/core';

import { MarketApi } from '../../lib/api/market';
import { loadConfig, loadPublicConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { recordToRows, unwrapWhitebitPayload } from './helpers';

export const assetStatusCommand = defineCommand({
  name: 'asset-status',
  description: 'Get deposit and withdrawal availability status for each asset',
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

    const payload = unwrapWhitebitPayload<Record<string, unknown>>(response.data);
    formatOutput(recordToRows(payload, 'asset'), { format: runtimeConfig.format });
  },
});
