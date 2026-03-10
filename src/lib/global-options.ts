import { option } from '@bunli/core';
import { z } from 'zod';

export const globalOptions = {
  json: option(z.boolean().optional(), { description: 'Output as JSON' }),
  verbose: option(z.boolean().optional(), {
    description: 'Verbose output (show raw API responses)',
    short: 'V',
  }),
  noRetry: option(z.boolean().optional(), {
    description: 'Disable automatic retry on transient errors',
  }),
  dryRun: option(z.boolean().optional(), {
    description: 'Show what would be sent without executing',
  }),
  format: option(z.enum(['json', 'table']).optional(), {
    description: 'Output format (json or table)',
  }),
  profile: option(z.string().min(1).optional(), { description: 'Config profile name' }),
  apiKey: option(z.string().min(1).optional(), { description: 'Override API key' }),
  apiSecret: option(z.string().min(1).optional(), { description: 'Override API secret' }),
  apiUrl: option(z.string().url().optional(), { description: 'Override API URL' }),
};

export type GlobalFlags = {
  json?: boolean;
  verbose?: boolean;
  noRetry?: boolean;
  dryRun?: boolean;
  format?: 'json' | 'table';
  profile?: string;
  apiKey?: string;
  apiSecret?: string;
  apiUrl?: string;
};
