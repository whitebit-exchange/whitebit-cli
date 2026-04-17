import { describe, expect, test } from 'bun:test';

import { subAccountGroup } from '../../../src/commands/sub-account';
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

const listCommand = subAccountGroup.commands.find((c) => c.name === 'list')!;

describe('sub-account list command', () => {
  test('command is registered in sub-account group', () => {
    expect(listCommand).toBeDefined();
    expect(listCommand.name).toBe('list');
  });

  test('lists sub-accounts successfully', async () => {
    setGlobalConfigOverrides({ format: 'json' });

    const mockSubAccounts = [
      { id: 'sub-1', alias: 'Trading Bot', status: 'active' },
      { id: 'sub-2', alias: 'Savings Account', status: 'active' },
    ];

    global.fetch = createMockFetch(mockSubAccounts) as unknown as typeof fetch;

    let output = '';
    const orig = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      output += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await listCommand.handler!({ flags: {} } as never);
      expect(output).toContain('Trading Bot');
      expect(output).toContain('Savings Account');
    } finally {
      process.stdout.write = orig;
    }
  });
});
