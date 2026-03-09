import { defineCommand } from '@bunli/core';
import { z } from 'zod';

import { TradeApi } from '../../lib/api/trade';
import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const tradeKillSwitchSyncCommand = defineCommand({
  name: 'kill-switch-sync',
  description: 'Sync kill switch timer',
  handler: async ({ positional }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new TradeApi(client);

    const market = parseArg(
      positional[0],
      z.string().min(1),
      'PAIR',
      'whitebit trade spot kill-switch-sync <pair> <timeout>',
    );
    const timeout = parseArg(
      positional[1],
      z.coerce.number().int().positive(),
      'TIMEOUT',
      'whitebit trade spot kill-switch-sync <pair> <timeout>',
    );

    const response = await api.killSwitchSync({
      market,
      timeout,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(response, { format: runtimeConfig.format });
  },
});
