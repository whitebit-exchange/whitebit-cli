import { describe, expect, test } from 'bun:test';

import { accountMainBalanceCommand } from '../../../src/commands/balance/main-balance';

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

describe('account main-balance command', () => {
  test('fetches main balance successfully', async () => {
    const mockBalance = {
      BTC: { main_balance: '1.5' },
      ETH: { main_balance: '10.0' },
    };

    global.fetch = createMockFetch(mockBalance);

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await accountMainBalanceCommand.handler({
        positional: [],
        flags: {
          apiUrl: 'https://whitebit.com',
          apiKey: 'test-key',
          apiSecret: 'test-secret',
          format: 'json' as const,
        },
      } as never);

      expect(capturedOutput).toContain('1.5');
      expect(capturedOutput).toContain('BTC');
    } finally {
      process.stdout.write = originalStdoutWrite;
    }
  });

  test('fetches main balance with ticker filter', async () => {
    const mockBalance = {
      BTC: { main_balance: '1.5' },
    };

    global.fetch = createMockFetch(mockBalance);

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await accountMainBalanceCommand.handler({
        positional: ['BTC'],
        flags: {
          apiUrl: 'https://whitebit.com',
          apiKey: 'test-key',
          apiSecret: 'test-secret',
          format: 'json' as const,
        },
      } as never);

      expect(capturedOutput).toContain('1.5');
      expect(capturedOutput).toContain('BTC');
    } finally {
      process.stdout.write = originalStdoutWrite;
    }
  });

  test('handles error gracefully', async () => {
    const mockError = { code: 1001, message: 'Invalid ticker' };
    global.fetch = createMockFetch(mockError, 400);

    try {
      await accountMainBalanceCommand.handler({
        positional: [],
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
      expect((error as Error).message).toContain('Invalid ticker');
    }
  });
});
