import { defineCommand } from '@bunli/core';

import { MarketApi } from '../../lib/api/market';
import { loadConfig, loadPublicConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { globalOptions } from '../../lib/global-options';

export const miningPoolOverviewCommand = defineCommand({
  name: 'overview',
  description: 'Mining pool account summary and current statistics',
  options: {
    ...globalOptions,
  },
  handler: async ({ flags }) => {
    const runtimeConfig = loadConfig({
      profile: flags.profile,
      apiUrl: flags.apiUrl,
      format: flags.json ? 'json' : flags.format,
      verbose: flags.verbose,
      retry: flags.noRetry === true ? false : undefined,
      dryRun: flags.dryRun,
    });
    const config = loadPublicConfig({ apiUrl: flags.apiUrl, profile: flags.profile });
    const api = new MarketApi({ apiUrl: config.apiUrl });
    const response = await api.miningPoolOverview();

    if (runtimeConfig.dryRun) {
      return;
    }

    if (!response.success) {
      throw new Error(response.error?.message ?? 'Failed to fetch mining pool data');
    }

    formatOutput(response.data, { format: runtimeConfig.format });
  },
});
