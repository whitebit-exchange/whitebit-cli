import { defineCommand } from '@bunli/core';
import { z } from 'zod';

import { AccountApi } from '../../lib/api/account';
import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { globalOptions } from '../../lib/global-options';
import { HttpClient } from '../../lib/http';

export const accountTransferCommand = defineCommand({
  name: 'internal',
  description: 'Transfer funds between your own accounts (main, spot, collateral)',
  options: {
    ...globalOptions,
  },
  handler: async ({ positional }) => {
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
      'whitebit transfer internal <asset> <amount> <from> <to>',
    );
    const amount = parseArg(
      positional[1],
      z.string().min(1),
      'AMOUNT',
      'whitebit transfer internal <asset> <amount> <from> <to>',
    );
    const from = parseArg(
      positional[2],
      z.string().min(1),
      'FROM',
      'whitebit transfer internal <asset> <amount> <from> <to>',
    );
    const to = parseArg(
      positional[3],
      z.string().min(1),
      'TO',
      'whitebit transfer internal <asset> <amount> <from> <to>',
    );

    const response = await api.transfer({
      ticker,
      amount,
      from,
      to,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
