import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { AccountApi } from '../../lib/api/account';
import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const accountApplyCodeCommand = defineCommand({
  name: 'apply',
  description: 'Apply a voucher code',
  options: {
    passphrase: option(z.string().min(1).optional(), {
      short: 'p',
      description: 'Passphrase if required',
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

    const code = parseArg(positional[0], z.string().min(1), 'CODE', 'whitebit codes apply <code>');

    const response = await api.applyCode({
      code,
      passphrase: flags.passphrase,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
