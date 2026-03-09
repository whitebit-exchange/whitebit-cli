import { describe, expect, test } from 'bun:test';

import { convertEstimateCommand } from '../../../src/commands/convert/estimate';

describe('convertEstimateCommand', () => {
  test('command metadata is correct', () => {
    expect(convertEstimateCommand).toBeDefined();
    expect(convertEstimateCommand.name).toBe('estimate');
    expect(convertEstimateCommand.description).toBe('Estimate conversion rate and amount');
  });
});
