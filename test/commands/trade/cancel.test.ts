import { describe, expect, test } from 'bun:test';

import { spotGroup } from '../../../src/commands/spot';
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

const cancelCommand = spotGroup.commands.find((c) => c.name === 'cancel')!;

describe('spot cancel command', () => {
  test('command is registered in spot group', () => {
    expect(cancelCommand).toBeDefined();
    expect(cancelCommand.name).toBe('cancel');
  });

  test('cancels order successfully', async () => {
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
      await cancelCommand.handler!({
        flags: { market: 'BTC_USDT', 'order-id': 123456 },
      } as never);
      expect(output).toContain('123456');
      expect(output).toContain('BTC_USDT');
    } finally {
      process.stdout.write = orig;
    }
  });
});
