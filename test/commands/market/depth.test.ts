import { describe, expect, test } from 'bun:test';

import { depthCommand } from '../../../src/commands/market/depth';
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
  test('fetches depth with required market param', async () => {
    const handler = depthCommand.handler;
    if (!handler) {
      throw new Error('depth handler is not defined');
    }

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

    global.fetch = createMockFetch(mockData) as unknown as typeof fetch;

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await handler({
        positional: ['BTC_USDT'],
        flags: {
          apiUrl: 'https://whitebit.com',
          format: 'json' as const,
        },
      } as never);

      expect(capturedOutput).toContain('asks');
      expect(capturedOutput).toContain('bids');
      expect(capturedOutput).toContain('50001');
    } finally {
      process.stdout.write = originalStdoutWrite;
    }
  });

  test('fetches depth with optional limit param', async () => {
    const handler = depthCommand.handler;
    if (!handler) {
      throw new Error('depth handler is not defined');
    }

    const mockData: OrderbookDepth = {
      timestamp: 1631451591,
      asks: [['50001', '1.5']],
      bids: [['49999', '1.2']],
    };

    global.fetch = createMockFetch(mockData) as unknown as typeof fetch;

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await handler({
        positional: ['BTC_USDT'],
        flags: {
          limit: 1,
          apiUrl: 'https://whitebit.com',
          format: 'json' as const,
        },
      } as never);

      expect(capturedOutput).toContain('50001');
    } finally {
      process.stdout.write = originalStdoutWrite;
    }
  });
});
