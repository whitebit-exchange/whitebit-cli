import { beforeEach, describe, expect, test } from 'bun:test';

import { tradeCancelCommand } from '../../../src/commands/trade/cancel';
import { setGlobalConfigOverrides } from '../../../src/lib/config';
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
  beforeEach(() => {
    setGlobalConfigOverrides({
      apiUrl: 'https://whitebit.com',
      apiKey: 'test-key',
      apiSecret: 'test-secret',
      format: 'json',
    });
  });

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

    global.fetch = createMockFetch(mockOrder);

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await tradeCancelCommand.handler({
        flags: {
          market: 'BTC_USDT',
          orderId: 123456,
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
    global.fetch = createMockFetch(mockError, 404);

    try {
      await tradeCancelCommand.handler({
        flags: {
          market: 'BTC_USDT',
          orderId: 999999,
        },
      } as never);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('Order not found');
    }
  });
});
