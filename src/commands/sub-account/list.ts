import { defineCommand } from '@bunli/core';

import { SubAccountApi } from '../../lib/api/sub-account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput, unwrapTableData } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const listCommand = defineCommand({
  name: 'list',
  description: 'List all sub-accounts for fund isolation and management',
  handler: async () => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();
    const httpClient = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new SubAccountApi(httpClient);
    const result = await api.list();

    if (runtimeConfig.dryRun) {
      return;
    }

    const data = runtimeConfig.format === 'table' ? unwrapTableData(result) : result;
    formatOutput(data, { format: runtimeConfig.format });
  },
});
