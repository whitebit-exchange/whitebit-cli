import { defineCommand } from '@bunli/core';

import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { authenticatedPost } from '../../lib/http';
import { recordToRows } from '../market/helpers';

export const accountBalanceCommand = defineCommand({
  name: 'trade',
  description: 'Get spot trading balance (available for trading)',
  handler: async ({ positional }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();
    const ticker = positional[0];
    const body = ticker ? { ticker } : {};
    const response = await authenticatedPost('/api/v4/trade-account/balance', body, config);
    if (runtimeConfig.dryRun) {
      return;
    }

    let data: unknown = response;
    if (runtimeConfig.format === 'table') {
      if (ticker && typeof response === 'object' && response !== null && !Array.isArray(response)) {
        // Single-asset response is flat: { available, freeze }
        // Wrap it to match multi-asset table structure: { TICKER: { available, freeze } }
        data = recordToRows({ [ticker.toUpperCase()]: response }, 'asset');
      } else {
        data = recordToRows(response, 'asset');
      }
    }
    formatOutput(data, { format: runtimeConfig.format });
  },
});
