import { describe, expect, test } from 'bun:test';

import { collateralGroup } from '../../../src/commands/collateral';
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

const positionsCommand = collateralGroup.commands.find((c) => c.name === 'positions')!;

describe('collateral positions command', () => {
  test('command is registered in collateral group', () => {
    expect(positionsCommand).toBeDefined();
    expect(positionsCommand.name).toBe('positions');
  });

  test('fetches open positions successfully', async () => {
    setGlobalConfigOverrides({ format: 'json' });

    const mockPositions = [
      { id: 1, market: 'BTC_USDT', side: 'long', amount: '0.5' },
      { id: 2, market: 'ETH_USDT', side: 'short', amount: '5.0' },
    ];

    global.fetch = createMockFetch(mockPositions) as unknown as typeof fetch;

    let output = '';
    const orig = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      output += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await positionsCommand.handler!({ flags: {} } as never);
      expect(output).toContain('BTC_USDT');
      expect(output).toContain('ETH_USDT');
    } finally {
      process.stdout.write = orig;
    }
  });

  test('fetches positions with market filter', async () => {
    setGlobalConfigOverrides({ format: 'json' });

    const mockPositions = [{ id: 1, market: 'BTC_USDT', side: 'long', amount: '0.5' }];

    global.fetch = createMockFetch(mockPositions) as unknown as typeof fetch;

    let output = '';
    const orig = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      output += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await positionsCommand.handler!({ flags: { market: 'BTC_USDT' } } as never);
      expect(output).toContain('BTC_USDT');
    } finally {
      process.stdout.write = orig;
    }
  });
});
