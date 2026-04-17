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

const limitOrderCommand = collateralGroup.commands.find((c) => c.name === 'limit-order')!;

describe('collateral limit-order command', () => {
  test('command is registered in collateral group', () => {
    expect(limitOrderCommand).toBeDefined();
    expect(limitOrderCommand.name).toBe('limit-order');
  });

  test('creates collateral limit order successfully', async () => {
    setGlobalConfigOverrides({ format: 'json' });

    const mockOrder = {
      orderId: 123456,
      market: 'BTC_USDT',
      side: 'buy',
      type: 'limit',
      amount: '0.01',
      price: '50000',
    };

    global.fetch = createMockFetch(mockOrder) as unknown as typeof fetch;

    let output = '';
    const orig = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      output += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await limitOrderCommand.handler!({
        flags: { market: 'BTC_USDT', side: 'buy', amount: '0.01', price: '50000' },
      } as never);
      expect(output).toContain('123456');
      expect(output).toContain('BTC_USDT');
    } finally {
      process.stdout.write = orig;
    }
  });
});
