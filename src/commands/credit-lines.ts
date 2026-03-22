import { defineCommand } from '@bunli/core';

import { AccountApi } from '../lib/api/account';
import { loadAuthConfig, loadConfig } from '../lib/config';
import { formatOutput, unwrapTableData } from '../lib/formatter';
import { HttpClient } from '../lib/http';

export const accountCreditLinesCommand = defineCommand({
  name: 'credit-lines',
  description: 'View active loans with LTV ratios and liquidation thresholds',
  handler: async () => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new AccountApi(client);

    const response = await api.creditLines();

    if (runtimeConfig.dryRun) {
      return;
    }

    const data = runtimeConfig.format === 'table' ? unwrapTableData(response) : response;
    formatOutput(data, { format: runtimeConfig.format });
  },
});
