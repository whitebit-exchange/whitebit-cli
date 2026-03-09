import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { AccountApi } from '../../lib/api/account';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const accountApplyCodeCommand = defineCommand({
  name: 'apply-code',
  description: 'Apply a voucher code',
  options: {
    code: option(z.string().min(1), {
      short: 'c',
      description: 'Voucher code to redeem',
    }),
    passphrase: option(z.string().min(1).optional(), {
      short: 'p',
      description: 'Passphrase if required',
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

    const response = await api.applyCode({
      code: flags.code,
      passphrase: flags.passphrase,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
