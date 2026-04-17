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

const withdrawCommand = accountGroup.commands.find((c) => c.name === 'withdraw')!;

describe('account withdraw command', () => {
  test('command is registered in account group', () => {
    expect(withdrawCommand).toBeDefined();
    expect(withdrawCommand.name).toBe('withdraw');
  });

  test('withdraws crypto successfully', async () => {
    setGlobalConfigOverrides({ format: 'json' });

    const mockResponse = { id: 12345 };

    global.fetch = createMockFetch(mockResponse) as unknown as typeof fetch;

    let output = '';
    const orig = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      output += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await withdrawCommand.handler!({
        flags: {
          ticker: 'BTC',
          amount: '0.1',
          address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        },
      } as never);
      expect(output).toContain('12345');
    } finally {
      process.stdout.write = orig;
    }
  });

  test('withdraws with optional memo', async () => {
    setGlobalConfigOverrides({ format: 'json' });

    const mockResponse = { id: 67890 };

    global.fetch = createMockFetch(mockResponse) as unknown as typeof fetch;

    let output = '';
    const orig = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      output += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await withdrawCommand.handler!({
        flags: {
          ticker: 'XRP',
          amount: '100',
          address: 'rN7n7otQDd6FczFgLdlqtyMVrn3PvNvMGmm',
          memo: '123456',
        },
      } as never);
      expect(output).toContain('67890');
    } finally {
      process.stdout.write = orig;
    }
  });
});
