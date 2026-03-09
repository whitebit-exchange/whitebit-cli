import { beforeEach, describe, expect, test } from 'bun:test';

import { createCommand } from '../../../src/commands/sub-account/create';
import { setGlobalConfigOverrides } from '../../../src/lib/config';
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
  beforeEach(() => {
    setGlobalConfigOverrides({
      apiUrl: 'https://whitebit.com',
      apiKey: 'test-key',
      apiSecret: 'test-secret',
      format: 'json',
    });
  });

  test('creates sub-account successfully', async () => {
    const mockSubAccount: SubAccount = {
      id: 'sub-123',
      alias: 'New Trading Bot',
      status: 'active',
    };

    global.fetch = createMockFetch(mockSubAccount);

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await createCommand.handler({
        flags: {
          alias: 'New Trading Bot',
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
    global.fetch = createMockFetch(mockError, 400);

    try {
      await createCommand.handler({
        flags: {
          alias: 'Duplicate',
        },
      } as never);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('Validation failed');
    }
  });
});
