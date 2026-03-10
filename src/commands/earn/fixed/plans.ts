import { defineCommand } from '@bunli/core';

import { AccountApi } from '../../../lib/api/account';
import { loadAuthConfig, loadConfig } from '../../../lib/config';
import { formatOutput, unwrapTableData } from '../../../lib/formatter';
import { HttpClient } from '../../../lib/http';

export const accountPlansCommand = defineCommand({
  name: 'plans',
  description: 'List fixed-term staking plans with guaranteed APR rates and lock periods',
  handler: async () => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new AccountApi(client);

    const response = await api.plans();

    if (runtimeConfig.dryRun) {
      return;
    }

    const data = runtimeConfig.format === 'table' ? unwrapTableData(response) : response;
    formatOutput(data, { format: runtimeConfig.format });
  },
});
