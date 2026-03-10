import { describe, expect, test } from 'bun:test';

import { collateralBalanceCommand } from '../../../src/commands/collateral/balance';
import type { CollateralBalance } from '../../../src/lib/types/collateral';

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

describe('collateral balance command', () => {
  test('fetches collateral balance successfully', async () => {
    const mockBalance: CollateralBalance = {
      BTC: { available: '1.5', freeze: '0.5' },
      USDT: { available: '10000', freeze: '5000' },
    };

    global.fetch = createMockFetch(mockBalance);

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await collateralBalanceCommand.handler({
        flags: {
          apiUrl: 'https://whitebit.com',
          apiKey: 'test-key',
          apiSecret: 'test-secret',
          format: 'json' as const,
        },
      } as never);

      expect(capturedOutput).toContain('BTC');
      expect(capturedOutput).toContain('1.5');
    } finally {
      process.stdout.write = originalStdoutWrite;
    }
  });

  test('handles error gracefully', async () => {
    const mockError = { code: 1001, message: 'Authentication failed' };
    global.fetch = createMockFetch(mockError, 401);

    try {
      await collateralBalanceCommand.handler({
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
