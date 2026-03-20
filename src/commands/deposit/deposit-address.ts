import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { AccountApi } from '../../lib/api/account';
import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { globalOptions } from '../../lib/global-options';
import { HttpClient } from '../../lib/http';

export const accountDepositAddressCommand = defineCommand({
  name: 'address',
  description: 'Get cryptocurrency deposit address for specified network',
  options: {
    ...globalOptions,
    network: option(z.string().min(1).optional(), {
      short: 'n',
      description: 'Network identifier (e.g., ERC20)',
    }),
  },
  handler: async ({ positional, flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new AccountApi(client);

    const ticker = parseArg(
      positional[0],
      z.string().min(1),
      'TICKER',
      'whitebit deposit address <ticker> [network]',
    );
    const network = flags.network;

    const response = await api.cryptoDepositAddress({
      ticker,
      network,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
