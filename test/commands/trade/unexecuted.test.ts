import { describe, expect, test } from 'bun:test';

import { spotGroup } from '../../../src/commands/spot';
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

// Previously named "unexecuted", now "active-orders" in the new architecture
const activeOrdersCommand = spotGroup.commands.find((c) => c.name === 'active-orders')!;

describe('spot active-orders command', () => {
  test('command is registered in spot group', () => {
    expect(activeOrdersCommand).toBeDefined();
    expect(activeOrdersCommand.name).toBe('active-orders');
  });

  test('fetches active orders successfully', async () => {
    setGlobalConfigOverrides({ format: 'json' });

    const mockOrders = [
      {
        orderId: 123456,
        market: 'BTC_USDT',
        side: 'buy',
        type: 'limit',
        amount: '0.01',
        price: '50000',
      },
      {
        orderId: 123457,
        market: 'ETH_USDT',
        side: 'sell',
        type: 'limit',
        amount: '1.5',
        price: '3000',
      },
    ];

    global.fetch = createMockFetch(mockOrders) as unknown as typeof fetch;

    let output = '';
    const orig = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      output += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await activeOrdersCommand.handler!({ flags: {} } as never);
      expect(output).toContain('123456');
      expect(output).toContain('123457');
    } finally {
      process.stdout.write = orig;
    }
  });
});
