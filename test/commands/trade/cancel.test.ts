import { describe, expect, test } from 'bun:test';

import { tradeCancelCommand } from '../../../src/commands/trade/cancel';
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

describe('trade cancel command', () => {
  test('cancels order successfully', async () => {
    const mockOrder: Order = {
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
    };

    global.fetch = createMockFetch(mockOrder) as unknown as typeof fetch;

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await tradeCancelCommand.handler!({
        positional: ['BTC_USDT', '123456'],
        flags: {
          apiUrl: 'https://whitebit.com',
          apiKey: 'test-key',
          apiSecret: 'test-secret',
          format: 'json' as const,
        },
      } as never);

      expect(capturedOutput).toContain('123456');
      expect(capturedOutput).toContain('BTC_USDT');
    } finally {
      process.stdout.write = originalStdoutWrite;
    }
  });

  test('handles error gracefully', async () => {
    const mockError = { code: 1002, message: 'Order not found' };
    global.fetch = createMockFetch(mockError, 404) as unknown as typeof fetch;

    try {
      await tradeCancelCommand.handler!({
        positional: ['BTC_USDT', '999999'],
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
      expect((error as Error).message).toContain('Order not found');
    }
  });
});
