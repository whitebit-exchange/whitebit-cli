import { describe, expect, test } from 'bun:test';

import { subAccountGroup } from '../../../src/commands/sub-account';
import { setGlobalConfigOverrides } from '../../../src/lib/config';

const createMockFetch = (mockResponse: unknown, status = 200) =>
  async (): Promise<Response> =>
    ({
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
      text: async () => JSON.stringify(mockResponse),
    }) as Response;

const createCommand = subAccountGroup.commands.find((c) => c.name === 'create')!;

describe('sub-account create command', () => {
  test('command is registered in sub-account group', () => {
    expect(createCommand).toBeDefined();
    expect(createCommand.name).toBe('create');
  });

  test('creates sub-account successfully', async () => {
    setGlobalConfigOverrides({ format: 'json' });

    const mockSubAccount = { id: 'sub-123', alias: 'New Trading Bot', status: 'active' };

    global.fetch = createMockFetch(mockSubAccount) as unknown as typeof fetch;

    let output = '';
    const orig = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      output += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await createCommand.handler!({ flags: { alias: 'New Trading Bot' } } as never);
      expect(output).toContain('sub-123');
      expect(output).toContain('New Trading Bot');
    } finally {
      process.stdout.write = orig;
    }
  });
});
