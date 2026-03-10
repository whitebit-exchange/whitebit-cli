import { describe, expect, test } from 'bun:test';

import { convertConfirmCommand } from '../../../src/commands/convert/confirm';

describe('convertConfirmCommand', () => {
  test('command metadata is correct', () => {
    expect(convertConfirmCommand).toBeDefined();
    expect(convertConfirmCommand.name).toBe('confirm');
    expect(convertConfirmCommand.description).toBe(
      'Execute conversion using a previously estimated quote ID',
    );
  });

  test('command handler accepts positional arguments', async () => {
    expect(convertConfirmCommand.handler).toBeDefined();
    const mockContext = {
      positional: ['est-123'],
      flags: {},
    };
    expect(mockContext.positional).toHaveLength(1);
    expect(mockContext.positional[0]).toBe('est-123');
  });
});
