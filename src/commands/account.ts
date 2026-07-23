import { defineCommand, defineGroup, option } from '@bunli/core';
import { z } from 'zod';

import { createClient, withAuth } from '../lib/client';
import { loadConfig } from '../lib/config';
import { formatOutput } from '../lib/formatter';

// ==================== Main Account ====================

const mainBalanceCommand = defineCommand({
  name: 'main-balance',
  description: 'Get main account balance',
  options: {
    ticker: option(z.string().optional(), { description: 'Filter by ticker, e.g. BTC' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.mainAccount.getMainBalance(
      withAuth({
        ...(flags.ticker && { ticker: flags.ticker }),
      }),
    );
    formatOutput(res, format);
  },
});

const depositWithdrawHistoryCommand = defineCommand({
  name: 'history',
  description: 'Get deposit/withdraw history for main account',
  options: {
    method: option(z.coerce.number().optional(), { description: '1=deposit, 2=withdrawal' }),
    ticker: option(z.string().optional(), { description: 'Filter by ticker' }),
    limit: option(z.coerce.number().optional(), { description: 'Number of records' }),
    offset: option(z.coerce.number().optional(), { description: 'Pagination offset' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.mainAccount.getDepositWithdrawHistory(
      withAuth({
        ...(flags.method !== undefined && { transactionMethod: flags.method }),
        ...(flags.ticker && { ticker: flags.ticker }),
        ...(flags.limit !== undefined && { limit: flags.limit }),
        ...(flags.offset !== undefined && { offset: flags.offset }),
      }),
    );
    formatOutput(res, format);
  },
});

// ==================== Transfer ====================

const transferCommand = defineCommand({
  name: 'transfer',
  description: 'Transfer funds between account types (main/spot/collateral)',
  options: {
    from: option(z.enum(['main', 'spot', 'collateral']), { description: 'Source account' }),
    to: option(z.enum(['main', 'spot', 'collateral']), { description: 'Destination account' }),
    ticker: option(z.string(), { description: 'Asset ticker, e.g. USDT' }),
    amount: option(z.string(), { description: 'Amount to transfer' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    await client.transfer.betweenBalances(
      withAuth({
        from: flags.from,
        to: flags.to,
        ticker: flags.ticker,
        amount: flags.amount,
      }),
    );
    formatOutput({ success: true }, format);
  },
});

// ==================== Deposit ====================

const depositAddressCommand = defineCommand({
  name: 'deposit-address',
  description: 'Get deposit address for an asset',
  options: {
    ticker: option(z.string(), { description: 'Asset ticker, e.g. BTC' }),
    network: option(z.string().optional(), { description: 'Network, e.g. BTC, TRC20, ERC20' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.deposit.getDepositAddress(
      withAuth({
        ticker: flags.ticker,
        ...(flags.network && { network: flags.network }),
      }),
    );
    formatOutput(res, format);
  },
});

const createAddressCommand = defineCommand({
  name: 'create-address',
  description: 'Generate a new deposit address for an asset',
  options: {
    ticker: option(z.string(), { description: 'Asset ticker, e.g. BTC' }),
    network: option(z.string().optional(), { description: 'Network, e.g. BTC, TRC20, ERC20' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.deposit.createNewAddress(
      withAuth({
        ticker: flags.ticker,
        ...(flags.network && { network: flags.network }),
      }),
    );
    formatOutput(res, format);
  },
});

// ==================== Withdraw ====================

const withdrawCommand = defineCommand({
  name: 'withdraw',
  description: 'Withdraw crypto to an external address',
  options: {
    ticker: option(z.string(), { description: 'Asset ticker, e.g. USDT' }),
    amount: option(z.string(), { description: 'Amount to withdraw' }),
    address: option(z.string(), { description: 'Destination address' }),
    'unique-id': option(z.string(), { description: 'Unique idempotency ID' }),
    network: option(z.string().optional(), { description: 'Network, e.g. TRC20, ERC20' }),
    memo: option(z.string().optional(), { description: 'Memo/tag (for XRP, EOS, etc.)' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.withdraw.createWithdraw(
      withAuth({
        ticker: flags.ticker,
        amount: flags.amount,
        address: flags.address,
        uniqueId: flags['unique-id'],
        ...(flags.network && { network: flags.network }),
        ...(flags.memo && { memo: flags.memo }),
      }),
    );
    formatOutput(res, format);
  },
});

// ==================== Fees ====================

const feesCommand = defineCommand({
  name: 'fees',
  description: 'Get personal trading fee rates',
  handler: async () => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.fees.getFees(withAuth({}));
    formatOutput(res, format);
  },
});

export const accountGroup = defineGroup({
  name: 'account',
  description: 'Account management (balance, history, transfer, withdraw)',
  commands: [
    mainBalanceCommand,
    depositWithdrawHistoryCommand,
    transferCommand,
    depositAddressCommand,
    createAddressCommand,
    withdrawCommand,
    feesCommand,
  ],
});
