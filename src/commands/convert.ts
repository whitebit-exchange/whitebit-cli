import { defineCommand, defineGroup, option } from '@bunli/core';
import { z } from 'zod';

import { createClient } from '../lib/client';
import { loadConfig } from '../lib/config';
import { formatOutput } from '../lib/formatter';

const estimateCommand = defineCommand({
  name: 'estimate',
  description: 'Get a conversion estimate between two assets',
  options: {
    from: option(z.string(), { description: 'Source asset ticker, e.g. BTC' }),
    to: option(z.string(), { description: 'Target asset ticker, e.g. USDT' }),
    amount: option(z.string(), { description: 'Amount to convert' }),
    direction: option(z.enum(['from', 'to']).optional(), {
      description: 'Direction: from or to (default: from)',
    }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.convertEstimate({
      from: flags.from,
      to: flags.to,
      amount: flags.amount,
      direction: flags.direction ?? 'from',
    });
    formatOutput(res, format);
  },
});

const confirmCommand = defineCommand({
  name: 'confirm',
  description: 'Confirm a conversion using a quote ID from estimate',
  options: {
    'quote-id': option(z.string(), { description: 'Quote ID returned from convert estimate' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.convertConfirm({ quoteId: flags['quote-id'] });
    formatOutput(res, format);
  },
});

const historyCommand = defineCommand({
  name: 'history',
  description: 'Get conversion history',
  options: {
    'from-ticker': option(z.string().optional(), { description: 'Filter by source ticker' }),
    'to-ticker': option(z.string().optional(), { description: 'Filter by target ticker' }),
    limit: option(z.coerce.number().optional(), { description: 'Number of records' }),
    offset: option(z.coerce.number().optional(), { description: 'Pagination offset' }),
  },
  handler: async ({ flags }) => {
    const { format } = loadConfig();
    const client = createClient();
    const res = await client.convertHistory({
      ...(flags['from-ticker'] && { fromTicker: flags['from-ticker'] }),
      ...(flags['to-ticker'] && { toTicker: flags['to-ticker'] }),
      ...(flags.limit !== undefined && { limit: flags.limit }),
      ...(flags.offset !== undefined && { offset: flags.offset }),
    });
    formatOutput(res, format);
  },
});

export const convertGroup = defineGroup({
  name: 'convert',
  description: 'Currency conversion commands',
  commands: [estimateCommand, confirmCommand, historyCommand],
});
