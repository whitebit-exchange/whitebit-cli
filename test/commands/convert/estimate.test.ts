import { describe, expect, test } from 'bun:test';

import { convertGroup } from '../../../src/commands/convert';
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

const estimateCommand = convertGroup.commands.find((c) => c.name === 'estimate')!;

describe('convert estimate command', () => {
  test('command is registered in convert group', () => {
    expect(estimateCommand).toBeDefined();
    expect(estimateCommand.name).toBe('estimate');
  });

  test('fetches conversion estimate successfully', async () => {
    setGlobalConfigOverrides({ format: 'json' });

    const mockEstimate = {
      quoteId: 'quote-123',
      from: 'BTC',
      to: 'USDT',
      amount: '1',
      estimatedAmount: '50000',
      rate: '50000',
    };

    global.fetch = createMockFetch(mockEstimate) as unknown as typeof fetch;

    let output = '';
    const orig = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      output += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await estimateCommand.handler!({
        flags: { from: 'BTC', to: 'USDT', amount: '1' },
      } as never);
      expect(output).toContain('quote-123');
      expect(output).toContain('50000');
    } finally {
      process.stdout.write = orig;
    }
  });
});
