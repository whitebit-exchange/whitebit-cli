import { defineCommand, defineGroup, option } from '@bunli/core';
import { z } from 'zod';

import { authFields, createClient, createPublicClient } from '../lib/client';
import { loadConfig } from '../lib/config';
import { formatOutput } from '../lib/formatter';

// ==================== Fixed ====================

const fixedPlansCommand = defineCommand({
  name: 'fixed-plans',
  description: 'Get available fixed lending plans',
  options: {
    ticker: option(z.string().optional(), { description: 'Filter by ticker, e.g. USDT' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.cryptoLendingFixed.getFixedPlans({
      ...(flags.ticker && { ticker: flags.ticker }),
      ...authFields(),
    });
    formatOutput(res, format);
  },
});

const createFixedCommand = defineCommand({
  name: 'fixed-invest',
  description: 'Create a fixed lending investment',
  options: {
    'plan-id': option(z.string(), { description: 'Fixed plan ID' }),
    amount: option(z.string(), { description: 'Amount to invest' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.cryptoLendingFixed.createFixedInvestment({
      planId: flags['plan-id'],
      amount: flags.amount,
      ...authFields(),
    });
    formatOutput(res, format);
  },
});

const closeFixedCommand = defineCommand({
  name: 'fixed-close',
  description: 'Close a fixed lending investment early',
  options: {
    id: option(z.string(), { description: 'Fixed investment ID' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.cryptoLendingFixed.closeFixedInvestment({
      id: flags.id,
      ...authFields(),
    });
    formatOutput(res, format);
  },
});

const fixedHistoryCommand = defineCommand({
  name: 'fixed-history',
  description: 'Get fixed lending investment history',
  options: {
    ticker: option(z.string().optional(), { description: 'Filter by ticker' }),
    limit: option(z.coerce.number().optional(), { description: 'Number of records' }),
    offset: option(z.coerce.number().optional(), { description: 'Pagination offset' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.cryptoLendingFixed.getFixedInvestmentsHistory({
      ...(flags.ticker && { ticker: flags.ticker }),
      ...(flags.limit !== undefined && { limit: flags.limit }),
      ...(flags.offset !== undefined && { offset: flags.offset }),
      ...authFields(),
    });
    formatOutput(res, format);
  },
});

const fixedInterestHistoryCommand = defineCommand({
  name: 'fixed-interest-history',
  description: 'Get interest payment history for fixed investments',
  options: {
    ticker: option(z.string().optional(), { description: 'Filter by ticker' }),
    limit: option(z.coerce.number().optional(), { description: 'Number of records' }),
    offset: option(z.coerce.number().optional(), { description: 'Pagination offset' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.cryptoLendingFixed.getInterestPaymentHistory({
      ...(flags.ticker && { ticker: flags.ticker }),
      ...(flags.limit !== undefined && { limit: flags.limit }),
      ...(flags.offset !== undefined && { offset: flags.offset }),
      ...authFields(),
    });
    formatOutput(res, format);
  },
});

// ==================== Flex ====================

const flexPlansCommand = defineCommand({
  name: 'flex-plans',
  description: 'Get available flexible lending plans',
  options: {
    ticker: option(z.string().optional(), { description: 'Filter by ticker, e.g. USDT' }),
    limit: option(z.coerce.number().optional(), { description: 'Number of records' }),
    offset: option(z.coerce.number().optional(), { description: 'Pagination offset' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.cryptoLendingFlex.getFlexPlans({
      ...(flags.ticker && { ticker: flags.ticker }),
      ...(flags.limit !== undefined && { limit: flags.limit }),
      ...(flags.offset !== undefined && { offset: flags.offset }),
      ...authFields(),
    });
    formatOutput(res, format);
  },
});

const createFlexCommand = defineCommand({
  name: 'flex-invest',
  description: 'Create a flexible lending investment',
  options: {
    plan: option(z.string(), { description: 'Flex plan ID' }),
    amount: option(z.string(), { description: 'Amount to invest' }),
    'with-reinvest': option(z.boolean().optional(), { description: 'Enable auto-reinvest' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.cryptoLendingFlex.createFlexInvestment({
      plan: flags.plan,
      amount: flags.amount,
      ...(flags['with-reinvest'] !== undefined && { withReinvest: flags['with-reinvest'] }),
      ...authFields(),
    });
    formatOutput(res, format);
  },
});

const withdrawFlexCommand = defineCommand({
  name: 'flex-withdraw',
  description: 'Withdraw from a flexible lending investment',
  options: {
    plan: option(z.string(), { description: 'Flex plan ID' }),
    amount: option(z.string(), { description: 'Amount to withdraw' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.cryptoLendingFlex.withdrawFromFlexInvestment({
      plan: flags.plan,
      amount: flags.amount,
      ...authFields(),
    });
    formatOutput(res, format);
  },
});

const closeFlexCommand = defineCommand({
  name: 'flex-close',
  description: 'Close a flexible lending investment',
  options: {
    plan: option(z.string(), { description: 'Flex plan ID' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.cryptoLendingFlex.closeFlexInvestment({
      plan: flags.plan,
      ...authFields(),
    });
    formatOutput(res, format);
  },
});

const flexInvestmentsCommand = defineCommand({
  name: 'flex-list',
  description: 'Get list of flexible lending investments',
  options: {
    ticker: option(z.string().optional(), { description: 'Filter by ticker' }),
    limit: option(z.coerce.number().optional(), { description: 'Number of records' }),
    offset: option(z.coerce.number().optional(), { description: 'Pagination offset' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.cryptoLendingFlex.getUserFlexInvestments({
      ...(flags.ticker && { ticker: flags.ticker }),
      ...(flags.limit !== undefined && { limit: flags.limit }),
      ...(flags.offset !== undefined && { offset: flags.offset }),
      ...authFields(),
    });
    formatOutput(res, format);
  },
});

const flexAutoReinvestCommand = defineCommand({
  name: 'flex-auto-reinvest',
  description: 'Enable or disable auto-reinvest for a flexible investment',
  options: {
    plan: option(z.string(), { description: 'Flex plan ID' }),
    enable: option(z.boolean(), { description: 'true to enable, false to disable' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.cryptoLendingFlex.updateFlexAutoReinvestment({
      plan: flags.plan,
      enabled: flags.enable,
      ...authFields(),
    });
    formatOutput(res, format);
  },
});

export const lendingGroup = defineGroup({
  name: 'lending',
  description: 'Fixed and flexible lending (earn) commands',
  commands: [
    fixedPlansCommand,
    createFixedCommand,
    closeFixedCommand,
    fixedHistoryCommand,
    fixedInterestHistoryCommand,
    flexPlansCommand,
    createFlexCommand,
    withdrawFlexCommand,
    closeFlexCommand,
    flexInvestmentsCommand,
    flexAutoReinvestCommand,
  ],
});
