import { describe, expect, test } from 'bun:test';

import { klineCommand } from '../../../src/commands/market/kline';
import type { KlineRecord } from '../../../src/lib/types/market';

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

describe('market kline command', () => {
  test('fetches kline with required params', async () => {
    const handler = klineCommand.handler;
    if (!handler) {
      throw new Error('kline handler is not defined');
    }

    const mockData: KlineRecord[] = [
      {
        time: 1631451600,
        open: '49500',
        close: '50000',
        high: '50100',
        low: '49400',
        volume: '100',
        deal: '5000000',
      },
    ];

    global.fetch = createMockFetch(mockData) as unknown as typeof fetch;

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await handler({
        positional: ['BTC_USDT', '1h'],
        flags: {
          apiUrl: 'https://whitebit.com',
          format: 'json' as const,
        },
      } as never);

      expect(capturedOutput).toContain('50000');
      expect(capturedOutput).toContain('close');
    } finally {
      process.stdout.write = originalStdoutWrite;
    }
  });

  test('fetches kline with optional params', async () => {
    const handler = klineCommand.handler;
    if (!handler) {
      throw new Error('kline handler is not defined');
    }

    const mockData: KlineRecord[] = [
      {
        time: 1631451600,
        open: '49500',
        close: '50000',
        high: '50100',
        low: '49400',
        volume: '100',
        deal: '5000000',
      },
    ];

    global.fetch = createMockFetch(mockData) as unknown as typeof fetch;

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await handler({
        positional: ['BTC_USDT', '1h'],
        flags: {
          start: 1631400000,
          end: 1631500000,
          limit: 100,
          apiUrl: 'https://whitebit.com',
          format: 'json' as const,
        },
      } as never);

      expect(capturedOutput).toContain('50000');
    } finally {
      process.stdout.write = originalStdoutWrite;
    }
  });
});
