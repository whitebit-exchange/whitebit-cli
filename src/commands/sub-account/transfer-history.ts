import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { SubAccountApi } from '../../lib/api/sub-account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput, unwrapTableData } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const transferHistoryCommand = defineCommand({
  name: 'transfer-history',
  description: 'View transfer history between accounts and sub-accounts',
  options: {
    limit: option(z.number().int().positive().optional(), {
      short: 'l',
      description: 'Limit number of transfer history records',
    }),
    offset: option(z.number().int().nonnegative().optional(), {
      short: 'o',
      description: 'Offset for pagination of transfer history',
    }),
  },
  handler: async ({ positional, flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();
    const httpClient = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new SubAccountApi(httpClient);

    const id = positional[0];
    if (!id) {
      throw new Error(
        'Missing required argument: SUB_ACCOUNT_ID\n\nUsage: whitebit sub-account transfer-history <sub_account_id>',
      );
    }

    const result = await api.transferHistory({ id, limit: flags.limit, offset: flags.offset });

    if (runtimeConfig.dryRun) {
      return;
    }

    const data = runtimeConfig.format === 'table' ? unwrapTableData(result) : result;
    formatOutput(data, { format: runtimeConfig.format });
  },
});
