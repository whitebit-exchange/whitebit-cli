import { afterEach, beforeEach, describe, expect, spyOn, test } from 'bun:test';
import * as fs from 'node:fs/promises';
import { chmod, mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { loadAuthConfig, loadConfig, saveConfigProfile } from '../../src/lib/config';

const TRACKED_ENV_KEYS = [
  'HOME',
  'USERPROFILE',
  'WHITEBIT_API_KEY',
  'WHITEBIT_API_SECRET',
  'WHITEBIT_API_URL',
] as const;

type TrackedEnv = Record<(typeof TRACKED_ENV_KEYS)[number], string | undefined>;

const captureEnv = (): TrackedEnv => ({
  HOME: process.env.HOME,
  USERPROFILE: process.env.USERPROFILE,
  WHITEBIT_API_KEY: process.env.WHITEBIT_API_KEY,
  WHITEBIT_API_SECRET: process.env.WHITEBIT_API_SECRET,
  WHITEBIT_API_URL: process.env.WHITEBIT_API_URL,
});

const restoreEnv = (env: TrackedEnv): void => {
  for (const key of TRACKED_ENV_KEYS) {
    const value = env[key];
    if (typeof value === 'undefined') {
      delete process.env[key];
      continue;
    }

    process.env[key] = value;
  }
};

const configPathFor = (homePath: string): string => join(homePath, '.whitebit', 'config.toml');

const writeTomlConfig = async (homePath: string, toml: string, mode = 0o600): Promise<string> => {
  const configPath = configPathFor(homePath);
  await mkdir(dirname(configPath), { recursive: true, mode: 0o700 });
  await writeFile(configPath, toml, 'utf8');
  await chmod(configPath, mode);
  return configPath;
};

describe('config loader', () => {
  let envSnapshot: TrackedEnv;
  let tempHome: string;

  beforeEach(async () => {
    envSnapshot = captureEnv();
    tempHome = await mkdtemp(join(tmpdir(), 'whitebit-config-test-'));
    process.env.HOME = tempHome;
    process.env.USERPROFILE = tempHome;
    delete process.env.WHITEBIT_API_KEY;
    delete process.env.WHITEBIT_API_SECRET;
    delete process.env.WHITEBIT_API_URL;
  });

  afterEach(async () => {
    restoreEnv(envSnapshot);
    await rm(tempHome, { recursive: true, force: true });
  });

  test('reads WHITEBIT_API_KEY and WHITEBIT_API_SECRET from env vars', () => {
    process.env.WHITEBIT_API_KEY = 'env-key';
    process.env.WHITEBIT_API_SECRET = 'env-secret';

    const config = loadConfig();

    expect(config.apiKey).toBe('env-key');
    expect(config.apiSecret).toBe('env-secret');
    expect(config.sources.apiKey).toBe('env');
    expect(config.sources.apiSecret).toBe('env');
  });

  test('reads from ~/.whitebit/config.toml default profile when env vars are absent', async () => {
    await writeTomlConfig(
      tempHome,
      [
        '[default]',
        'api_key = "file-key"',
        'api_secret = "file-secret"',
        'default_format = "table"',
        'api_url = "https://whitebit.example.com/"',
      ].join('\n'),
    );

    const config = loadConfig();

    expect(config.apiKey).toBe('file-key');
    expect(config.apiSecret).toBe('file-secret');
    expect(config.apiUrl).toBe('https://whitebit.example.com');
    expect(config.format).toBe('table');
    expect(config.sources.apiKey).toBe('config');
    expect(config.sources.apiSecret).toBe('config');
    expect(config.sources.apiUrl).toBe('config');
    expect(config.sources.format).toBe('config');
  });

  test('reads from named profile when profile is provided', async () => {
    await writeTomlConfig(
      tempHome,
      [
        '[default]',
        'api_key = "default-key"',
        'api_secret = "default-secret"',
        '',
        '[staging]',
        'api_key = "staging-key"',
        'api_secret = "staging-secret"',
      ].join('\n'),
    );

    const config = loadConfig({ profile: 'staging' });

    expect(config.profile).toBe('staging');
    expect(config.apiKey).toBe('staging-key');
    expect(config.apiSecret).toBe('staging-secret');
  });

  test('env vars take precedence over config file', async () => {
    await writeTomlConfig(
      tempHome,
      ['[default]', 'api_key = "file-key"', 'api_secret = "file-secret"'].join('\n'),
    );
    process.env.WHITEBIT_API_KEY = 'env-key';
    process.env.WHITEBIT_API_SECRET = 'env-secret';

    const config = loadConfig();

    expect(config.apiKey).toBe('env-key');
    expect(config.apiSecret).toBe('env-secret');
    expect(config.sources.apiKey).toBe('env');
    expect(config.sources.apiSecret).toBe('env');
  });

  test('CLI flags take precedence over env vars and config file', async () => {
    await writeTomlConfig(
      tempHome,
      ['[default]', 'api_key = "file-key"', 'api_secret = "file-secret"'].join('\n'),
    );
    process.env.WHITEBIT_API_KEY = 'env-key';
    process.env.WHITEBIT_API_SECRET = 'env-secret';

    const config = loadConfig({
      apiKey: 'cli-key',
      apiSecret: 'cli-secret',
    });

    expect(config.apiKey).toBe('cli-key');
    expect(config.apiSecret).toBe('cli-secret');
    expect(config.sources.apiKey).toBe('cli');
    expect(config.sources.apiSecret).toBe('cli');
  });

  test('throws a clear error when auth config is missing credentials', () => {
    expect(() => loadAuthConfig()).toThrow('API credentials are required for this command.');
  });

  test('trims surrounding whitespace from auth credentials', () => {
    process.env.WHITEBIT_API_KEY = '  env-key  ';
    process.env.WHITEBIT_API_SECRET = '\tenv-secret\n';

    const auth = loadAuthConfig();

    expect(auth.apiKey).toBe('env-key');
    expect(auth.apiSecret).toBe('env-secret');
  });

  test('creates config directory and config file with secure permissions', async () => {
    await saveConfigProfile({
      apiKey: 'new-key',
      apiSecret: 'new-secret',
    });

    const configDirPath = join(tempHome, '.whitebit');
    const configPath = configPathFor(tempHome);
    const configDirStats = await stat(configDirPath);
    const configFileStats = await stat(configPath);

    expect(configDirStats.isDirectory()).toBeTrue();
    expect(configDirStats.mode & 0o077).toBe(0);
    expect(configFileStats.mode & 0o777).toBe(0o600);
  });

  test('warns if config file has loose permissions', async () => {
    await writeTomlConfig(
      tempHome,
      ['[default]', 'api_key = "file-key"', 'api_secret = "file-secret"'].join('\n'),
      0o644,
    );

    const stderrSpy = spyOn(process.stderr, 'write').mockImplementation(() => true);

    loadConfig();

    const warning = stderrSpy.mock.calls
      .map(([message]) => String(message))
      .find((message) => message.includes('permissions') && message.includes('0600'));

    expect(warning).toBeDefined();
  });

  test('config file writes are atomic: tmp write followed by rename', async () => {
    const configPath = configPathFor(tempHome);
    const tmpPath = `${configPath}.tmp`;
    const writeFileSpy = spyOn(fs, 'writeFile');
    const renameSpy = spyOn(fs, 'rename');

    await saveConfigProfile({
      profile: 'staging',
      apiKey: 'staging-key',
      apiSecret: 'staging-secret',
    });

    expect(writeFileSpy).toHaveBeenCalledWith(tmpPath, expect.any(String), expect.any(Object));
    expect(renameSpy).toHaveBeenCalledWith(tmpPath, configPath);
    expect(stat(tmpPath)).rejects.toThrow();

    const written = await readFile(configPath, 'utf8');
    expect(written).toContain('[staging]');
    expect(written).toContain('api_key = "staging-key"');
  });

  test('handles missing config file gracefully', () => {
    const config = loadConfig();

    expect(config.apiKey).toBeUndefined();
    expect(config.apiSecret).toBeUndefined();
    expect(config.apiUrl).toBe('https://whitebit.com');
    expect(config.format).toBe('table');
    expect(config.sources.apiKey).toBe('missing');
    expect(config.sources.apiSecret).toBe('missing');
  });
});
