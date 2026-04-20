import { defineCommand, defineGroup, option } from '@bunli/core';
import { z } from 'zod';

import { createClient } from '../lib/client';
import { loadConfig } from '../lib/config';
import { formatOutput } from '../lib/formatter';

const listCommand = defineCommand({
  name: 'list',
  description: 'List all sub-accounts',
  options: {
    limit: option(z.coerce.number().optional(), { description: 'Number of records' }),
    offset: option(z.coerce.number().optional(), { description: 'Pagination offset' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.subAccount.listSubAccounts({
      ...(flags.limit !== undefined && { limit: flags.limit }),
      ...(flags.offset !== undefined && { offset: flags.offset }),
    });
    formatOutput(res, format);
  },
});

const createCommand = defineCommand({
  name: 'create',
  description: 'Create a new sub-account',
  options: {
    alias: option(z.string(), { description: 'Sub-account alias/name' }),
    email: option(z.string().optional(), { description: 'Sub-account email' }),
    spot: option(z.boolean().optional(), { description: 'Enable spot trading (default true)' }),
    collateral: option(z.boolean().optional(), {
      description: 'Enable collateral trading (default false)',
    }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.subAccount.createSubAccount({
      alias: flags.alias,
      ...(flags.email && { email: flags.email }),
      permissions: {
        spotEnabled: flags.spot ?? true,
        collateralEnabled: flags.collateral ?? false,
      },
    });
    formatOutput(res, format);
  },
});

const deleteCommand = defineCommand({
  name: 'delete',
  description: 'Delete a sub-account',
  options: {
    id: option(z.string(), { description: 'Sub-account ID to delete' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.subAccount.deleteSubAccount({ id: flags.id });
    formatOutput(res, format);
  },
});

const editCommand = defineCommand({
  name: 'edit',
  description: 'Edit sub-account alias',
  options: {
    id: option(z.string(), { description: 'Sub-account ID' }),
    alias: option(z.string(), { description: 'New alias' }),
    spot: option(z.boolean().optional(), { description: 'Enable spot trading' }),
    collateral: option(z.boolean().optional(), { description: 'Enable collateral trading' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.subAccount.editSubAccount({
      id: flags.id,
      alias: flags.alias,
      permissions: {
        spotEnabled: flags.spot ?? true,
        collateralEnabled: flags.collateral ?? false,
      },
    });
    formatOutput(res, format);
  },
});

const blockCommand = defineCommand({
  name: 'block',
  description: 'Block a sub-account',
  options: {
    id: option(z.string(), { description: 'Sub-account ID' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.subAccount.blockSubAccount({ id: flags.id });
    formatOutput(res, format);
  },
});

const unblockCommand = defineCommand({
  name: 'unblock',
  description: 'Unblock a sub-account',
  options: {
    id: option(z.string(), { description: 'Sub-account ID' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.subAccount.unblockSubAccount({ id: flags.id });
    formatOutput(res, format);
  },
});

const balancesCommand = defineCommand({
  name: 'balances',
  description: 'Get balances for a sub-account',
  options: {
    id: option(z.string(), { description: 'Sub-account ID' }),
    ticker: option(z.string().optional(), { description: 'Filter by ticker' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.subAccount.getSubAccountBalances({
      id: flags.id,
      ...(flags.ticker && { ticker: flags.ticker }),
    });
    formatOutput(res, format);
  },
});

const transferToSubCommand = defineCommand({
  name: 'transfer-to-sub',
  description: 'Transfer funds from master to sub-account',
  options: {
    id: option(z.string(), { description: 'Sub-account ID' }),
    ticker: option(z.string(), { description: 'Asset ticker, e.g. USDT' }),
    amount: option(z.string(), { description: 'Amount to transfer' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.subAccount.transfer({
      id: flags.id,
      direction: 'main_to_sub',
      ticker: flags.ticker,
      amount: flags.amount,
    });
    formatOutput(res, format);
  },
});

const transferToMainCommand = defineCommand({
  name: 'transfer-to-main',
  description: 'Transfer funds from sub-account to master',
  options: {
    id: option(z.string(), { description: 'Sub-account ID' }),
    ticker: option(z.string(), { description: 'Asset ticker, e.g. USDT' }),
    amount: option(z.string(), { description: 'Amount to transfer' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.subAccount.transfer({
      id: flags.id,
      direction: 'sub_to_main',
      ticker: flags.ticker,
      amount: flags.amount,
    });
    formatOutput(res, format);
  },
});

const transferHistoryCommand = defineCommand({
  name: 'transfer-history',
  description: 'Get transfer history for a sub-account',
  options: {
    id: option(z.string(), { description: 'Sub-account ID' }),
    limit: option(z.coerce.number().optional(), { description: 'Number of records' }),
    offset: option(z.coerce.number().optional(), { description: 'Pagination offset' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.subAccount.getSubAccountTransferHistory({
      id: flags.id,
      ...(flags.limit !== undefined && { limit: flags.limit }),
      ...(flags.offset !== undefined && { offset: flags.offset }),
    });
    formatOutput(res, format);
  },
});

export const subAccountGroup = defineGroup({
  name: 'sub-account',
  description: 'Sub-account management',
  commands: [
    listCommand,
    createCommand,
    deleteCommand,
    editCommand,
    blockCommand,
    unblockCommand,
    balancesCommand,
    transferToSubCommand,
    transferToMainCommand,
    transferHistoryCommand,
  ],
});
