import { beforeEach, describe, expect, test } from 'bun:test';

import { depthCommand } from '../../../src/commands/market/depth';
import { setGlobalConfigOverrides } from '../../../src/lib/config';
import type { OrderbookDepth } from '../../../src/lib/types/market';

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

describe('market depth command', () => {
  beforeEach(() => {
    setGlobalConfigOverrides({
      apiUrl: 'https://whitebit.com',
      format: 'json',
    });
  });

  test('fetches depth with required market param', async () => {
    const mockData: OrderbookDepth = {
      timestamp: 1631451591,
      asks: [
        ['50001', '1.5'],
        ['50002', '2.0'],
      ],
      bids: [
        ['49999', '1.2'],
        ['49998', '1.8'],
      ],
    };

    global.fetch = createMockFetch(mockData);

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await depthCommand.handler({
        options: { market: 'BTC_USDT' },
      } as never);

      expect(capturedOutput).toContain('asks');
      expect(capturedOutput).toContain('bids');
      expect(capturedOutput).toContain('50001');
    } finally {
      process.stdout.write = originalStdoutWrite;
    }
  });

  test('fetches depth with optional limit param', async () => {
    const mockData: OrderbookDepth = {
      timestamp: 1631451591,
      asks: [['50001', '1.5']],
      bids: [['49999', '1.2']],
    };

    global.fetch = createMockFetch(mockData);

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await depthCommand.handler({
        options: { market: 'BTC_USDT', limit: 1 },
      } as never);

      expect(capturedOutput).toContain('50001');
    } finally {
      process.stdout.write = originalStdoutWrite;
    }
  });
});
