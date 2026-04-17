import { describe, expect, test } from 'bun:test';

import { marketGroup } from '../../../src/commands/market';
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

const depthCommand = marketGroup.commands.find((c) => c.name === 'depth')!;

describe('market depth command', () => {
  test('command is registered in market group', () => {
    expect(depthCommand).toBeDefined();
    expect(depthCommand.name).toBe('depth');
  });

  test('fetches depth with required market param', async () => {
    setGlobalConfigOverrides({ format: 'json' });

    const mockData = {
      timestamp: 1631451591,
      asks: [
        ['50001', '1.5'],
        ['50002', '2.0'],
      ],
      bids: [
        ['49999', '1.2'],
        ['49998', '1.8'],
      ],
    };

    global.fetch = createMockFetch(mockData) as unknown as typeof fetch;

    let output = '';
    const orig = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      output += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await depthCommand.handler!({ flags: { market: 'BTC_USDT' } } as never);
      expect(output).toContain('50001');
      expect(output).toContain('49999');
    } finally {
      process.stdout.write = orig;
    }
  });
});
