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
      apiUrl: flags.apiUrl,
      format: flags.json ? 'json' : flags.format,
      verbose: flags.verbose,
      retry: flags.noRetry === true ? false : undefined,
      dryRun: flags.dryRun,
    });
    const config = loadAuthConfig({
      apiUrl: flags.apiUrl,
      apiKey: flags.apiKey,
      apiSecret: flags.apiSecret,
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
        'Missing required argument: AMOUNT\n\nUsage: whitebit trade convert estimate <from> <to> <amount>',
      );
    }
    const amount = z.string().min(1).parse(amountRaw);

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
