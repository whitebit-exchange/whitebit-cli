import { describe, expect, test } from 'bun:test';

import { convertConfirmCommand } from '../../../src/commands/convert/confirm';

describe('convertConfirmCommand', () => {
  test('command metadata is correct', () => {
    expect(convertConfirmCommand).toBeDefined();
    expect(convertConfirmCommand.name).toBe('confirm');
    expect(convertConfirmCommand.description).toBe('Confirm and execute a conversion');
  });
});
