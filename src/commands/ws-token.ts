import { defineCommand } from '@bunli/core';

import { AccountApi } from '../lib/api/account';
import { loadAuthConfig, loadConfig } from '../lib/config';
import { formatOutput } from '../lib/formatter';
import { HttpClient } from '../lib/http';

export const accountWsTokenCommand = defineCommand({
  name: 'ws-token',
  description: 'Get WebSocket profile token',
  handler: async () => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new AccountApi(client);

    const response = await api.websocketProfileToken();

    if (runtimeConfig.dryRun) {
      return;
    }

    const data =
      runtimeConfig.format === 'table' && typeof response === 'string'
        ? JSON.parse(response)
        : response;
    formatOutput(data, { format: runtimeConfig.format });
  },
});
