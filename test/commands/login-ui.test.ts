import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runLogin } from '../../src/commands/login';
import type { LoginUIServerResult } from '../../src/lib/login-ui-server';
import { startLoginUIServer } from '../../src/lib/login-ui-server';

const TRACKED_ENV_KEYS = ['HOME', 'USERPROFILE'] as const;

type TrackedEnv = Record<(typeof TRACKED_ENV_KEYS)[number], string | undefined>;

const captureEnv = (): TrackedEnv => ({
  HOME: process.env.HOME,
  USERPROFILE: process.env.USERPROFILE,
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

interface JsonResponse {
  success: boolean;
  error?: string;
}

describe('login UI server', () => {
  let envSnapshot: TrackedEnv;
  let tempHome: string;
  let serverResult: LoginUIServerResult | null = null;

  beforeEach(async () => {
    envSnapshot = captureEnv();
    tempHome = await mkdtemp(join(tmpdir(), 'whitebit-login-ui-test-'));
    process.env.HOME = tempHome;
    process.env.USERPROFILE = tempHome;
  });

  afterEach(async () => {
    if (serverResult) {
      try {
        const serverUrl = `http://127.0.0.1:${serverResult.server.port}`;
        await fetch(`${serverUrl}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: 'cleanup-key',
            apiSecret: 'cleanup-secret',
          }),
        }).catch(() => {});
        await Promise.race([
          serverResult.promise,
          new Promise((resolve) => setTimeout(resolve, 200)),
        ]);
      } catch {}
      serverResult = null;
    }

    restoreEnv(envSnapshot);
    await rm(tempHome, { recursive: true, force: true });
  });

  test('server serves HTML form with all required fields', async () => {
    serverResult = startLoginUIServer();
    const serverUrl = `http://127.0.0.1:${serverResult.server.port}`;

    const response = await fetch(serverUrl);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/html');

    const html = await response.text();

    expect(html).toContain('<form');
    expect(html).toContain('Profile');
    expect(html).toContain('API Key');
    expect(html).toContain('API Secret');
    expect(html).toContain('API URL');
    expect(html).toContain('id="profile"');
    expect(html).toContain('id="apiKey"');
    expect(html).toContain('id="apiSecret"');
    expect(html).toContain('id="apiUrl"');
  });

  test('valid form submission returns success response', async () => {
    serverResult = startLoginUIServer({ profile: 'testprofile' });
    const serverUrl = `http://127.0.0.1:${serverResult.server.port}`;

    const response = await fetch(`${serverUrl}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: 'testprofile',
        apiKey: 'test-api-key-123',
        apiSecret: 'test-api-secret-456',
        apiUrl: 'https://whitebit.com',
      }),
    });

    const json = (await response.json()) as JsonResponse;
    expect(json).toEqual({ success: true });

    const result = await serverResult.promise;
    expect(result.profile).toBe('testprofile');
    expect(result.apiKey).toBe('test-api-key-123');
    expect(result.apiSecret).toBe('test-api-secret-456');
    expect(result.apiUrl).toBe('https://whitebit.com');
  });

  test('missing apiKey returns validation error', async () => {
    serverResult = startLoginUIServer();
    const serverUrl = `http://127.0.0.1:${serverResult.server.port}`;

    const response = await fetch(`${serverUrl}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: '',
        apiSecret: 'test-secret',
      }),
    });

    const json = (await response.json()) as JsonResponse;
    expect(json.success).toBe(false);
    expect(json.error).toBe('API key is required');
  });

  test('missing apiSecret returns validation error', async () => {
    serverResult = startLoginUIServer();
    const serverUrl = `http://127.0.0.1:${serverResult.server.port}`;

    const response = await fetch(`${serverUrl}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: 'test-key',
        apiSecret: '',
      }),
    });

    const json = (await response.json()) as JsonResponse;
    expect(json.success).toBe(false);
    expect(json.error).toBe('API secret is required');
  });

  test('unknown route returns 404', async () => {
    serverResult = startLoginUIServer();
    const serverUrl = `http://127.0.0.1:${serverResult.server.port}`;

    const response = await fetch(`${serverUrl}/unknown`);
    expect(response.status).toBe(404);
  });

  test('server stops after successful submission', async () => {
    serverResult = startLoginUIServer();
    const serverUrl = `http://127.0.0.1:${serverResult.server.port}`;

    await fetch(`${serverUrl}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: 'test-key',
        apiSecret: 'test-secret',
      }),
    });

    await serverResult.promise;

    await new Promise((resolve) => setTimeout(resolve, 150));

    let connectionFailed = false;
    try {
      await fetch(`${serverUrl}/`, { signal: AbortSignal.timeout(500) });
    } catch {
      connectionFailed = true;
    }

    expect(connectionFailed).toBe(true);
  });

  test('runLogin throws error when --ui combined with --api-key', async () => {
    await expect(
      runLogin({
        ui: true,
        'api-key': 'test-key',
      }),
    ).rejects.toThrow('--ui cannot be combined with --api-key or --api-secret');
  });

  test('runLogin throws error when --ui combined with --api-secret', async () => {
    await expect(
      runLogin({
        ui: true,
        'api-secret': 'test-secret',
      }),
    ).rejects.toThrow('--ui cannot be combined with --api-key or --api-secret');
  });

  test('runLogin throws error when --ui combined with both credentials', async () => {
    await expect(
      runLogin({
        ui: true,
        'api-key': 'test-key',
        'api-secret': 'test-secret',
      }),
    ).rejects.toThrow('--ui cannot be combined with --api-key or --api-secret');
  });
});
