import { defineCommand } from '@bunli/core';
import { z } from 'zod';
import { AccountApi } from '../../../lib/api/account';
import { parseArg } from '../../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../../lib/config';
import { formatOutput } from '../../../lib/formatter';
import { globalOptions } from '../../../lib/global-options';
import { HttpClient } from '../../../lib/http';

export const accountFlexAutoReinvestCommand = defineCommand({
  name: 'auto-reinvest',
  description: 'Enable/disable automatic reinvestment of earned rewards in flexible staking',
  options: {
    ...globalOptions,
  },
  handler: async ({ positional }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const id = parseArg(
      positional[0],
      z.coerce.number().int().positive(),
      'ID',
      'whitebit earn flex auto-reinvest <id> <enabled>',
    );
    const enabled = parseArg(
      positional[1],
      z.enum(['true', 'false']).transform((v) => v === 'true'),
      'ENABLED',
      'whitebit earn flex auto-reinvest <id> <enabled>',
    );

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new AccountApi(client);

    const response = await api.flexAutoReinvest({
      id,
      enabled,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
