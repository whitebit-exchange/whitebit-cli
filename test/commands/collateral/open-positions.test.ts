import { describe, expect, test } from 'bun:test';

import { collateralOpenPositionsCommand } from '../../../src/commands/collateral/open-positions';
import type { Position } from '../../../src/lib/types/collateral';

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

describe('collateral open-positions command', () => {
  test('fetches all open positions successfully', async () => {
    const mockPositions: Position[] = [
      {
        id: 1,
        market: 'BTC_USDT',
        side: 'long',
        amount: '0.5',
        basePrice: '50000',
        liquidationPrice: '40000',
        leverage: 10,
        margin: '2500',
        unrealizedPnL: '500',
        realizedPnL: '0',
        timestamp: 1700000000000,
      },
      {
        id: 2,
        market: 'ETH_USDT',
        side: 'short',
        amount: '5.0',
        basePrice: '3000',
        liquidationPrice: '3500',
        leverage: 5,
        margin: '3000',
        unrealizedPnL: '-150',
        realizedPnL: '0',
        timestamp: 1700000001000,
      },
    ];

    global.fetch = createMockFetch(mockPositions) as unknown as typeof fetch;

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await collateralOpenPositionsCommand.handler!({
        flags: {
          apiUrl: 'https://whitebit.com',
          apiKey: 'test-key',
          apiSecret: 'test-secret',
          format: 'json' as const,
        },
      } as never);

      expect(capturedOutput).toContain('BTC_USDT');
      expect(capturedOutput).toContain('ETH_USDT');
      expect(capturedOutput).toContain('long');
      expect(capturedOutput).toContain('short');
    } finally {
      process.stdout.write = originalStdoutWrite;
    }
  });

  test('fetches positions filtered by market', async () => {
    const mockPositions: Position[] = [
      {
        id: 1,
        market: 'BTC_USDT',
        side: 'long',
        amount: '0.5',
        basePrice: '50000',
        liquidationPrice: '40000',
        leverage: 10,
        margin: '2500',
        unrealizedPnL: '500',
        realizedPnL: '0',
        timestamp: 1700000000000,
      },
    ];

    global.fetch = createMockFetch(mockPositions) as unknown as typeof fetch;

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await collateralOpenPositionsCommand.handler!({
        flags: {
          market: 'BTC_USDT',
          apiUrl: 'https://whitebit.com',
          apiKey: 'test-key',
          apiSecret: 'test-secret',
          format: 'json' as const,
        },
      } as never);

      expect(capturedOutput).toContain('BTC_USDT');
      expect(capturedOutput).not.toContain('ETH_USDT');
    } finally {
      process.stdout.write = originalStdoutWrite;
    }
  });

  test('handles error gracefully', async () => {
    const mockError = { code: 1001, message: 'Authentication failed' };
    global.fetch = createMockFetch(mockError, 401) as unknown as typeof fetch;

    try {
      await collateralOpenPositionsCommand.handler!({
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
