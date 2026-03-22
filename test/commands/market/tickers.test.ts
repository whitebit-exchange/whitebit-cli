import { describe, expect, test } from 'bun:test';

import { marketTickersCommand } from '../../../src/commands/market/tickers';
import type { TickerData } from '../../../src/lib/types/market';

const createMockFetch =
  (mockResponse: unknown, status = 200) =>
  async (): Promise<Response> =>
    ({
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
      text: async () => JSON.stringify(mockResponse),
    }) as Response;

describe('market tickers command', () => {
  test('fetches tickers successfully', async () => {
    const mockData: Record<string, TickerData> = {
      BTC_USDT: {
        ticker_id: 'BTC_USDT',
        base_currency: 'BTC',
        quote_currency: 'USDT',
        last_price: '50000',
        base_volume: '100',
        quote_volume: '5000000',
        isFrozen: '0',
        change: '0.5',
        ask: '50001',
        bid: '49999',
        high: '51000',
        low: '49000',
        volume: '100',
        deal: '5000000',
        at: 1631451591,
      },
    };

    global.fetch = createMockFetch(mockData) as unknown as typeof fetch;

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await marketTickersCommand.handler!({
        flags: {
          apiUrl: 'https://whitebit.com',
          format: 'json' as const,
        },
      } as never);

      expect(capturedOutput).toContain('BTC_USDT');
      expect(capturedOutput).toContain('50000');
    } finally {
      process.stdout.write = originalStdoutWrite;
    }
  });
});
