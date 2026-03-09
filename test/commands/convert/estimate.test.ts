import { describe, expect, test } from 'bun:test';

import { convertEstimateCommand } from '../../../src/commands/convert/estimate';

describe('convertEstimateCommand', () => {
  test('command metadata is correct', () => {
    expect(convertEstimateCommand).toBeDefined();
    expect(convertEstimateCommand.name).toBe('estimate');
    expect(convertEstimateCommand.description).toBe('Estimate conversion rate and amount');
  });

  test('command handler accepts positional arguments', async () => {
    expect(convertEstimateCommand.handler).toBeDefined();
    const mockContext = {
      positional: ['BTC', 'USDT', '1'],
      flags: {},
    };
    expect(mockContext.positional).toHaveLength(3);
    expect(mockContext.positional[0]).toBe('BTC');
    expect(mockContext.positional[1]).toBe('USDT');
    expect(mockContext.positional[2]).toBe('1');
  });
});
