import { describe, expect, test } from 'bun:test';

import { convertGroup } from '../../../src/commands/convert';
import { setGlobalConfigOverrides } from '../../../src/lib/config';

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

const confirmCommand = convertGroup.commands.find((c) => c.name === 'confirm')!;

describe('convert confirm command', () => {
  test('command is registered in convert group', () => {
    expect(confirmCommand).toBeDefined();
    expect(confirmCommand.name).toBe('confirm');
  });

  test('confirms conversion successfully', async () => {
    setGlobalConfigOverrides({ format: 'json' });

    const mockResult = { success: true, transactionId: 'txn-456' };

    global.fetch = createMockFetch(mockResult) as unknown as typeof fetch;

    let output = '';
    const orig = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      output += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await confirmCommand.handler!({
        flags: { 'quote-id': 'quote-123' },
      } as never);
      expect(output).toContain('txn-456');
    } finally {
      process.stdout.write = orig;
    }
  });
});
