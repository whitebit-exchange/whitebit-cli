import { describe, expect, test } from 'bun:test';

import { listCommand } from '../../../src/commands/sub-account/list';
import type { SubAccount } from '../../../src/lib/types/sub-account';

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

describe('sub-account list command', () => {
  test('lists sub-accounts successfully', async () => {
    const mockSubAccounts: SubAccount[] = [
      { id: 'sub-1', alias: 'Trading Bot', status: 'active' },
      { id: 'sub-2', alias: 'Savings Account', status: 'active' },
    ];

    global.fetch = createMockFetch(mockSubAccounts) as unknown as typeof fetch;

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await listCommand.handler!({
        flags: {
          apiUrl: 'https://whitebit.com',
          apiKey: 'test-key',
          apiSecret: 'test-secret',
          format: 'json' as const,
        },
      } as never);

      expect(capturedOutput).toContain('Trading Bot');
      expect(capturedOutput).toContain('Savings Account');
    } finally {
      process.stdout.write = originalStdoutWrite;
    }
  });

  test('handles error gracefully', async () => {
    const mockError = { code: 1001, message: 'Authentication failed' };
    global.fetch = createMockFetch(mockError, 401) as unknown as typeof fetch;

    try {
      await listCommand.handler!({
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
