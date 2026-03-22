import { option } from '@bunli/core';
import { z } from 'zod';

export const globalOptions = {
  json: option(z.boolean().optional(), { description: 'Output as JSON' }),
  verbose: option(z.boolean().optional(), {
    description: 'Verbose output (show raw API responses)',
    short: 'V',
  }),
  'dry-run': option(z.boolean().optional(), {
    description: 'Show what would be sent without executing',
  }),
  format: option(z.enum(['json', 'table']).optional(), {
    description: 'Output format (json or table)',
  }),
  profile: option(z.string().min(1).optional(), { description: 'Config profile name' }),
  'api-key': option(z.string().min(1).optional(), { description: 'Override API key' }),
  'api-secret': option(z.string().min(1).optional(), { description: 'Override API secret' }),
  'api-url': option(z.string().url().optional(), { description: 'Override API URL' }),
};

export type GlobalFlags = {
  json?: boolean;
  verbose?: boolean;
  'dry-run'?: boolean;
  format?: 'json' | 'table';
  profile?: string;
  'api-key'?: string;
  'api-secret'?: string;
  'api-url'?: string;
};
