import { afterEach, describe, expect, spyOn, test, vi } from 'bun:test';

import { formatError, formatOutput } from '../../src/lib/formatter';

const captureWrites = (spy: ReturnType<typeof spyOn>): string =>
  spy.mock.calls.map((args: unknown[]) => String(args[0])).join('');

describe('output formatter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('JSON format outputs { success: true, data } envelope', () => {
    const stdoutSpy = spyOn(process.stdout, 'write').mockImplementation(() => true);

    formatOutput({ ticker: 'BTC_USDT' }, { format: 'json' });

    const parsed = JSON.parse(captureWrites(stdoutSpy));
    expect(parsed).toEqual({
      success: true,
      data: { ticker: 'BTC_USDT' },
    });
  });

  test('JSON error outputs { success: false, error: { code, message, details } }', () => {
    const stderrSpy = spyOn(process.stderr, 'write').mockImplementation(() => true);

    formatError(
      {
        code: 'ERR_TEST',
        message: 'Something failed',
        details: { requestId: 'abc' },
      },
      { format: 'json' },
    );

    const parsed = JSON.parse(captureWrites(stderrSpy));
    expect(parsed).toEqual({
      success: false,
      error: {
        code: 'ERR_TEST',
        message: 'Something failed',
        details: { requestId: 'abc' },
      },
    });
  });

  test('table format renders flat objects as ASCII table', () => {
    const stdoutSpy = spyOn(process.stdout, 'write').mockImplementation(() => true);

    formatOutput(
      {
        market: 'BTC_USDT',
        last_price: '100000',
      },
      { format: 'table' },
    );

    const output = captureWrites(stdoutSpy);
    expect(output).toContain('market');
    expect(output).toContain('last_price');
    expect(output).toContain('BTC_USDT');
    expect(output).toContain('100000');
  });

  test('table format renders arrays as multi-row table', () => {
    const stdoutSpy = spyOn(process.stdout, 'write').mockImplementation(() => true);

    formatOutput(
      [
        { market: 'BTC_USDT', price: '100000' },
        { market: 'ETH_USDT', price: '3000' },
      ],
      { format: 'table' },
    );

    const output = captureWrites(stdoutSpy);
    expect(output).toContain('BTC_USDT');
    expect(output).toContain('ETH_USDT');
    expect(output).toContain('market');
    expect(output).toContain('price');
  });

  test('table format handles empty arrays', () => {
    const stdoutSpy = spyOn(process.stdout, 'write').mockImplementation(() => true);

    formatOutput([], { format: 'table' });

    expect(captureWrites(stdoutSpy)).toContain('No results found');
  });

  test('table format truncates long values (>80 chars)', () => {
    const stdoutSpy = spyOn(process.stdout, 'write').mockImplementation(() => true);
    const longValue = 'x'.repeat(90); // 90 > MAX_TABLE_CELL_LENGTH (80)

    formatOutput([{ note: longValue }], { format: 'table' });

    const output = captureWrites(stdoutSpy);
    expect(output).toContain(`${'x'.repeat(77)}...`); // 80 - 3 = 77
  });
});
