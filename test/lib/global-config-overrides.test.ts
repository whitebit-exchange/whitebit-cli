import { describe, expect, test } from 'bun:test';

import { parseGlobalConfigOverrides } from '../../src/lib/global-config-overrides';

describe('parseGlobalConfigOverrides', () => {
  test('parses json flag and profile', () => {
    const overrides = parseGlobalConfigOverrides([
      'market',
      'list',
      '--json',
      '--profile',
      'staging',
    ]);

    expect(overrides).toEqual({
      json: true,
      profile: 'staging',
    });
  });

  test('parses equals syntax and runtime flags', () => {
    const overrides = parseGlobalConfigOverrides([
      'balance',
      'trade',
      '--format=json',
      '--api-key=key',
      '--api-secret=secret',
      '--api-url=https://whitebit.example.com',
      '--dry-run',
      '-V',
    ]);

    expect(overrides).toEqual({
      format: 'json',
      apiKey: 'key',
      apiSecret: 'secret',
      apiUrl: 'https://whitebit.example.com',
      dryRun: true,
      verbose: true,
    });
  });

  test('does not treat lowercase -v as verbose shorthand', () => {
    const overrides = parseGlobalConfigOverrides(['market', 'list', '-v']);

    expect(overrides).toEqual({});
  });

  test('ignores unsupported format values', () => {
    const overrides = parseGlobalConfigOverrides(['market', 'list', '--format', 'xml']);

    expect(overrides).toEqual({});
  });
});
