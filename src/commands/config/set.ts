import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import {
  getGlobalConfigOverrides,
  loadConfig,
  maskSecret,
  saveConfigProfile,
} from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { runLogin } from '../login';

export const configSetCommand = defineCommand({
  name: 'set',
  description: 'Store API credentials in ~/.whitebit/config.toml',
  options: {
    'api-key': option(z.string().min(1).optional(), {
      description: 'WhiteBIT API key',
    }),
    'api-secret': option(z.string().min(1).optional(), {
      description: 'WhiteBIT API secret',
    }),
    profile: option(z.string().min(1).optional(), {
      description: 'Config profile name',
    }),
  },
  handler: async ({ flags }) => {
    const overrides = getGlobalConfigOverrides();
    const apiKey = flags['api-key'] ?? overrides.apiKey;
    const apiSecret = flags['api-secret'] ?? overrides.apiSecret;

    if (!apiKey && !apiSecret) {
      await runLogin({
        profile: flags.profile,
        'api-key': flags['api-key'],
        'api-secret': flags['api-secret'],
        'api-url': overrides.apiUrl,
      });
      return;
    }

    if (!apiKey || !apiSecret) {
      throw new Error('config set requires --api-key and --api-secret');
    }

    const profile = flags.profile ?? overrides.profile;
    const runtimeConfig = loadConfig({ profile, apiKey, apiSecret });

    if (runtimeConfig.dryRun) {
      formatOutput(
        {
          updated: false,
          dry_run: true,
          profile: runtimeConfig.profile,
          api_key: maskSecret(apiKey),
          api_secret: maskSecret(apiSecret),
        },
        { format: runtimeConfig.format },
      );
      return;
    }

    const configPath = await saveConfigProfile({
      profile,
      apiKey,
      apiSecret,
    });
    formatOutput(
      {
        updated: true,
        profile: runtimeConfig.profile,
        config_path: configPath,
        api_key: maskSecret(apiKey),
        api_secret: maskSecret(apiSecret),
      },
      { format: runtimeConfig.format },
    );
  },
});
