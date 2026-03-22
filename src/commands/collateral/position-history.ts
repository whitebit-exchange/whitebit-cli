import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput, unwrapTableData } from '../../lib/formatter';
import { authenticatedPost } from '../../lib/http';

export const collateralPositionHistoryCommand = defineCommand({
  name: 'position-history',
  description: 'Get collateral positions history',
  options: {
    market: option(z.string().optional(), {
      short: 'm',
      description: 'Filter by market symbol (optional)',
    }),
    limit: option(z.number().optional(), {
      short: 'l',
      description: 'Limit number of results (optional)',
    }),
    offset: option(z.number().optional(), {
      short: 'o',
      description: 'Offset for pagination (optional)',
    }),
  },
  handler: async ({ flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();
    const body = {
      ...(flags.market && { market: flags.market }),
      ...(flags.limit !== undefined && { limit: flags.limit }),
      ...(flags.offset !== undefined && { offset: flags.offset }),
    };
    const response = await authenticatedPost(
      '/api/v4/collateral-account/positions/history',
      body,
      config,
    );
    if (runtimeConfig.dryRun) {
      return;
    }

    const data = runtimeConfig.format === 'table' ? unwrapTableData(response) : response;
    formatOutput(data, { format: runtimeConfig.format });
  },
});
