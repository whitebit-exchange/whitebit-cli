import { beforeEach, describe, expect, test } from 'bun:test';

import { accountTransferCommand } from '../../../src/commands/account/transfer';
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

describe('account transfer command', () => {
  beforeEach(() => {
    setGlobalConfigOverrides({
      apiUrl: 'https://whitebit.com',
      apiKey: 'test-key',
      apiSecret: 'test-secret',
      format: 'json',
    });
  });

  test('transfers funds between accounts successfully', async () => {
    const mockResponse = {
      success: true,
      transactionId: 98765,
    };

    global.fetch = createMockFetch(mockResponse);

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await accountTransferCommand.handler({
        flags: {
          ticker: 'BTC',
          amount: '0.1',
          from: 'main',
          to: 'trade',
        },
      } as never);

      expect(capturedOutput).toContain('98765');
    } finally {
      process.stdout.write = originalStdoutWrite;
    }
  });

  test('transfers from trade to main account', async () => {
    const mockResponse = {
      success: true,
      transactionId: 54321,
    };

    global.fetch = createMockFetch(mockResponse);

    let capturedOutput = '';
    const originalStdoutWrite = process.stdout.write;
    process.stdout.write = ((chunk: string) => {
      capturedOutput += chunk;
      return true;
    }) as typeof process.stdout.write;

    try {
      await accountTransferCommand.handler({
        flags: {
          ticker: 'ETH',
          amount: '5.0',
          from: 'trade',
          to: 'main',
        },
      } as never);

      expect(capturedOutput).toContain('54321');
    } finally {
      process.stdout.write = originalStdoutWrite;
    }
  });

  test('handles transfer error', async () => {
    const mockError = { code: 3001, message: 'Insufficient funds in source account' };
    global.fetch = createMockFetch(mockError, 400);

    try {
      await accountTransferCommand.handler({
        flags: {
          ticker: 'BTC',
          amount: '100',
          from: 'main',
          to: 'trade',
        },
      } as never);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('Insufficient funds');
    }
  });
});
