import { defineCommand, defineGroup, option } from '@bunli/core';
import { z } from 'zod';

import { createPublicClient } from '../lib/client';
import { loadConfig } from '../lib/config';
import { formatOutput } from '../lib/formatter';

const infoCommand = defineCommand({
  name: 'info',
  description: 'Get all available spot and futures markets',
  handler: async () => {
    const { format } = loadConfig();
    const client = createPublicClient();
    const res = await client.publicApiV4.marketInfo();
    formatOutput(res, format);
  },
});

const activityCommand = defineCommand({
  name: 'activity',
  description: 'Get 24h pricing and volume summary for all markets',
  handler: async () => {
    const { format } = loadConfig();
    const client = createPublicClient();
    const res = await client.publicApiV4.marketActivity();
    formatOutput(res, format);
  },
});

const assetsCommand = defineCommand({
  name: 'assets',
  description: 'Get asset status list',
  handler: async () => {
    const { format } = loadConfig();
    const client = createPublicClient();
    const res = await client.publicApiV4.assetStatusList();
    formatOutput(res, format);
  },
});

const orderbookCommand = defineCommand({
  name: 'orderbook',
  description: 'Get order book for a market',
  options: {
    market: option(z.string(), { description: 'Market pair, e.g. BTC_USDT', short: 'm' }),
    limit: option(z.coerce.number().optional(), { description: 'Levels per side (default 100)' }),
    level: option(z.coerce.number().optional(), { description: 'Aggregation level (0=full)' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createPublicClient();
    const res = await client.publicApiV4.orderbook({
      market: flags.market,
      ...(flags.limit !== undefined && { limit: flags.limit }),
      ...(flags.level !== undefined && { level: flags.level }),
    });
    formatOutput(res, format);
  },
});

const depthCommand = defineCommand({
  name: 'depth',
  description: 'Get order book depth (±2% of last price)',
  options: {
    market: option(z.string(), { description: 'Market pair, e.g. BTC_USDT', short: 'm' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createPublicClient();
    const res = await client.publicApiV4.depth({ market: flags.market });
    formatOutput(res, format);
  },
});

const tradesCommand = defineCommand({
  name: 'trades',
  description: 'Get recent trades for a market',
  options: {
    market: option(z.string(), { description: 'Market pair, e.g. BTC_USDT', short: 'm' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createPublicClient();
    const res = await client.publicApiV4.recentTrades({ market: flags.market });
    formatOutput(res, format);
  },
});

const feeCommand = defineCommand({
  name: 'fee',
  description: 'Get default trading fee rates',
  handler: async () => {
    const { format } = loadConfig();
    const client = createPublicClient();
    const res = await client.publicApiV4.fee();
    formatOutput(res, format);
  },
});

const collateralMarketsCommand = defineCommand({
  name: 'collateral-markets',
  description: 'Get all collateral (margin) markets',
  handler: async () => {
    const { format } = loadConfig();
    const client = createPublicClient();
    const res = await client.publicApiV4.collateralMarketsList();
    formatOutput(res, format);
  },
});

const futuresMarketsCommand = defineCommand({
  name: 'futures-markets',
  description: 'Get all futures markets',
  handler: async () => {
    const { format } = loadConfig();
    const client = createPublicClient();
    const res = await client.publicApiV4.availableFuturesMarketsList();
    formatOutput(res, format);
  },
});

const fundingHistoryCommand = defineCommand({
  name: 'funding-history',
  description: 'Get funding rate history for a market',
  options: {
    market: option(z.string(), { description: 'Market pair, e.g. BTC_USDT', short: 'm' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createPublicClient();
    const res = await client.publicApiV4.fundingHistory({ market: flags.market });
    formatOutput(res, format);
  },
});

export const marketGroup = defineGroup({
  name: 'market',
  description: 'Public market data (no auth required)',
  commands: [
    infoCommand,
    activityCommand,
    assetsCommand,
    orderbookCommand,
    depthCommand,
    tradesCommand,
    feeCommand,
    collateralMarketsCommand,
    futuresMarketsCommand,
    fundingHistoryCommand,
  ],
});
