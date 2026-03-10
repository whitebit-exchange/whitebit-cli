import { defineCommand } from '@bunli/core';
import { z } from 'zod';

import { AccountApi } from '../../lib/api/account';
import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';
import { recordToRows } from '../market/helpers';

export const accountMainBalanceCommand = defineCommand({
  name: 'main',
  description: 'Get main account balance across all sub-accounts',
  handler: async ({ positional }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new AccountApi(client);

    const ticker = positional[0]
      ? parseArg(positional[0], z.string().min(1), 'ASSET', 'whitebit balance main [asset]')
      : undefined;
    const response = await api.mainBalance(ticker ? { ticker } : undefined);

    if (runtimeConfig.dryRun) {
      return;
    }

    let data: unknown = response;
    if (runtimeConfig.format === 'table') {
      if (ticker && typeof response === 'object' && response !== null && !Array.isArray(response)) {
        // Single-asset response is flat: { main_balance }
        // Wrap it to match multi-asset table structure: { TICKER: { main_balance } }
        data = recordToRows({ [ticker.toUpperCase()]: response }, 'asset');
      } else {
        data = recordToRows(response, 'asset');
      }
    }
    formatOutput(data, { format: runtimeConfig.format });
  },
});
