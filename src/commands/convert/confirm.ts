import { defineCommand } from '@bunli/core';
import { z } from 'zod';

import { ConvertApi } from '../../lib/api/convert';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { globalOptions } from '../../lib/global-options';
import { HttpClient } from '../../lib/http';

export const convertConfirmCommand = defineCommand({
  name: 'confirm',
  description: 'Execute conversion using a previously estimated quote ID',
  options: {
    ...globalOptions,
  },
  handler: async ({ positional, flags }) => {
    const runtimeConfig = loadConfig({
      profile: flags.profile,
      apiUrl: flags.apiUrl,
      format: flags.json ? 'json' : flags.format,
      verbose: flags.verbose,
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

    const estimateIdRaw = positional[0];
    if (!estimateIdRaw) {
      throw new Error(
        'Missing required argument: ESTIMATE_ID\n\nUsage: whitebit trade convert confirm <estimate_id>',
      );
    }
    const estimateId = z.string().min(1).parse(estimateIdRaw);

    const result = await api.confirm({
      estimateId,
    });

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(result, { format: runtimeConfig.format });
  },
});
