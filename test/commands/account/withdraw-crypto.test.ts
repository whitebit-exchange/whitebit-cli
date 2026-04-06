import { describe, expect, test } from 'bun:test';

import { accountWithdrawCryptoCommand } from '../../../src/commands/withdraw/withdraw-crypto';

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

describe('account withdraw-crypto command', () => {
  test('withdraws crypto successfully', async () => {
    const mockResponse = {
      success: true,
      id: 12345,
    };

    global.fetch = createMockFetch(mockResponse) as unknown as typeof fetch;

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await accountWithdrawCryptoCommand.handler!({
        positional: ['BTC', '0.1', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'],
        flags: {
          apiUrl: 'https://whitebit.com',
          apiKey: 'test-key',
          apiSecret: 'test-secret',
          format: 'json' as const,
        },
      } as never);

      expect(capturedOutput).toContain('12345');
    } finally {
      process.stdout.write = originalStdoutWrite;
    }
  });

  test('withdraws crypto with network and memo', async () => {
    const mockResponse = {
      success: true,
      id: 67890,
    };

    global.fetch = createMockFetch(mockResponse) as unknown as typeof fetch;

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await accountWithdrawCryptoCommand.handler!({
        positional: ['XRP', '100', 'rN7n7otQDd6FczFgLdlqtyMVrn3PvNvMGmm'],
        flags: {
          memo: '123456',
          apiUrl: 'https://whitebit.com',
          apiKey: 'test-key',
          apiSecret: 'test-secret',
          format: 'json' as const,
        },
      } as never);

      expect(capturedOutput).toContain('67890');
    } finally {
      process.stdout.write = originalStdoutWrite;
    }
  });

  test('handles withdrawal error', async () => {
    const mockError = { code: 2001, message: 'Insufficient balance' };
    global.fetch = createMockFetch(mockError, 400) as unknown as typeof fetch;

    try {
      await accountWithdrawCryptoCommand.handler!({
        positional: ['BTC', '1000', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'],
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
