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

const mainBalanceCommand = accountGroup.commands.find((c) => c.name === 'main-balance')!;

describe('account main-balance command', () => {
  test('command is registered in account group', () => {
    expect(mainBalanceCommand).toBeDefined();
    expect(mainBalanceCommand.name).toBe('main-balance');
  });

  test('fetches main balance successfully', async () => {
    setGlobalConfigOverrides({ format: 'json' });

    const mockBalance = {
      BTC: { main_balance: '1.5' },
      ETH: { main_balance: '10.0' },
    };

    global.fetch = createMockFetch(mockBalance) as unknown as typeof fetch;

    let output = '';
    const orig = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      output += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await mainBalanceCommand.handler!({ flags: {} } as never);
      expect(output).toContain('BTC');
      expect(output).toContain('1.5');
    } finally {
      process.stdout.write = orig;
    }
  });

  test('fetches balance with ticker filter', async () => {
    setGlobalConfigOverrides({ format: 'json' });

    const mockBalance = { BTC: { main_balance: '1.5' } };

    global.fetch = createMockFetch(mockBalance) as unknown as typeof fetch;

    let output = '';
    const orig = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      output += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await mainBalanceCommand.handler!({ flags: { ticker: 'BTC' } } as never);
      expect(output).toContain('BTC');
      expect(output).toContain('1.5');
    } finally {
      process.stdout.write = orig;
    }
  });
});
