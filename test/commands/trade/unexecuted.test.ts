import { describe, expect, test } from 'bun:test';

import { tradeUnexecutedCommand } from '../../../src/commands/trade/unexecuted';
import type { Order } from '../../../src/lib/types/trade';

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

describe('trade unexecuted command', () => {
  test('fetches unexecuted orders successfully', async () => {
    const mockOrders: Order[] = [
      {
        orderId: 123456,
        market: 'BTC_USDT',
        side: 'buy',
        type: 'limit',
        timestamp: 1700000000000,
        dealMoney: '0',
        dealStock: '0',
        amount: '0.01',
        takerFee: '0.1',
        makerFee: '0.1',
        left: '0.01',
        dealFee: '0',
        price: '50000',
      },
      {
        orderId: 123457,
        market: 'ETH_USDT',
        side: 'sell',
        type: 'limit',
        timestamp: 1700000000000,
        dealMoney: '0',
        dealStock: '0',
        amount: '1.5',
        takerFee: '0.1',
        makerFee: '0.1',
        left: '1.5',
        dealFee: '0',
        price: '3000',
      },
    ];

    global.fetch = createMockFetch(mockOrders);

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await tradeUnexecutedCommand.handler({
        flags: {
          market: undefined,
          limit: 50,
          offset: 0,
          apiUrl: 'https://whitebit.com',
          apiKey: 'test-key',
          apiSecret: 'test-secret',
          format: 'json' as const,
        },
      } as never);

      expect(capturedOutput).toContain('123456');
      expect(capturedOutput).toContain('123457');
    } finally {
      process.stdout.write = originalStdoutWrite;
    }
  });

  test('handles error gracefully', async () => {
    const mockError = { code: 1001, message: 'Authentication failed' };
    global.fetch = createMockFetch(mockError, 401);

    try {
      await tradeUnexecutedCommand.handler({
        flags: {
          apiUrl: 'https://whitebit.com',
          apiKey: 'test-key',
          apiSecret: 'test-secret',
          format: 'json' as const,
        },
      } as never);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('Authentication failed');
    }
  });
});
