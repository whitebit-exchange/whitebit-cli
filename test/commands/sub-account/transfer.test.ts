import { describe, expect, test } from 'bun:test';

import { transferCommand } from '../../../src/commands/sub-account/transfer';

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

describe('sub-account transfer command', () => {
  test('transfers funds to sub-account successfully', async () => {
    const mockResult = { result: 'success' };

    global.fetch = createMockFetch(mockResult) as unknown as typeof fetch;

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await transferCommand.handler!({
        positional: ['BTC', '0.5'],
        flags: {
          toId: 'sub-1',
          apiUrl: 'https://whitebit.com',
          apiKey: 'test-key',
          apiSecret: 'test-secret',
          format: 'json' as const,
        },
      } as never);

      expect(capturedOutput).toContain('success');
    } finally {
      process.stdout.write = originalStdoutWrite;
    }
  });

  test('transfers funds from sub-account successfully', async () => {
    const mockResult = { result: 'success' };

    global.fetch = createMockFetch(mockResult) as unknown as typeof fetch;

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await transferCommand.handler!({
        positional: ['ETH', '1.0'],
        flags: {
          fromId: 'sub-1',
          apiUrl: 'https://whitebit.com',
          apiKey: 'test-key',
          apiSecret: 'test-secret',
          format: 'json' as const,
        },
      } as never);

      expect(capturedOutput).toContain('success');
    } finally {
      process.stdout.write = originalStdoutWrite;
    }
  });

  test('handles insufficient balance error', async () => {
    const mockError = { code: 1002, message: 'Insufficient balance' };
    global.fetch = createMockFetch(mockError, 400) as unknown as typeof fetch;

    try {
      await transferCommand.handler!({
        positional: ['BTC', '100'],
        flags: {
          fromId: 'sub-1',
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
