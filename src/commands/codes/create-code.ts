import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { AccountApi } from '../../lib/api/account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const accountCreateCodeCommand = defineCommand({
  name: 'create-code',
  description: 'Create a new voucher code',
  options: {
    ticker: option(z.string().min(1), {
      short: 't',
      description: 'Currency ticker (e.g., BTC)',
    }),
    amount: option(z.string().min(1), {
      short: 'a',
      description: 'Amount for the voucher',
    }),
    passphrase: option(z.string().min(1).optional(), {
      short: 'p',
      description: 'Optional passphrase protection',
    }),
    description: option(z.string().min(1).optional(), {
      short: 'd',
      description: 'Optional description',
    }),
  },
  handler: async ({ flags }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new AccountApi(client);

    const response = await api.createCode({
      ticker: flags.ticker,
      amount: flags.amount,
      passphrase: flags.passphrase,
      description: flags.description,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
