import { describe, expect, test } from 'bun:test';

import { collateralLimitOrderCommand } from '../../../src/commands/collateral/limit-order';
import type { CollateralOrder } from '../../../src/lib/types/collateral';

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

describe('collateral limit-order command', () => {
  test('creates collateral limit order successfully', async () => {
    const mockOrder: CollateralOrder = {
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
      leverage: 10,
    };

    global.fetch = createMockFetch(mockOrder) as unknown as typeof fetch;

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await collateralLimitOrderCommand.handler!({
        positional: ['BTC_USDT', 'buy', '0.01', '50000'],
        flags: {
          leverage: 10,
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

  test('creates limit order without leverage', async () => {
    const mockOrder: CollateralOrder = {
      orderId: 123457,
      market: 'ETH_USDT',
      side: 'sell',
      type: 'limit',
      timestamp: 1700000001000,
      dealMoney: '0',
      dealStock: '0',
      amount: '1.0',
      takerFee: '0.1',
      makerFee: '0.1',
      left: '1.0',
      dealFee: '0',
      price: '3000',
    };

    global.fetch = createMockFetch(mockOrder) as unknown as typeof fetch;

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await collateralLimitOrderCommand.handler!({
        positional: ['ETH_USDT', 'sell', '1.0', '3000'],
        flags: {
          apiUrl: 'https://whitebit.com',
          apiKey: 'test-key',
          apiSecret: 'test-secret',
          format: 'json' as const,
        },
      } as never);

      expect(capturedOutput).toContain('123457');
      expect(capturedOutput).toContain('ETH_USDT');
    } finally {
      process.stdout.write = originalStdoutWrite;
    }
  });

  test('handles error gracefully', async () => {
    const mockError = { code: 1001, message: 'Insufficient balance' };
    global.fetch = createMockFetch(mockError, 400) as unknown as typeof fetch;

    try {
      await collateralLimitOrderCommand.handler!({
        positional: ['BTC_USDT', 'buy', '0.01', '50000'],
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
      expect((error as Error).message).toContain('Insufficient balance');
    }
  });
});
