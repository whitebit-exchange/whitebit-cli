import { describe, expect, test } from 'bun:test';

import { subAccountGroup } from '../../../src/commands/sub-account';
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

const transferToSubCommand = subAccountGroup.commands.find((c) => c.name === 'transfer-to-sub')!;
const transferToMainCommand = subAccountGroup.commands.find((c) => c.name === 'transfer-to-main')!;

describe('sub-account transfer commands', () => {
  test('transfer-to-sub is registered', () => {
    expect(transferToSubCommand).toBeDefined();
    expect(transferToSubCommand.name).toBe('transfer-to-sub');
  });

  test('transfer-to-main is registered', () => {
    expect(transferToMainCommand).toBeDefined();
    expect(transferToMainCommand.name).toBe('transfer-to-main');
  });

  test('transfers funds to sub-account successfully', async () => {
    setGlobalConfigOverrides({ format: 'json' });

    global.fetch = createMockFetch({ result: 'success' }) as unknown as typeof fetch;

    let output = '';
    const orig = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      output += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await transferToSubCommand.handler!({
        flags: { id: 'sub-1', ticker: 'BTC', amount: '0.5' },
      } as never);
      expect(output).toContain('success');
    } finally {
      process.stdout.write = orig;
    }
  });

  test('transfers funds from sub-account to main', async () => {
    setGlobalConfigOverrides({ format: 'json' });

    global.fetch = createMockFetch({ result: 'success' }) as unknown as typeof fetch;

    let output = '';
    const orig = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      output += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await transferToMainCommand.handler!({
        flags: { id: 'sub-1', ticker: 'ETH', amount: '1.0' },
      } as never);
      expect(output).toContain('success');
    } finally {
      process.stdout.write = orig;
    }
  });
});
