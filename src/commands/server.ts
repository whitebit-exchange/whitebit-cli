import { defineCommand, defineGroup } from '@bunli/core';

import { createPublicClient } from '../lib/client';
import { loadConfig } from '../lib/config';
import { formatOutput } from '../lib/formatter';

const pingCommand = defineCommand({
  name: 'ping',
  description: 'Check server connectivity (status)',
  handler: async () => {
    const { format } = loadConfig();
    const client = createPublicClient();
    const res = await client.publicApiV4.serverStatus();
    formatOutput(res, format);
  },
});

const timeCommand = defineCommand({
  name: 'time',
  description: 'Get current WhiteBit server time',
  handler: async () => {
    const { format } = loadConfig();
    const client = createPublicClient();
    const res = await client.publicApiV4.serverTime();
    formatOutput(res, format);
  },
});

const maintenanceCommand = defineCommand({
  name: 'maintenance',
  description: 'Get WhiteBit platform maintenance status',
  handler: async () => {
    const { format } = loadConfig();
    const client = createPublicClient();
    const res = await client.publicApiV4.maintenanceStatus();
    formatOutput(res, format);
  },
});

export const serverGroup = defineGroup({
  name: 'server',
  description: 'Server status and connectivity',
  commands: [pingCommand, timeCommand, maintenanceCommand],
});
