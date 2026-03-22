import { describe, expect, test } from 'bun:test';

import { createCommand } from '../../../src/commands/sub-account/create';
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

describe('sub-account create command', () => {
  test('creates sub-account successfully', async () => {
    const mockSubAccount: SubAccount = {
      id: 'sub-123',
      alias: 'New Trading Bot',
      status: 'active',
    };

    global.fetch = createMockFetch(mockSubAccount) as unknown as typeof fetch;

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await createCommand.handler!({
        positional: ['New Trading Bot'],
        flags: {
          apiUrl: 'https://whitebit.com',
          apiKey: 'test-key',
          apiSecret: 'test-secret',
          format: 'json' as const,
        },
      } as never);

      expect(capturedOutput).toContain('sub-123');
      expect(capturedOutput).toContain('New Trading Bot');
    } finally {
      process.stdout.write = originalStdoutWrite;
    }
  });

  test('handles duplicate alias error', async () => {
    const mockError = {
      code: 0,
      message: 'Validation failed',
      errors: {
        alias: ['Alias already exists.'],
      },
    };
    global.fetch = createMockFetch(mockError, 400) as unknown as typeof fetch;

    try {
      await createCommand.handler!({
        positional: ['Duplicate'],
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
      expect((error as Error).message).toContain('Validation failed');
    }
  });
});
