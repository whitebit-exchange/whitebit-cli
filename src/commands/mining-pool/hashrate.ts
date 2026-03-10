import { defineCommand } from '@bunli/core';

import { AccountApi } from '../../lib/api/account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { globalOptions } from '../../lib/global-options';
import { HttpClient } from '../../lib/http';

export const miningPoolHashrateCommand = defineCommand({
  name: 'hashrate',
  description: 'Get mining hashrate information',
  options: {
    ...globalOptions,
  },
  handler: async ({ flags }) => {
    const runtimeConfig = loadConfig({
      profile: flags.profile,
      apiUrl: flags.apiUrl,
      format: flags.json ? 'json' : flags.format,
      verbose: flags.verbose,
      retry: flags.noRetry === true ? false : undefined,
      dryRun: flags.dryRun,
    });
    const config = loadAuthConfig({
      profile: flags.profile,
      apiKey: flags.apiKey,
      apiSecret: flags.apiSecret,
      apiUrl: flags.apiUrl,
    });

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new AccountApi(client);

    const response = await api.miningHashrate();

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
