import { defineCommand, defineGroup, option } from '@bunli/core';
import { z } from 'zod';

import { authFields, createClient } from '../lib/client';
import { loadConfig } from '../lib/config';
import { formatOutput } from '../lib/formatter';

const balanceCommand = defineCommand({
  name: 'balance',
  description: 'Get spot trading account balance',
  options: {
    ticker: option(z.string().optional(), { description: 'Filter by ticker, e.g. BTC' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.spotTrading.tradeAccountBalance(
      flags.ticker ? { ticker: flags.ticker } : undefined,
    );
    formatOutput(res, format);
  },
});

const limitOrderCommand = defineCommand({
  name: 'limit-order',
  description: 'Create a limit order on the spot market',
  options: {
    market: option(z.string(), { description: 'Market pair, e.g. BTC_USDT', short: 'm' }),
    side: option(z.enum(['buy', 'sell']), { description: 'buy or sell' }),
    amount: option(z.string(), { description: 'Order amount in base currency' }),
    price: option(z.string(), { description: 'Limit price' }),
    'post-only': option(z.boolean().optional(), { description: 'Post-only flag' }),
    ioc: option(z.boolean().optional(), { description: 'Immediate-or-cancel flag' }),
    'client-order-id': option(z.string().optional(), { description: 'Optional client order ID' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.spotTrading.createLimitOrder({
      market: flags.market,
      side: flags.side,
      amount: flags.amount,
      price: flags.price,
      ...(flags['post-only'] !== undefined && { postOnly: flags['post-only'] }),
      ...(flags.ioc !== undefined && { ioc: flags.ioc }),
      ...(flags['client-order-id'] && { client_order_id: flags['client-order-id'] }),
      ...authFields(),
    });
    formatOutput(res, format);
  },
});

const marketOrderCommand = defineCommand({
  name: 'market-order',
  description: 'Create a market order on the spot market',
  options: {
    market: option(z.string(), { description: 'Market pair, e.g. BTC_USDT', short: 'm' }),
    side: option(z.enum(['buy', 'sell']), { description: 'buy or sell' }),
    amount: option(z.string(), {
      description: 'Amount in quote currency (buy) or base currency (sell)',
    }),
    'client-order-id': option(z.string().optional(), { description: 'Optional client order ID' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.spotTrading.createMarketOrder({
      market: flags.market,
      side: flags.side,
      amount: flags.amount,
      ...(flags['client-order-id'] && { client_order_id: flags['client-order-id'] }),
      ...authFields(),
    });
    formatOutput(res, format);
  },
});

const stopLimitCommand = defineCommand({
  name: 'stop-limit',
  description: 'Create a stop-limit order on the spot market',
  options: {
    market: option(z.string(), { description: 'Market pair, e.g. BTC_USDT', short: 'm' }),
    side: option(z.enum(['buy', 'sell']), { description: 'buy or sell' }),
    amount: option(z.string(), { description: 'Order amount' }),
    price: option(z.string(), { description: 'Limit price' }),
    'activation-price': option(z.string(), { description: 'Activation (trigger) price' }),
    'client-order-id': option(z.string().optional(), { description: 'Optional client order ID' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.spotTrading.createStopLimitOrder({
      market: flags.market,
      side: flags.side,
      amount: flags.amount,
      price: flags.price,
      activation_price: flags['activation-price'],
      ...(flags['client-order-id'] && { client_order_id: flags['client-order-id'] }),
      ...authFields(),
    });
    formatOutput(res, format);
  },
});

const stopMarketCommand = defineCommand({
  name: 'stop-market',
  description: 'Create a stop-market order on the spot market',
  options: {
    market: option(z.string(), { description: 'Market pair, e.g. BTC_USDT', short: 'm' }),
    side: option(z.enum(['buy', 'sell']), { description: 'buy or sell' }),
    amount: option(z.string(), { description: 'Order amount' }),
    'activation-price': option(z.string(), { description: 'Activation (trigger) price' }),
    'client-order-id': option(z.string().optional(), { description: 'Optional client order ID' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.spotTrading.createStopMarketOrder({
      market: flags.market,
      side: flags.side,
      amount: flags.amount,
      activation_price: flags['activation-price'],
      ...(flags['client-order-id'] && { client_order_id: flags['client-order-id'] }),
      ...authFields(),
    });
    formatOutput(res, format);
  },
});

const cancelOrderCommand = defineCommand({
  name: 'cancel',
  description: 'Cancel a spot order by order ID',
  options: {
    market: option(z.string(), { description: 'Market pair, e.g. BTC_USDT', short: 'm' }),
    'order-id': option(z.coerce.number().optional(), { description: 'Order ID to cancel' }),
    'client-order-id': option(z.string().optional(), { description: 'Client order ID to cancel' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.spotTrading.cancelOrder({
      market: flags.market,
      ...(flags['order-id'] !== undefined && { order_id: flags['order-id'] }),
      ...(flags['client-order-id'] && { client_order_id: flags['client-order-id'] }),
      ...authFields(),
    });
    formatOutput(res, format);
  },
});

const cancelAllCommand = defineCommand({
  name: 'cancel-all',
  description: 'Cancel all spot orders for a market',
  options: {
    market: option(z.string().optional(), { description: 'Market pair (optional)' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    await client.spotTrading.cancelAllOrders(flags.market ? { market: flags.market } : undefined);
    formatOutput({ success: true }, format);
  },
});

const activeOrdersCommand = defineCommand({
  name: 'active-orders',
  description: 'Get open spot orders',
  options: {
    market: option(z.string().optional(), { description: 'Market pair filter' }),
    limit: option(z.coerce.number().optional(), { description: 'Number of records' }),
    offset: option(z.coerce.number().optional(), { description: 'Pagination offset' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.spotTrading.getActiveOrders({
      ...(flags.market && { market: flags.market }),
      ...(flags.limit !== undefined && { limit: flags.limit }),
      ...(flags.offset !== undefined && { offset: flags.offset }),
    });
    formatOutput(res, format);
  },
});

const executedHistoryCommand = defineCommand({
  name: 'executed-history',
  description: 'Get executed order history',
  options: {
    market: option(z.string().optional(), { description: 'Market pair filter' }),
    limit: option(z.coerce.number().optional(), { description: 'Number of records' }),
    offset: option(z.coerce.number().optional(), { description: 'Pagination offset' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.spotTrading.getExecutedOrderHistory({
      ...(flags.market && { market: flags.market }),
      ...(flags.limit !== undefined && { limit: flags.limit }),
      ...(flags.offset !== undefined && { offset: flags.offset }),
    });
    formatOutput(res, format);
  },
});

const orderDealsCommand = defineCommand({
  name: 'order-deals',
  description: 'Get deals (fills) for a specific order',
  options: {
    'order-id': option(z.coerce.number(), { description: 'Order ID' }),
    limit: option(z.coerce.number().optional(), { description: 'Number of records' }),
    offset: option(z.coerce.number().optional(), { description: 'Pagination offset' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.spotTrading.getOrderDeals({
      order_id: flags['order-id'],
      ...(flags.limit !== undefined && { limit: flags.limit }),
      ...(flags.offset !== undefined && { offset: flags.offset }),
      ...authFields(),
    });
    formatOutput(res, format);
  },
});

const orderHistoryCommand = defineCommand({
  name: 'order-history',
  description: 'Get order history by market',
  options: {
    market: option(z.string().optional(), { description: 'Market pair filter' }),
    limit: option(z.coerce.number().optional(), { description: 'Number of records' }),
    offset: option(z.coerce.number().optional(), { description: 'Pagination offset' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.spotTrading.getOrderHistory({
      ...(flags.market && { market: flags.market }),
      ...(flags.limit !== undefined && { limit: flags.limit }),
      ...(flags.offset !== undefined && { offset: flags.offset }),
    });
    formatOutput(res, format);
  },
});

const modifyOrderCommand = defineCommand({
  name: 'modify-order',
  description: 'Modify an existing spot order price or amount',
  options: {
    market: option(z.string(), { description: 'Market pair, e.g. BTC_USDT', short: 'm' }),
    'order-id': option(z.coerce.number().optional(), { description: 'Order ID to modify' }),
    'client-order-id': option(z.string().optional(), { description: 'Client order ID to modify' }),
    price: option(z.string().optional(), { description: 'New price' }),
    amount: option(z.string().optional(), { description: 'New amount' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.spotTrading.modifyOrder({
      market: flags.market,
      ...(flags['order-id'] !== undefined && { order_id: flags['order-id'] }),
      ...(flags['client-order-id'] && { client_order_id: flags['client-order-id'] }),
      ...(flags.price && { price: flags.price }),
      ...(flags.amount && { amount: flags.amount }),
      ...authFields(),
    });
    formatOutput(res, format);
  },
});

const killSwitchCommand = defineCommand({
  name: 'kill-switch',
  description: 'Set kill switch (cancels all orders after timeout unless reset)',
  options: {
    market: option(z.string(), { description: 'Market pair, e.g. BTC_USDT', short: 'm' }),
    timeout: option(z.string(), { description: 'Timeout in seconds' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.spotTrading.setKillSwitch({
      market: flags.market,
      timeout: flags.timeout,
    });
    formatOutput(res, format);
  },
});

const killSwitchStatusCommand = defineCommand({
  name: 'kill-switch-status',
  description: 'Get kill switch status',
  options: {
    market: option(z.string().optional(), { description: 'Market pair filter' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.spotTrading.getKillSwitchStatus(
      flags.market ? { market: flags.market } : undefined,
    );
    formatOutput(res, format);
  },
});

export const spotGroup = defineGroup({
  name: 'spot',
  description: 'Spot trading commands',
  commands: [
    balanceCommand,
    limitOrderCommand,
    marketOrderCommand,
    stopLimitCommand,
    stopMarketCommand,
    cancelOrderCommand,
    cancelAllCommand,
    activeOrdersCommand,
    executedHistoryCommand,
    orderDealsCommand,
    orderHistoryCommand,
    modifyOrderCommand,
    killSwitchCommand,
    killSwitchStatusCommand,
  ],
});
