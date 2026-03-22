import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import { getGlobalConfigOverrides, loadConfig, maskSecret } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';

export const configShowCommand = defineCommand({
  name: 'show',
  description: 'Show resolved config values with value sources',
  options: {
    profile: option(z.string().min(1).optional(), {
      description: 'Config profile name',
    }),
  },
  handler: async ({ flags }) => {
    const profile = flags.profile ?? getGlobalConfigOverrides().profile;
    const config = loadConfig({ profile });

    if (config.format === 'table') {
      formatOutput(
        [
          { key: 'profile', value: config.profile, source: 'cli/default' },
          { key: 'api_key', value: maskSecret(config.apiKey), source: config.sources.apiKey },
          {
            key: 'api_secret',
            value: maskSecret(config.apiSecret),
            source: config.sources.apiSecret,
          },
          { key: 'api_url', value: config.apiUrl, source: config.sources.apiUrl },
          { key: 'format', value: config.format, source: config.sources.format },
        ],
        { format: 'table' },
      );
      return;
    }

    formatOutput(
      {
        profile: config.profile,
        api_key: {
          value: maskSecret(config.apiKey),
          source: config.sources.apiKey,
        },
        api_secret: {
          value: maskSecret(config.apiSecret),
          source: config.sources.apiSecret,
        },
        api_url: {
          value: config.apiUrl,
          source: config.sources.apiUrl,
        },
        format: {
          value: config.format,
          source: config.sources.format,
        },
      },
      { format: 'json' },
    );
  },
});
