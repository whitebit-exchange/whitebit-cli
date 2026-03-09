import { defineCommand } from '@bunli/core';
import { z } from 'zod';

import { ConvertApi } from '../../lib/api/convert';
import { parseArg } from '../../lib/cli-helpers';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

export const convertEstimateCommand = defineCommand({
  name: 'estimate',
  description: 'Estimate conversion rate and amount',
  handler: async ({ positional }) => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();
    const httpClient = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new ConvertApi(httpClient);

    const from = parseArg(
      positional[0],
      z.string().min(1),
      'FROM',
      'whitebit trade convert estimate <from> <to> <amount>',
    );

    const to = parseArg(
      positional[1],
      z.string().min(1),
      'TO',
      'whitebit trade convert estimate <from> <to> <amount>',
    );

    const amount = parseArg(
      positional[2],
      z.string().min(1),
      'AMOUNT',
      'whitebit trade convert estimate <from> <to> <amount>',
    );

    const result = await api.estimate({
      from,
      to,
      amount,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(result, { format: runtimeConfig.format });
  },
});
