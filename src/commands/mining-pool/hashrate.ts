import { defineCommand } from '@bunli/core';

import { AccountApi } from '../../lib/api/account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { globalOptions } from '../../lib/global-options';
import { HttpClient } from '../../lib/http';

export const miningPoolHashrateCommand = defineCommand({
  name: 'hashrate',
  description: 'Mining pool hashrate statistics and performance metrics',
  options: {
    ...globalOptions,
  },
  handler: async ({ positional, flags }) => {
    const runtimeConfig = loadConfig({
      profile: flags.profile,
      apiUrl: flags['api-url'],
      format: flags.json ? 'json' : flags.format,
      verbose: flags.verbose,
      dryRun: flags['dry-run'],
    });
    const config = loadAuthConfig({
      profile: flags.profile,
      apiKey: flags['api-key'],
      apiSecret: flags['api-secret'],
      apiUrl: flags['api-url'],
    });

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new AccountApi(client);

    const account = positional[0];
    if (!account) {
      throw new Error(
        'Missing required argument: ACCOUNT\n\nUsage: whitebit mining-pool hashrate <account>',
      );
    }

    const response = await api.miningHashrate({ account });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
