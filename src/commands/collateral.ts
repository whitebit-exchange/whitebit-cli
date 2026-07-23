import { defineCommand, defineGroup, option } from '@bunli/core';
import { z } from 'zod';

import { createClient, withAuth } from '../lib/client';
import { loadConfig } from '../lib/config';
import { formatOutput } from '../lib/formatter';

const balanceCommand = defineCommand({
  name: 'balance',
  description: 'Get collateral account balance',
  options: {
    ticker: option(z.string().optional(), { description: 'Filter by ticker, e.g. BTC' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.collateralTrading.collateralAccountBalance(
      flags.ticker ? { ticker: flags.ticker } : undefined,
    );
    formatOutput(res, format);
  },
});

const balanceSummaryCommand = defineCommand({
  name: 'balance-summary',
  description: 'Get collateral account balance summary breakdown',
  options: {
    ticker: option(z.string().optional(), { description: 'Filter by ticker' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.collateralTrading.collateralAccountBalanceSummary(
      flags.ticker ? { ticker: flags.ticker } : undefined,
    );
    formatOutput(res, format);
  },
});

const summaryCommand = defineCommand({
  name: 'summary',
  description: 'Get collateral account summary (margin, equity, P&L)',
  handler: async () => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.collateralTrading.collateralAccountSummary();
    formatOutput(res, format);
  },
});

const limitOrderCommand = defineCommand({
  name: 'limit-order',
  description: 'Create a limit order on the collateral market',
  options: {
    market: option(z.string(), { description: 'Market pair, e.g. BTC_USDT', short: 'm' }),
    side: option(z.enum(['buy', 'sell']), { description: 'buy or sell' }),
    amount: option(z.string(), { description: 'Order amount' }),
    price: option(z.string(), { description: 'Limit price' }),
    'client-order-id': option(z.string().optional(), { description: 'Optional client order ID' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.collateralTrading.createCollateralLimitOrder(
      withAuth({
        market: flags.market,
        side: flags.side,
        amount: flags.amount,
        price: flags.price,
        ...(flags['client-order-id'] && { clientOrderId: flags['client-order-id'] }),
      }),
    );
    formatOutput(res, format);
  },
});

const marketOrderCommand = defineCommand({
  name: 'market-order',
  description: 'Create a market order on the collateral market',
  options: {
    market: option(z.string(), { description: 'Market pair, e.g. BTC_USDT', short: 'm' }),
    side: option(z.enum(['buy', 'sell']), { description: 'buy or sell' }),
    amount: option(z.string(), { description: 'Order amount' }),
    'client-order-id': option(z.string().optional(), { description: 'Optional client order ID' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.collateralTrading.createCollateralMarketOrder(
      withAuth({
        market: flags.market,
        side: flags.side,
        amount: flags.amount,
        ...(flags['client-order-id'] && { clientOrderId: flags['client-order-id'] }),
      }),
    );
    formatOutput(res, format);
  },
});

const stopLimitCommand = defineCommand({
  name: 'stop-limit',
  description: 'Create a stop-limit order on the collateral market',
  options: {
    market: option(z.string(), { description: 'Market pair, e.g. BTC_USDT', short: 'm' }),
    side: option(z.enum(['buy', 'sell']), { description: 'buy or sell' }),
    amount: option(z.string(), { description: 'Order amount' }),
    price: option(z.string(), { description: 'Limit price' }),
    'activation-price': option(z.string(), { description: 'Activation price' }),
    'client-order-id': option(z.string().optional(), { description: 'Optional client order ID' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.collateralTrading.createCollateralStopLimitOrder(
      withAuth({
        market: flags.market,
        side: flags.side,
        amount: flags.amount,
        price: flags.price,
        activation_price: flags['activation-price'],
        ...(flags['client-order-id'] && { clientOrderId: flags['client-order-id'] }),
      }),
    );
    formatOutput(res, format);
  },
});

const triggerMarketCommand = defineCommand({
  name: 'trigger-market',
  description: 'Create a trigger market order on the collateral market',
  options: {
    market: option(z.string(), { description: 'Market pair, e.g. BTC_USDT', short: 'm' }),
    side: option(z.enum(['buy', 'sell']), { description: 'buy or sell' }),
    amount: option(z.string(), { description: 'Order amount' }),
    'activation-price': option(z.string(), { description: 'Activation price' }),
    'client-order-id': option(z.string().optional(), { description: 'Optional client order ID' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.collateralTrading.createCollateralTriggerMarketOrder(
      withAuth({
        market: flags.market,
        side: flags.side,
        amount: flags.amount,
        activation_price: flags['activation-price'],
        ...(flags['client-order-id'] && { clientOrderId: flags['client-order-id'] }),
      }),
    );
    formatOutput(res, format);
  },
});

const ocoOrderCommand = defineCommand({
  name: 'oco-order',
  description: 'Create an OCO order on the collateral market',
  options: {
    market: option(z.string(), { description: 'Market pair, e.g. BTC_USDT', short: 'm' }),
    side: option(z.enum(['buy', 'sell']), { description: 'buy or sell' }),
    amount: option(z.string(), { description: 'Order amount' }),
    price: option(z.string(), { description: 'Limit price' }),
    'activation-price': option(z.string(), { description: 'Stop activation price' }),
    'stop-limit-price': option(z.string(), { description: 'Stop limit price' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.collateralTrading.createCollateralOcoOrder(
      withAuth({
        market: flags.market,
        side: flags.side,
        amount: flags.amount,
        price: flags.price,
        activation_price: flags['activation-price'],
        stop_limit_price: flags['stop-limit-price'],
      }),
    );
    formatOutput(res, format);
  },
});

const cancelConditionalCommand = defineCommand({
  name: 'cancel-conditional',
  description: 'Cancel a conditional (stop) collateral order',
  options: {
    market: option(z.string(), { description: 'Market pair, e.g. BTC_USDT', short: 'm' }),
    id: option(z.coerce.number(), { description: 'Order ID to cancel' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    await client.collateralTrading.cancelConditionalOrder(
      withAuth({
        market: flags.market,
        id: flags.id,
      }),
    );
    formatOutput({ success: true }, format);
  },
});

const cancelOcoCommand = defineCommand({
  name: 'cancel-oco',
  description: 'Cancel a collateral OCO order',
  options: {
    market: option(z.string(), { description: 'Market pair, e.g. BTC_USDT', short: 'm' }),
    'order-id': option(z.coerce.number(), { description: 'OCO order ID to cancel' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.collateralTrading.cancelOcoOrder(
      withAuth({
        market: flags.market,
        orderId: flags['order-id'],
      }),
    );
    formatOutput(res, format);
  },
});

const openPositionsCommand = defineCommand({
  name: 'positions',
  description: 'Get open collateral positions',
  options: {
    market: option(z.string().optional(), { description: 'Market pair filter' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.collateralTrading.getOpenPositions(
      flags.market ? { market: flags.market } : undefined,
    );
    formatOutput(res, format);
  },
});

const positionsHistoryCommand = defineCommand({
  name: 'positions-history',
  description: 'Get collateral positions history',
  options: {
    market: option(z.string().optional(), { description: 'Market pair filter' }),
    limit: option(z.coerce.number().optional(), { description: 'Number of records' }),
    offset: option(z.coerce.number().optional(), { description: 'Pagination offset' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.collateralTrading.getPositionsHistory({
      ...(flags.market && { market: flags.market }),
      ...(flags.limit !== undefined && { limit: flags.limit }),
      ...(flags.offset !== undefined && { offset: flags.offset }),
    });
    formatOutput(res, format);
  },
});

const fundingHistoryCommand = defineCommand({
  name: 'funding-history',
  description: 'Get funding fee history for a collateral market',
  options: {
    market: option(z.string().optional(), { description: 'Market pair filter' }),
    limit: option(z.coerce.number().optional(), { description: 'Number of records' }),
    offset: option(z.coerce.number().optional(), { description: 'Pagination offset' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.collateralTrading.getFundingHistory({
      ...(flags.market && { market: flags.market }),
      ...(flags.limit !== undefined && { limit: flags.limit }),
      ...(flags.offset !== undefined && { offset: flags.offset }),
    });
    formatOutput(res, format);
  },
});

const setLeverageCommand = defineCommand({
  name: 'set-leverage',
  description: 'Set leverage for collateral trading',
  options: {
    leverage: option(z.coerce.number(), { description: 'Leverage value, e.g. 10' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.collateralTrading.changeCollateralAccountLeverage(
      withAuth({
        leverage: flags.leverage,
      }),
    );
    formatOutput(res, format);
  },
});

const hedgeModeCommand = defineCommand({
  name: 'hedge-mode',
  description: 'Get current hedge mode setting',
  handler: async () => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.collateralTrading.getCollateralHedgeMode();
    formatOutput(res, format);
  },
});

const setHedgeModeCommand = defineCommand({
  name: 'set-hedge-mode',
  description: 'Enable or disable hedge mode',
  options: {
    enable: option(z.boolean(), { description: 'true to enable, false to disable' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    await client.collateralTrading.updateHedgeMode(
      withAuth({
        hedgeMode: flags.enable,
      }),
    );
    formatOutput({ success: true }, format);
  },
});

export const collateralGroup = defineGroup({
  name: 'collateral',
  description: 'Collateral (margin) trading commands',
  commands: [
    balanceCommand,
    balanceSummaryCommand,
    summaryCommand,
    limitOrderCommand,
    marketOrderCommand,
    stopLimitCommand,
    triggerMarketCommand,
    ocoOrderCommand,
    cancelConditionalCommand,
    cancelOcoCommand,
    openPositionsCommand,
    positionsHistoryCommand,
    fundingHistoryCommand,
    setLeverageCommand,
    hedgeModeCommand,
    setHedgeModeCommand,
  ],
});
