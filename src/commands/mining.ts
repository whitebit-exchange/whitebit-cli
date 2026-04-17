import { defineCommand, defineGroup, option } from '@bunli/core';
import { z } from 'zod';

import { createClient } from '../lib/client';
import { loadConfig } from '../lib/config';
import { formatOutput } from '../lib/formatter';

const rewardsCommand = defineCommand({
  name: 'rewards',
  description: 'Get mining reward history',
  options: {
    limit: option(z.coerce.number().optional(), { description: 'Number of records' }),
    offset: option(z.coerce.number().optional(), { description: 'Pagination offset' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.miningPool.getMiningRewards({
      ...(flags.limit !== undefined && { limit: flags.limit }),
      ...(flags.offset !== undefined && { offset: flags.offset }),
    });
    formatOutput(res, format);
  },
});

const hashrateCommand = defineCommand({
  name: 'hashrate',
  description: 'Get mining hashrate history',
  options: {
    account: option(z.string(), { description: 'Mining account name' }),
    from: option(z.coerce.number().optional(), { description: 'Start timestamp (Unix)' }),
    to: option(z.coerce.number().optional(), { description: 'End timestamp (Unix)' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.miningPool.getMiningHashrate({
      account: flags.account,
      ...(flags.from !== undefined && { from: flags.from }),
      ...(flags.to !== undefined && { to: flags.to }),
    });
    formatOutput(res, format);
  },
});

const minerInfoCommand = defineCommand({
  name: 'miner-info',
  description: 'Get mining miner info',
  options: {
    account: option(z.string(), { description: 'Mining account name' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.miningPool.getMiningMinerInfo({ account: flags.account });
    formatOutput(res, format);
  },
});

const workerNamesCommand = defineCommand({
  name: 'worker-names',
  description: 'Get mining worker names',
  options: {
    account: option(z.string(), { description: 'Mining account name' }),
    limit: option(z.coerce.number().optional(), { description: 'Number of records' }),
    offset: option(z.coerce.number().optional(), { description: 'Pagination offset' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.miningPool.getMiningWorkerNames({
      account: flags.account,
      ...(flags.limit !== undefined && { limit: flags.limit }),
      ...(flags.offset !== undefined && { offset: flags.offset }),
    });
    formatOutput(res, format);
  },
});

const workerHashrateCommand = defineCommand({
  name: 'worker-hashrate',
  description: 'Get hashrate for a specific mining worker',
  options: {
    account: option(z.string(), { description: 'Mining account name' }),
    worker: option(z.string(), { description: 'Worker name' }),
    from: option(z.coerce.number().optional(), { description: 'Start timestamp (Unix)' }),
    to: option(z.coerce.number().optional(), { description: 'End timestamp (Unix)' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.miningPool.getMiningWorkerHashrate({
      account: flags.account,
      worker: flags.worker,
      ...(flags.from !== undefined && { from: flags.from }),
      ...(flags.to !== undefined && { to: flags.to }),
    });
    formatOutput(res, format);
  },
});

const payoutDestinationCommand = defineCommand({
  name: 'payout-destination',
  description: 'Get mining payout destination',
  options: {
    account: option(z.string(), { description: 'Mining account name' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.miningPool.getMiningPayoutDestination({ accountName: flags.account });
    formatOutput(res, format);
  },
});

export const miningGroup = defineGroup({
  name: 'mining',
  description: 'Mining pool commands',
  commands: [
    rewardsCommand,
    hashrateCommand,
    minerInfoCommand,
    workerNamesCommand,
    workerHashrateCommand,
    payoutDestinationCommand,
  ],
});
