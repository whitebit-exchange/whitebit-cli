import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { AccountApi } from '../../lib/api/account';
import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { globalOptions } from '../../lib/global-options';
import { HttpClient } from '../../lib/http';

export const accountCreateCodeCommand = defineCommand({
  name: 'create',
  description: 'Create WBe-prefixed voucher (cryptographic code for value transfer)',
  options: {
    ...globalOptions,
    passphrase: option(z.string().min(1).optional(), {
      short: 'p',
      description: 'Optional passphrase protection',
    }),
    description: option(z.string().min(1).optional(), {
      short: 'd',
      description: 'Optional description',
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
      'ASSET',
      'whitebit codes create <asset> <amount>',
    );
    const amount = parseArg(
      positional[1],
      z.string().min(1),
      'AMOUNT',
      'whitebit codes create <asset> <amount>',
    );

    const response = await api.createCode({
      ticker,
      amount,
      passphrase: flags.passphrase,
      description: flags.description,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
