import { defineCommand } from '@bunli/core';

import { TradeApi } from '../../lib/api/trade';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';
import { recordToRows } from '../market/helpers';

export const tradeBalanceCommand = defineCommand({
  name: 'balance',
  description: 'Get spot trading account balance for all assets with fees',
  handler: async () => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new TradeApi(client);

    const response = await api.tradeBalance();

    if (runtimeConfig.dryRun) {
      return;
    }

    const data = runtimeConfig.format === 'table' ? recordToRows(response, 'asset') : response;
    formatOutput(data, { format: runtimeConfig.format });
  },
});
