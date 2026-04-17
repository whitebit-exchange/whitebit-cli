import { describe, expect, test } from 'bun:test';

import { accountGroup } from '../../../src/commands/account';
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

const transferCommand = accountGroup.commands.find((c) => c.name === 'transfer')!;

describe('account transfer command', () => {
  test('command is registered in account group', () => {
    expect(transferCommand).toBeDefined();
    expect(transferCommand.name).toBe('transfer');
  });

  test('transfers funds between accounts successfully', async () => {
    setGlobalConfigOverrides({ format: 'json' });

    global.fetch = createMockFetch({}) as unknown as typeof fetch;

    let output = '';
    const orig = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      output += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await transferCommand.handler!({
        flags: { from: 'main', to: 'spot', ticker: 'BTC', amount: '0.1' },
      } as never);
      expect(output).toContain('success');
    } finally {
      process.stdout.write = orig;
    }
  });
});
