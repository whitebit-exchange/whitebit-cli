import { describe, expect, test } from 'bun:test';

import { collateralGroup } from '../../../src/commands/collateral';
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

const balanceCommand = collateralGroup.commands.find((c) => c.name === 'balance')!;

describe('collateral balance command', () => {
  test('command is registered in collateral group', () => {
    expect(balanceCommand).toBeDefined();
    expect(balanceCommand.name).toBe('balance');
  });

  test('fetches collateral balance successfully', async () => {
    setGlobalConfigOverrides({ format: 'json' });

    const mockBalance = {
      BTC: { available: '1.5', freeze: '0.5' },
      USDT: { available: '10000', freeze: '5000' },
    };

    global.fetch = createMockFetch(mockBalance) as unknown as typeof fetch;

    let output = '';
    const orig = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      output += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await balanceCommand.handler!({ flags: {} } as never);
      expect(output).toContain('BTC');
      expect(output).toContain('1.5');
    } finally {
      process.stdout.write = orig;
    }
  });
});
