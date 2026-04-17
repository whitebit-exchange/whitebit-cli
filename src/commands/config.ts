/**
 * Config management commands
 */
import { defineCommand, defineGroup, option } from '@bunli/core';
import { z } from 'zod';

import { getConfigFilePath, loadConfig, maskSecret, saveConfigProfile } from '../lib/config';
import { formatOutput } from '../lib/formatter';

const setCommand = defineCommand({
  name: 'set',
  description: 'Save API credentials to config file (~/.whitebit/config.toml)',
  options: {
    'api-key': option(z.string(), { description: 'WhiteBit API key' }),
    'api-secret': option(z.string(), { description: 'WhiteBit API secret (token)' }),
    'api-url': option(z.string().optional(), {
      description: 'Custom API URL (default: https://whitebit.com)',
    }),
    profile: option(z.string().optional(), {
      description: 'Config profile name (default: default)',
    }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const path = await saveConfigProfile({
      apiKey: flags['api-key'],
      apiSecret: flags['api-secret'],
      ...(flags['api-url'] && { apiUrl: flags['api-url'] }),
      ...(flags.profile && { profile: flags.profile }),
    });
    formatOutput({ saved: path }, format);
  },
});

const showCommand = defineCommand({
  name: 'show',
  description: 'Show current config (credentials masked)',
  options: {
    profile: option(z.string().optional(), { description: 'Config profile name' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const cfg = loadConfig(flags.profile ? { profile: flags.profile } : {});
    formatOutput(
      {
        profile: cfg.profile,
        api_key: maskSecret(cfg.apiKey),
        api_secret: maskSecret(cfg.apiSecret),
        api_url: cfg.apiUrl,
        format: cfg.format,
        config_file: getConfigFilePath(),
        sources: cfg.sources,
      },
      format,
    );
  },
});

export const configGroup = defineGroup({
  name: 'config',
  description: 'Configuration management',
  commands: [setCommand, showCommand],
});
