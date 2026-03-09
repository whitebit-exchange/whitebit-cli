import { defineCommand } from '@bunli/core';

import { TradeApi } from '../../lib/api/trade';
import { loadAuthConfig, loadConfig } from '../../lib/config';
import { formatOutput } from '../../lib/formatter';
import { HttpClient } from '../../lib/http';

interface AllFeesResponse {
  taker: string;
  maker: string;
  custom_fee?: Record<string, { taker: string; maker: string }>;
  futures_taker: string;
  futures_maker: string;
  [key: string]: unknown;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const formatFeesAsRows = (data: unknown): unknown[] => {
  if (!isRecord(data)) {
    return [data];
  }

  const response = data as AllFeesResponse;
  const rows: Record<string, string>[] = [];

  rows.push({
    market: '(default spot)',
    taker: response.taker ?? '',
    maker: response.maker ?? '',
  });

  if (response.futures_taker || response.futures_maker) {
    rows.push({
      market: '(default futures)',
      taker: response.futures_taker ?? '',
      maker: response.futures_maker ?? '',
    });
  }

  if (isRecord(response.custom_fee)) {
    for (const [market, fee] of Object.entries(response.custom_fee)) {
      if (isRecord(fee)) {
        rows.push({
          market,
          taker: String(fee.taker ?? ''),
          maker: String(fee.maker ?? ''),
        });
      }
    }
  }

  return rows;
};

export const tradeAllFeesCommand = defineCommand({
  name: 'all-fees',
  description: 'Get trading fees for all markets',
  handler: async () => {
    const runtimeConfig = loadConfig();
    const config = loadAuthConfig();

    const client = new HttpClient({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    const api = new TradeApi(client);

    const response = await api.allFees();

    if (runtimeConfig.dryRun) {
      return;
    }

    formatOutput(formatFeesAsRows(response), { format: runtimeConfig.format });
  },
});
