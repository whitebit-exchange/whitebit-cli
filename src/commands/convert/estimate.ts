import { defineCommand } from '@bunli/core';
import { z } from 'zod';

import { ConvertApi } from '../../lib/api/convert';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { globalOptions } from '../../lib/global-options';
import { HttpClient } from '../../lib/http';

export const convertEstimateCommand = defineCommand({
  name: 'estimate',
  description: 'Get conversion quote with rate and estimated output amount before commit',
  options: {
    ...globalOptions,
  },
  handler: async ({ positional, flags }) => {
    const runtimeConfig = loadConfig({
      profile: flags.profile,
      apiUrl: flags['api-url'],
      format: flags.json ? 'json' : flags.format,
      verbose: flags.verbose,
      dryRun: flags['dry-run'],
    });
    const config = loadAuthConfig({
      apiUrl: flags['api-url'],
      apiKey: flags['api-key'],
      apiSecret: flags['api-secret'],
      profile: flags.profile,
    });
    const httpClient = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new ConvertApi(httpClient);

    const fromRaw = positional[0];
    if (!fromRaw) {
      throw new Error(
        'Missing required argument: FROM\n\nUsage: whitebit trade convert estimate <from> <to> <amount>',
      );
    }
    const from = z.string().min(1).parse(fromRaw);

    const toRaw = positional[1];
    if (!toRaw) {
      throw new Error(
        'Missing required argument: TO\n\nUsage: whitebit trade convert estimate <from> <to> <amount>',
      );
    }
    const to = z.string().min(1).parse(toRaw);

    const amountRaw = positional[2];
    if (!amountRaw) {
      throw new Error(
        'Missing required argument: AMOUNT\n\nUsage: whitebit trade convert estimate <from> <to> <amount> <from|to>',
      );
    }
    const amount = z.string().min(1).parse(amountRaw);

    const directionRaw = positional[3];
    if (!directionRaw) {
      throw new Error(
        'Missing required argument: DIRECTION\n\nUsage: whitebit trade convert estimate <from> <to> <amount> <from|to>',
      );
    }
    const direction = z.enum(['from', 'to']).parse(directionRaw);

    const result = await api.estimate({
      from,
      to,
      amount,
      direction,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(result, { format: runtimeConfig.format });
  },
});
